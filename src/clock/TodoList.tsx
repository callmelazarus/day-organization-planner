import { useState } from 'react';
import type { FormEvent, ReactElement } from 'react';
import type { Todo } from './types';

export interface TodoListProps {
  todos: Todo[];
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
}

export function TodoList({ todos, onAdd, onDelete, onToggleStar }: TodoListProps): ReactElement {
  const [text, setText] = useState('');

  const orderedTodos = [...todos].sort((a, b) => Number(b.starred) - Number(a.starred));

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 420,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#d9d9d9',
        color: '#1a1a1a',
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="What's on your mind?"
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '1rem',
            borderRadius: 8,
            border: '1px solid #aaa',
            backgroundColor: '#d9d9d9',
            color: '#1a1a1a',
          }}
        />
        <button type="submit" style={{ backgroundColor: '#4caf6a', color: '#0d1f13' }}>
          Add
        </button>
      </form>

      {orderedTodos.length === 0 ? (
        <p style={{ margin: 0 }}>No todos yet</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {orderedTodos.map((todo) => (
            <li
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 8,
                backgroundColor: todo.starred ? '#f5e6a3' : '#ececec',
              }}
            >
              <button
                type="button"
                onClick={() => onToggleStar(todo.id)}
                aria-label={todo.starred ? 'Unstar' : 'Star'}
                style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                {todo.starred ? '★' : '☆'}
              </button>
              <span style={{ flex: 1 }}>{todo.text}</span>
              <button
                type="button"
                onClick={() => onDelete(todo.id)}
                style={{ backgroundColor: '#e08585', color: '#3a0d0d' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
