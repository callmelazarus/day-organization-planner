import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TodoList } from './TodoList';
import type { Todo } from './types';

function makeTodo(overrides: Partial<Todo>): Todo {
  return {
    id: 'id',
    text: 'Todo',
    starred: false,
    ...overrides,
  };
}

describe('TodoList', () => {
  afterEach(() => {
    cleanup();
  });

  test('shows a muscle emoji as the empty-state message when there are no todos', () => {
    render(<TodoList todos={[]} onAdd={() => {}} onDelete={() => {}} onToggleStar={() => {}} />);

    expect(screen.getByText('💪')).toBeInTheDocument();
  });

  test('renders each todo\'s text', () => {
    const todos = [makeTodo({ id: '1', text: 'Buy groceries' }), makeTodo({ id: '2', text: 'Walk the dog' })];

    render(<TodoList todos={todos} onAdd={() => {}} onDelete={() => {}} onToggleStar={() => {}} />);

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('Walk the dog')).toBeInTheDocument();
  });

  test('the starred todo renders first regardless of input order', () => {
    const todos = [
      makeTodo({ id: '1', text: 'Buy groceries' }),
      makeTodo({ id: '2', text: 'Walk the dog', starred: true }),
      makeTodo({ id: '3', text: 'Read a book' }),
    ];

    render(<TodoList todos={todos} onAdd={() => {}} onDelete={() => {}} onToggleStar={() => {}} />);

    const items = screen.getAllByRole('listitem');
    expect(items[0].textContent).toContain('Walk the dog');
  });

  test('submitting the input with the Add button calls onAdd and clears the input', () => {
    const handleAdd = vi.fn();
    render(<TodoList todos={[]} onAdd={handleAdd} onDelete={() => {}} onToggleStar={() => {}} />);

    const input = screen.getByPlaceholderText("Keep going!");
    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(handleAdd).toHaveBeenCalledWith('New task');
    expect(input).toHaveValue('');
  });

  test('pressing Enter in the input calls onAdd', () => {
    const handleAdd = vi.fn();
    render(<TodoList todos={[]} onAdd={handleAdd} onDelete={() => {}} onToggleStar={() => {}} />);

    const input = screen.getByPlaceholderText("Keep going!");
    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.submit(input.closest('form')!);

    expect(handleAdd).toHaveBeenCalledWith('New task');
  });

  test('does not call onAdd for empty or whitespace-only input', () => {
    const handleAdd = vi.fn();
    render(<TodoList todos={[]} onAdd={handleAdd} onDelete={() => {}} onToggleStar={() => {}} />);

    const input = screen.getByPlaceholderText("Keep going!");
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form')!);

    expect(handleAdd).not.toHaveBeenCalled();
  });

  test('clicking a todo\'s star button calls onToggleStar with its id', () => {
    const handleToggleStar = vi.fn();
    const todos = [makeTodo({ id: '1', text: 'Buy groceries' })];

    render(<TodoList todos={todos} onAdd={() => {}} onDelete={() => {}} onToggleStar={handleToggleStar} />);

    fireEvent.click(screen.getByRole('button', { name: /star/i }));

    expect(handleToggleStar).toHaveBeenCalledWith('1');
  });

  test('clicking a todo\'s delete button calls onDelete with its id', () => {
    const handleDelete = vi.fn();
    const todos = [makeTodo({ id: '1', text: 'Buy groceries' })];

    render(<TodoList todos={todos} onAdd={() => {}} onDelete={handleDelete} onToggleStar={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(handleDelete).toHaveBeenCalledWith('1');
  });
});
