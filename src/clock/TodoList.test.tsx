import { describe, expect, test, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { TodoList } from './TodoList';
import type { Todo } from './types';

function makeTodo(overrides: Partial<Todo>): Todo {
  return {
    id: 'id',
    text: 'Todo',
    starred: false,
    done: false,
    ...overrides,
  };
}

const noop = (): void => {};
const defaultHandlers = {
  onAdd: noop,
  onDelete: noop,
  onToggleStar: noop,
  onToggleDone: noop,
  onMoveUp: noop,
  onClearAll: noop,
};

describe('TodoList', () => {
  afterEach(() => {
    cleanup();
  });

  test('shows a muscle emoji as the empty-state message when there are no todos', () => {
    render(<TodoList todos={[]} {...defaultHandlers} />);

    expect(screen.getByText('💪')).toBeInTheDocument();
  });

  test('renders each todo\'s text', () => {
    const todos = [makeTodo({ id: '1', text: 'Buy groceries' }), makeTodo({ id: '2', text: 'Walk the dog' })];

    render(<TodoList todos={todos} {...defaultHandlers} />);

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('Walk the dog')).toBeInTheDocument();
  });

  test('the starred todo renders first regardless of input order', () => {
    const todos = [
      makeTodo({ id: '1', text: 'Buy groceries' }),
      makeTodo({ id: '2', text: 'Walk the dog', starred: true }),
      makeTodo({ id: '3', text: 'Read a book' }),
    ];

    render(<TodoList todos={todos} {...defaultHandlers} />);

    const items = screen.getAllByRole('listitem');
    expect(items[0].textContent).toContain('Walk the dog');
  });

  test('submitting the input with the Add button calls onAdd and clears the input', () => {
    const handleAdd = vi.fn();
    render(<TodoList todos={[]} {...defaultHandlers} onAdd={handleAdd} />);

    const input = screen.getByPlaceholderText("Keep going!");
    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(handleAdd).toHaveBeenCalledWith('New task');
    expect(input).toHaveValue('');
  });

  test('pressing Enter in the input calls onAdd', () => {
    const handleAdd = vi.fn();
    render(<TodoList todos={[]} {...defaultHandlers} onAdd={handleAdd} />);

    const input = screen.getByPlaceholderText("Keep going!");
    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.submit(input.closest('form')!);

    expect(handleAdd).toHaveBeenCalledWith('New task');
  });

  test('does not call onAdd for empty or whitespace-only input', () => {
    const handleAdd = vi.fn();
    render(<TodoList todos={[]} {...defaultHandlers} onAdd={handleAdd} />);

    const input = screen.getByPlaceholderText("Keep going!");
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form')!);

    expect(handleAdd).not.toHaveBeenCalled();
  });

  test('clicking a todo\'s star button calls onToggleStar with its id', () => {
    const handleToggleStar = vi.fn();
    const todos = [makeTodo({ id: '1', text: 'Buy groceries' })];

    render(<TodoList todos={todos} {...defaultHandlers} onToggleStar={handleToggleStar} />);

    fireEvent.click(screen.getByRole('button', { name: /star/i }));

    expect(handleToggleStar).toHaveBeenCalledWith('1');
  });

  test('clicking a todo\'s delete button calls onDelete with its id', () => {
    const handleDelete = vi.fn();
    const todos = [makeTodo({ id: '1', text: 'Buy groceries' })];

    render(<TodoList todos={todos} {...defaultHandlers} onDelete={handleDelete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(handleDelete).toHaveBeenCalledWith('1');
  });

  test('clicking a todo\'s move-up button calls onMoveUp with its id', () => {
    const handleMoveUp = vi.fn();
    const todos = [
      makeTodo({ id: '1', text: 'Buy groceries' }),
      makeTodo({ id: '2', text: 'Walk the dog' }),
    ];

    render(<TodoList todos={todos} {...defaultHandlers} onMoveUp={handleMoveUp} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Move up' })[1]);

    expect(handleMoveUp).toHaveBeenCalledWith('2');
  });

  test('the move-up button is disabled for the first todo in each group', () => {
    const todos = [
      makeTodo({ id: '1', text: 'Buy groceries', starred: true }),
      makeTodo({ id: '2', text: 'Walk the dog' }),
    ];

    render(<TodoList todos={todos} {...defaultHandlers} />);

    const [firstMoveUp, secondMoveUp] = screen.getAllByRole('button', { name: 'Move up' });
    expect(firstMoveUp).toBeDisabled();
    expect(secondMoveUp).toBeDisabled();
  });

  test('the clear-all button is disabled when there are no todos', () => {
    render(<TodoList todos={[]} {...defaultHandlers} />);

    expect(screen.getByRole('button', { name: 'Clear all tasks' })).toBeDisabled();
  });

  test('clicking the clear-all button opens a confirmation dialog, and confirming calls onClearAll', () => {
    const handleClearAll = vi.fn();
    const todos = [makeTodo({ id: '1', text: 'Buy groceries' })];

    render(<TodoList todos={todos} {...defaultHandlers} onClearAll={handleClearAll} />);

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

    render(<TodoList todos={todos} {...defaultHandlers} onClearAll={handleClearAll} />);

    fireEvent.click(screen.getByRole('button', { name: 'Clear all tasks' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(handleClearAll).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { name: 'Clear all todos?' })).not.toBeInTheDocument();
  });

  test('clicking a todo\'s Done button calls onToggleDone with its id', () => {
    const handleToggleDone = vi.fn();
    const todos = [makeTodo({ id: '1', text: 'Buy groceries' })];

    render(<TodoList todos={todos} {...defaultHandlers} onToggleDone={handleToggleDone} />);

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(handleToggleDone).toHaveBeenCalledWith('1');
  });

  test('a done todo renders with strikethrough text', () => {
    const todos = [makeTodo({ id: '1', text: 'Buy groceries', done: true })];

    render(<TodoList todos={todos} {...defaultHandlers} />);

    expect(screen.getByText('Buy groceries')).toHaveStyle({ textDecoration: 'line-through' });
  });

  test('a not-done todo renders without strikethrough text', () => {
    const todos = [makeTodo({ id: '1', text: 'Buy groceries', done: false })];

    render(<TodoList todos={todos} {...defaultHandlers} />);

    expect(screen.getByText('Buy groceries')).toHaveStyle({ textDecoration: 'none' });
  });

  test('done todos render at the bottom of the list, below starred and unstarred todos', () => {
    const todos = [
      makeTodo({ id: '1', text: 'Done task', done: true }),
      makeTodo({ id: '2', text: 'Starred task', starred: true }),
      makeTodo({ id: '3', text: 'Plain task' }),
    ];

    render(<TodoList todos={todos} {...defaultHandlers} />);

    const items = screen.getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining('Starred task'),
      expect.stringContaining('Plain task'),
      expect.stringContaining('Done task'),
    ]);
  });

  test('marking a starred todo done still sorts it below not-done todos', () => {
    const todos = [
      makeTodo({ id: '1', text: 'Starred and done', starred: true, done: true }),
      makeTodo({ id: '2', text: 'Plain task' }),
    ];

    render(<TodoList todos={todos} {...defaultHandlers} />);

    const items = screen.getAllByRole('listitem');
    expect(items[0].textContent).toContain('Plain task');
    expect(items[1].textContent).toContain('Starred and done');
  });
});
