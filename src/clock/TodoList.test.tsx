import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
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
    render(<TodoList todos={[]} onAdd={() => {}} onDelete={() => {}} onToggleStar={() => {}} onMoveUp={() => {}} onClearAll={() => {}} />);

    expect(screen.getByText('💪')).toBeInTheDocument();
  });

  test('renders each todo\'s text', () => {
    const todos = [makeTodo({ id: '1', text: 'Buy groceries' }), makeTodo({ id: '2', text: 'Walk the dog' })];

    render(<TodoList todos={todos} onAdd={() => {}} onDelete={() => {}} onToggleStar={() => {}} onMoveUp={() => {}} onClearAll={() => {}} />);

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('Walk the dog')).toBeInTheDocument();
  });

  test('the starred todo renders first regardless of input order', () => {
    const todos = [
      makeTodo({ id: '1', text: 'Buy groceries' }),
      makeTodo({ id: '2', text: 'Walk the dog', starred: true }),
      makeTodo({ id: '3', text: 'Read a book' }),
    ];

    render(<TodoList todos={todos} onAdd={() => {}} onDelete={() => {}} onToggleStar={() => {}} onMoveUp={() => {}} onClearAll={() => {}} />);

    const items = screen.getAllByRole('listitem');
    expect(items[0].textContent).toContain('Walk the dog');
  });

  test('submitting the input with the Add button calls onAdd and clears the input', () => {
    const handleAdd = vi.fn();
    render(<TodoList todos={[]} onAdd={handleAdd} onDelete={() => {}} onToggleStar={() => {}} onMoveUp={() => {}} onClearAll={() => {}} />);

    const input = screen.getByPlaceholderText("Keep going!");
    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(handleAdd).toHaveBeenCalledWith('New task');
    expect(input).toHaveValue('');
  });

  test('pressing Enter in the input calls onAdd', () => {
    const handleAdd = vi.fn();
    render(<TodoList todos={[]} onAdd={handleAdd} onDelete={() => {}} onToggleStar={() => {}} onMoveUp={() => {}} onClearAll={() => {}} />);

    const input = screen.getByPlaceholderText("Keep going!");
    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.submit(input.closest('form')!);

    expect(handleAdd).toHaveBeenCalledWith('New task');
  });

  test('does not call onAdd for empty or whitespace-only input', () => {
    const handleAdd = vi.fn();
    render(<TodoList todos={[]} onAdd={handleAdd} onDelete={() => {}} onToggleStar={() => {}} onMoveUp={() => {}} onClearAll={() => {}} />);

    const input = screen.getByPlaceholderText("Keep going!");
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form')!);

    expect(handleAdd).not.toHaveBeenCalled();
  });

  test('clicking a todo\'s star button calls onToggleStar with its id', () => {
    const handleToggleStar = vi.fn();
    const todos = [makeTodo({ id: '1', text: 'Buy groceries' })];

    render(<TodoList todos={todos} onAdd={() => {}} onDelete={() => {}} onToggleStar={handleToggleStar} onMoveUp={() => {}} onClearAll={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /star/i }));

    expect(handleToggleStar).toHaveBeenCalledWith('1');
  });

  test('clicking a todo\'s delete button calls onDelete with its id', () => {
    const handleDelete = vi.fn();
    const todos = [makeTodo({ id: '1', text: 'Buy groceries' })];

    render(<TodoList todos={todos} onAdd={() => {}} onDelete={handleDelete} onToggleStar={() => {}} onMoveUp={() => {}} onClearAll={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(handleDelete).toHaveBeenCalledWith('1');
  });

  test('clicking a todo\'s move-up button calls onMoveUp with its id', () => {
    const handleMoveUp = vi.fn();
    const todos = [
      makeTodo({ id: '1', text: 'Buy groceries' }),
      makeTodo({ id: '2', text: 'Walk the dog' }),
    ];

    render(<TodoList todos={todos} onAdd={() => {}} onDelete={() => {}} onToggleStar={() => {}} onMoveUp={handleMoveUp} onClearAll={() => {}} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Move up' })[1]);

    expect(handleMoveUp).toHaveBeenCalledWith('2');
  });

  test('the move-up button is disabled for the first todo in each group', () => {
    const todos = [
      makeTodo({ id: '1', text: 'Buy groceries', starred: true }),
      makeTodo({ id: '2', text: 'Walk the dog' }),
    ];

    render(<TodoList todos={todos} onAdd={() => {}} onDelete={() => {}} onToggleStar={() => {}} onMoveUp={() => {}} onClearAll={() => {}} />);

    const [firstMoveUp, secondMoveUp] = screen.getAllByRole('button', { name: 'Move up' });
    expect(firstMoveUp).toBeDisabled();
    expect(secondMoveUp).toBeDisabled();
  });

  test('the clear-all button is disabled when there are no todos', () => {
    render(<TodoList todos={[]} onAdd={() => {}} onDelete={() => {}} onToggleStar={() => {}} onMoveUp={() => {}} onClearAll={() => {}} />);

    expect(screen.getByRole('button', { name: 'Clear all tasks' })).toBeDisabled();
  });

  test('clicking the clear-all button opens a confirmation dialog, and confirming calls onClearAll', () => {
    const handleClearAll = vi.fn();
    const todos = [makeTodo({ id: '1', text: 'Buy groceries' })];

    render(<TodoList todos={todos} onAdd={() => {}} onDelete={() => {}} onToggleStar={() => {}} onMoveUp={() => {}} onClearAll={handleClearAll} />);

    fireEvent.click(screen.getByRole('button', { name: 'Clear all tasks' }));

    const dialog = screen.getByRole('dialog', { name: 'Clear all todos?' });
    expect(dialog).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Clear' }));

    expect(handleClearAll).toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { name: 'Clear all todos?' })).not.toBeInTheDocument();
  });

  test('cancelling the clear-all confirmation does not call onClearAll', () => {
    const handleClearAll = vi.fn();
    const todos = [makeTodo({ id: '1', text: 'Buy groceries' })];

    render(<TodoList todos={todos} onAdd={() => {}} onDelete={() => {}} onToggleStar={() => {}} onMoveUp={() => {}} onClearAll={handleClearAll} />);

    fireEvent.click(screen.getByRole('button', { name: 'Clear all tasks' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(handleClearAll).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { name: 'Clear all todos?' })).not.toBeInTheDocument();
  });
});
