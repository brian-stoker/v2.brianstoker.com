import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';

describe('Page component', () => {
  it('renders without crashing and displays doc title', async () => {
    const { getByText } = render(<Page />);
    expect(getByText('Doc Title')).toBeInTheDocument();
  });

  it('displays docs on page load', async () => {
    const { getByText } = render(<Page />);
    await waitFor(() => expect(getByText(docs.title)).toBeInTheDocument());
  });

  describe('prop validation', () => {
    it('should throw an error for invalid props', async () => {
      expect(
        () =>
          render(<TopLayoutBlog docs={null} /> || <></>))
        .toThrow();
    });
    it('should validate props successfully with valid props', async () => {
      const { getByText } = render(<Page />);
      await waitFor(() => expect(getByText(docs.title)).toBeInTheDocument());
    });
  });

  describe('user interactions', () => {
    it('clicks on doc title', async () => {
      const { getByText, queryByTitle } = render(<Page />);
      const docLink = getByText(docs.title);
      fireEvent.click(docLink);
      expect(queryByTitle(docs.link)).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('should not render if docs are empty', async () => {
      expect(
        render(<TopLayoutBlog docs={[]} || <></>))
        .not.toContain(document.querySelector('.doc-title'));
    });
  });

  describe('edge cases', () => {
    it('should handle case when docs is undefined', async () => {
      expect(render(<TopLayoutBlog docs={undefined} />)).toBeNull();
    });
  });
});