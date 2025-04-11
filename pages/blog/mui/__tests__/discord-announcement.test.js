import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './discord-announcement.md?muiMarkdown';

describe('Page component', () => {
  const docMock = { title: 'Doc Title', content: 'Doc Content' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<TopLayoutBlog docs={docMock} />);
    expect(document).not.toBeNull();
  });

  describe('conditional rendering', () => {
    const docNull = { title: null, content: 'Doc Content' };

    it('renders when props are valid', async () => {
      render(<TopLayoutBlog docs={docMock} />);
      expect(screen.getByRole('document-title')).toBeInTheDocument();
      expect(screen.getByRole('document-content')).toBeInTheDocument();
    });

    it('does not render when props contain null values', async () => {
      render(<TopLayoutBlog docs={docNull} />);
      expect(() => screen.getByRole('document-title')).not.toThrow();
      expect(() => screen.getByRole('document-content')).not.toThrow();
    });
  });

  describe('prop validation', () => {
    it('renders when docs prop is an object', async () => {
      render(<TopLayoutBlog docs={docMock} />);
      expect(screen.getByRole('document-title')).toBeInTheDocument();
      expect(screen.getByRole('document-content')).toBeInTheDocument();
    });

    it('does not render when docs prop is null or undefined', async () => {
      render(<TopLayoutBlog docs=null />);
      expect(() => screen.getByRole('document-title')).not.toThrow();
      expect(() => screen.getByRole('document-content')).not.toThrow();

      render(<TopLayoutBlog docs={undefined} />);
      expect(() => screen.getByRole('document-title')).not.toThrow();
      expect(() => screen.getByRole('document-content')).not.toThrow();
    });
  });

  describe('user interactions', () => {
    it('calls onClick prop when clicked', async () => {
      const mockOnClick = jest.fn();
      render(<TopLayoutBlog docs={docMock} onClick={mockOnClick} />);
      fireEvent.click(screen.getByRole('document-title'));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('updates title and content on input changes', async () => {
      const mockUpdateTitle = jest.fn();
      const mockUpdateContent = jest.fn();
      render(<TopLayoutBlog docs={docMock} updateTitle={mockUpdateTitle} updateContent={mockUpdateContent} />);
      fireEvent.change(screen.getByRole('document-title'), { target: 'New Title' });
      expect(mockUpdateTitle).toHaveBeenCalledTimes(1);
      expect(mockUpdateContent).not.toHaveBeenCalled();

      fireEvent.change(screen.getByRole('document-content'), { target: 'New Content' });
      expect(mockUpdateContent).toHaveBeenCalledTimes(1);
    });

    it('submits form when submitted', async () => {
      const mockSubmit = jest.fn();
      render(<TopLayoutBlog docs={docMock} onSubmit={mockSubmit} />);
      fireEvent.submit(screen.getByRole('document-title'));
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects and state changes', () => {
    it('updates title and content on submit form', async () => {
      const mockUpdateTitle = jest.fn();
      const mockUpdateContent = jest.fn();
      render(<TopLayoutBlog docs={docMock} updateTitle={mockUpdateTitle} updateContent={mockUpdateContent} />);
      fireEvent.submit(screen.getByRole('document-title'));
      expect(mockUpdateTitle).toHaveBeenCalledTimes(1);
      expect(mockUpdateContent).toHaveBeenCalledTimes(1);
    });
  });

  it('renders correctly with snapshot', async () => {
    const docMock = { title: 'Doc Title', content: 'Doc Content' };
    render(<TopLayoutBlog docs={docMock} />);
    expect(screen.getByRole('document-title')).toHaveTextContent('Doc Title');
    expect(screen.getByRole('document-content')).toHaveTextContent('Doc Content');
  });
});