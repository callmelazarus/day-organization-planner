import { describe, expect, test, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTodos } from './useTodos';

describe('useTodos', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('starts empty when nothing is persisted', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual([]);
  });

  test('addTodo appends a new unstarred todo', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Buy groceries');
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0]).toMatchObject({
      text: 'Buy groceries',
      starred: false,
    });
  });

  test('addTodo trims whitespace and ignores empty input', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('  Walk the dog  ');
      result.current.addTodo('   ');
      result.current.addTodo('');
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('Walk the dog');
  });

  test('deleteTodo removes a todo by id', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Buy groceries');
    });
    const id = result.current.todos[0].id;

    act(() => {
      result.current.deleteTodo(id);
    });

    expect(result.current.todos).toEqual([]);
  });

  test('toggleStar stars an unstarred todo', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Buy groceries');
    });
    const id = result.current.todos[0].id;

    act(() => {
      result.current.toggleStar(id);
    });

    expect(result.current.todos[0].starred).toBe(true);
  });

  test('toggleStar on the starred todo unstars it', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Buy groceries');
    });
    const id = result.current.todos[0].id;

    act(() => {
      result.current.toggleStar(id);
      result.current.toggleStar(id);
    });

    expect(result.current.todos[0].starred).toBe(false);
  });

  test('starring a todo unstars whichever other todo was starred', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Buy groceries');
      result.current.addTodo('Walk the dog');
    });
    const [firstId, secondId] = result.current.todos.map((todo) => todo.id);

    act(() => {
      result.current.toggleStar(firstId);
    });
    act(() => {
      result.current.toggleStar(secondId);
    });

    const byId = Object.fromEntries(result.current.todos.map((todo) => [todo.id, todo.starred]));
    expect(byId[firstId]).toBe(false);
    expect(byId[secondId]).toBe(true);
  });

  test('persists todos to localStorage and reloads them', () => {
    const { result, unmount } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Buy groceries');
    });
    unmount();

    const { result: reloaded } = renderHook(() => useTodos());
    expect(reloaded.current.todos).toHaveLength(1);
    expect(reloaded.current.todos[0].text).toBe('Buy groceries');
  });

  test('degrades to an empty array when localStorage holds valid JSON that is not an array', () => {
    localStorage.setItem('circular-clock-mvp:todos', JSON.stringify({ not: 'an array' }));
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual([]);
  });
});
