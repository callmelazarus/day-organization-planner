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
        backgroundColor: '#3a3a3a',
        color: '#e8e8e8',
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Keep going!"
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '1rem',
            borderRadius: 8,
            border: '1px solid #666',
            backgroundColor: '#2b2b2b',
            color: '#e8e8e8',
          }}
        />
        <button type="submit" style={{ backgroundColor: '#2f6b40', color: '#dff2e4' }}>
          Add
        </button>
      </form>

      {orderedTodos.length === 0 ? (
        <p style={{ margin: 0, fontSize: '2rem' }}>💪</p>
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
                backgroundColor: todo.starred ? '#6b5b1f' : '#4a4a4a',
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
                style={{ backgroundColor: '#8a3a3a', color: '#f5d9d9' }}
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
