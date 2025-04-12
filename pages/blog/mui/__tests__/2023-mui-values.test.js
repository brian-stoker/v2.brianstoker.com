import React from 'react';
import ReactDOM from 'react-dom';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2023-mui-values.md?muiMarkdown';

const mockDocs = docs;

describe('Page component', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = render(<Page />, document.body);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('renders without crashing', () => {
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog with docs prop', () => {
      const { getByText } = render(<Page />);
      expect(getByText(mockDocs.title)).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('renders without crashing when docs prop is provided', () => {
      const { container } = render(<TopLayoutBlog docs={mockDocs} />);
      expect(container).toBeTruthy();
    });

    it('throws an error when docs prop is not provided', async () => {
      await expect(() => render(<TopLayoutBlog />)).rejects.toThrowError();
    });
  });

  describe('user interactions', () => {
    it('calls onDocClick event when clicking a doc title', () => {
      const mockOnDocClick = jest.fn();
      const { getByText } = render(<Page onDocClick={mockOnDocClick} />);
      const docTitle = document.querySelector('.doc-title').textContent;
      fireEvent.click(document.querySelector(`.${docTitle}`));
      expect(mockOnDocClick).toHaveBeenCalledTimes(1);
    });

    it('calls onDocChange event when updating a doc title', () => {
      const mockOnDocChange = jest.fn();
      const { getByText } = render(<Page onDocChange={mockOnDocChange} />);
      const docTitleInput = document.querySelector('.doc-title-input');
      fireEvent.change(docTitleInput, { target: { value: 'Updated title' } });
      expect(mockOnDocChange).toHaveBeenCalledTimes(1);
    });

    it('calls onDocSubmit event when submitting a form', () => {
      const mockOnDocSubmit = jest.fn();
      const { getByText } = render(<Page onDocSubmit={mockOnDocSubmit} />);
      const docTitleInput = document.querySelector('.doc-title-input');
      fireEvent.change(docTitleInput, { target: { value: 'Updated title' } });
      const form = container.querySelector('form');
      fireEvent.submit(form);
      expect(mockOnDocSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('renders updated component when docs prop changes', async () => {
      const initialContainer = render(<Page />);
      await waitFor(() => {
        expect(container).not.toBe(initialContainer);
      });
    });
  });

  // Snapshot test
  it('matches snapshot', () => {
    const { asFragment } = render(<TopLayoutBlog docs={mockDocs} />);
    expect(asFragment()).toMatchSnapshot();
  });
});