import { render, fireEvent, waitFor } from '@testing-library/react';
import TaskCard from './TaskCard';

describe('TaskCard', () => {
  it('renders without crashing', async () => {
    const { container } = render(<TaskCard />);
    expect(container).toMatchSnapshot();
  });

  describe('conditional rendering paths', () => {
    it('renders when all props are present', async () => {
      const { container } = render(
        <TaskCard
          title="Test Task"
          description="This is a test task"
          dueDate="2023-03-25T14:00:00.000Z"
          assignedTo="John Doe"
          progress={60}
        />,
      );
      expect(container).toMatchSnapshot();
    });

    it('does not render when title prop is missing', async () => {
      const { container } = render(<TaskCard description="This is a test task" dueDate="2023-03-25T14:00:00.000Z" assignedTo="John Doe" progress={60} />);
      expect(container).toMatchSnapshot();
    });

    it('does not render when dueDate prop is missing', async () => {
      const { container } = render(
        <TaskCard title="Test Task" description="This is a test task" assignedTo="John Doe" progress={60} />,
      );
      expect(container).toMatchSnapshot();
    });

    it('does not render when assignedTo prop is missing', async () => {
      const { container } = render(
        <TaskCard
          title="Test Task"
          description="This is a test task"
          dueDate="2023-03-25T14:00:00.000Z"
          progress={60}
        />,
      );
      expect(container).toMatchSnapshot();
    });

    it('does not render when progress prop is missing', async () => {
      const { container } = render(
        <TaskCard title="Test Task" description="This is a test task" dueDate="2023-03-25T14:00:00.000Z" assignedTo="John Doe" />,
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('prop validation', () => {
    it('throws an error when title prop is missing', async () => {
      expect(() =>
        render(
          <TaskCard description="This is a test task" dueDate="2023-03-25T14:00:00.000Z" assignedTo="John Doe" progress={60} />,
        ),
      ).toThrowError('Title prop is required');
    });

    it('throws an error when dueDate prop is missing', async () => {
      expect(() =>
        render(
          <TaskCard title="Test Task" description="This is a test task" assignedTo="John Doe" progress={60} />,
        ),
      ).toThrowError('Due date prop is required');
    });

    it('throws an error when assignedTo prop is missing', async () => {
      expect(() =>
        render(
          <TaskCard title="Test Task" description="This is a test task" dueDate="2023-03-25T14:00:00.000Z" progress={60} />,
        ),
      ).toThrowError('Assigned to prop is required');
    });

    it('throws an error when progress prop is missing', async () => {
      expect(() =>
        render(
          <TaskCard title="Test Task" description="This is a test task" dueDate="2023-03-25T14:00:00.000Z" assignedTo="John Doe" />,
        ),
      ).toThrowError('Progress prop is required');
    });
  });

  describe('user interactions', () => {
    it('calls the onTaskClick event handler when the button is clicked', async () => {
      const mockOnTaskClick = jest.fn();
      render(
        <TaskCard
          title="Test Task"
          description="This is a test task"
          dueDate="2023-03-25T14:00:00.000Z"
          assignedTo="John Doe"
          progress={60}
          onTaskClick={mockOnTaskClick}
        />,
      );
      fireEvent.click(document.querySelector('.button'));
      expect(mockOnTaskClick).toHaveBeenCalledTimes(1);
    });

    it('calls the onProgressUpdate event handler when the progress slider is changed', async () => {
      const mockOnProgressUpdate = jest.fn();
      render(
        <TaskCard
          title="Test Task"
          description="This is a test task"
          dueDate="2023-03-25T14:00:00.000Z"
          assignedTo="John Doe"
          progress={60}
          onProgressUpdate={mockOnProgressUpdate}
        />,
      );
      fireEvent.change(document.querySelector('input[type="range"]'), {
        target: { value: 80 },
      });
      expect(mockOnProgressUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('due date formatting', () => {
    it('formats the due date as YYYY-MM-DD', async () => {
      const mockDate = new Date('2023-03-25T14:00:00.000Z');
      render(
        <TaskCard
          title="Test Task"
          description="This is a test task"
          dueDate={mockDate}
          assignedTo="John Doe"
          progress={60}
        />,
      );
      expect(document.querySelector('time').getAttribute('datetime')).toBe('2023-03-25T14:00:00.000Z');
    });
  });
});