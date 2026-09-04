import { useEffect, useState } from 'react';
import type { Todo } from './types';

export interface UseTodosResult {
  todos: Todo[];
  addTodo: (text: string) => void;
  deleteTodo: (id: string) => void;
  toggleStar: (id: string) => void;
  moveTodoUp: (id: string) => void;
}

const STORAGE_KEY = 'circular-clock-mvp:todos';

function loadTodos(): Todo[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Todo[]) : [];
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `todo-${idCounter}-${Date.now()}`;
}

export function useTodos(): UseTodosResult {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  function addTodo(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [...prev, { id: generateId(), text: trimmed, starred: false }]);
  }

  function deleteTodo(id: string): void {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  function toggleStar(id: string): void {
    setTodos((prev) =>
      prev.map((todo) => ({
        ...todo,
        starred: todo.id === id ? !todo.starred : false,
      }))
    );
  }

  function moveTodoUp(id: string): void {
    setTodos((prev) => {
      const index = prev.findIndex((todo) => todo.id === id);
      if (index === -1) return prev;

      const target = prev[index];
      let swapIndex = -1;
      for (let i = index - 1; i >= 0; i -= 1) {
        if (prev[i].starred === target.starred) {
          swapIndex = i;
          break;
        }
      }
      if (swapIndex === -1) return prev;

      const next = [...prev];
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
  }

  return { todos, addTodo, deleteTodo, toggleStar, moveTodoUp };
}
