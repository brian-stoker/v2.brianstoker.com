import * as React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './matheus-wichman-joining.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(page).toBeTruthy();
    });

    it('renders TopLayoutBlog component with docs prop', () => {
      const topLayoutBlog = page.getByRole('heading');
      expect(topLayoutBlog).toBeInTheDocument();
    });

    it('renders docs content', () => {
      const paragraphs = page.getByTestId('paragraphs');
      expect(paragraphs).toHaveLength(3);
    });
  });

  describe('Props validation', () => {
    it('accepts valid docs prop', () => {
      const props = { docs: docs };
      render(<TopLayoutBlog {...props} />);
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('rejects invalid docs prop (null)', () => {
      const props = { docs: null };
      expect(() => render(<TopLayoutBlog {...props} />)).toThrowError();
    });

    it('rejects invalid docs prop (undefined)', () => {
      const props = { docs: undefined };
      expect(() => render(<TopLayoutBlog {...props} />)).toThrowError();
    });
  });

  describe('User interactions', () => {
    it('handles clicks on headings', () => {
      fireEvent.click(page.getByRole('heading'));
      expect(screen.getByRole('listitem')).toBeInTheDocument();
    });

    it('handles input changes in paragraphs', () => {
      const paragraph = page.getByTestId('paragraphs');
      const input = paragraph.querySelector('input');
      fireEvent.change(input, { target: { value: 'new text' } });
      expect(paragraph.querySelector('p')).toHaveTextContent('new text');
    });

    it('handles form submission with valid data', () => {
      const form = page.getByTestId('form');
      const input1 = form.querySelector('input');
      const input2 = form.querySelector('input');
      fireEvent.change(input1, { target: { value: 'value1' } });
      fireEvent.change(input2, { target: { value: 'value2' } });
      fireEvent.submit(form);
      expect(screen.getByRole('listitem')).toBeInTheDocument();
    });

    it('handles form submission with invalid data', () => {
      const form = page.getByTestId('form');
      const input1 = form.querySelector('input');
      const input2 = form.querySelector('input');
      fireEvent.change(input1, { target: { value: 'value1' } });
      fireEvent.change(input2, { target: { value: '' } });
      fireEvent.submit(form);
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('Snapshot tests', () => {
    it('renders as expected', () => {
      render(<Page />);
      expect(page).toMatchSnapshot();
    });
  });
});