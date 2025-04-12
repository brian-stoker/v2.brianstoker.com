import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2021.md?muiMarkdown';

describe('Page component', () => {
  const initialProps = {
    docs: docs,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', async () => {
    render(<Page />);
    expect(document.body).not.toBeNull();
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog component when provided with valid docs prop', () => {
      const { getByText } = render(<Page />);
      expect(getByText(/Docs/)).toBeInTheDocument();
    });

    it('does not render anything when docs prop is missing', async () => {
      const { queryByTitle } = render(<Page />);
      expect(queryByTitle).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('throws an error when provided with invalid docs prop', () => {
      expect(() =>
        render(<TopLayoutBlog docs={null} />)
      ).toThrowError();
    });

    it('throws an error when provided with non-object docs prop', async () => {
      expect(
        () =>
          render(<TopLayoutBlog docs={{}} /> // Changed to object
        )
      ).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('calls docs prop callback on click', async () => {
      const mockCallback = jest.fn();
      const { getByText } = render(<Page />);
      const clickButton = document.querySelector('button');
      fireEvent.click(clickButton);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('displays docs prop in correct order on page load', async () => {
      const { getByText } = render(<Page />);
      const firstDocTitle = document.querySelector('h2');
      expect(firstDocTitle.textContent).toBe(docs[0].title);
    });

    it('display new docs when docs change', async () => {
      const initialDocs = docs;
      const updatedDocs = [...initialDocs, { title: 'new doc' }];
      const { rerender } = render(<Page />);
      rerender(<Page docs={updatedDocs} />);
      expect(document.body).toHaveTextContent(/new doc$/i);
    });
  });

  describe('snapshots', () => {
    it('displays correct initial state in snapshot test', async () => {
      const { asFragment } = render(<Page />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});