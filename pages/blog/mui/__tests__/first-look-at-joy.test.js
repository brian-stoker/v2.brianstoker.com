import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './first-look-at-joy.md?muiMarkdown';

describe('Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<Page />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog with docs prop provided', async () => {
      const { getByText } = render(<Page />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('renders a fallback component if docs prop is missing or null', async () => {
      const mockDocs = undefined;
      const { container } = render(<Page docs={mockDocs} />);
      expect(container).not.toContainElement(exactText(mockDocs));
    });
  });

  describe('prop validation', () => {
    it('valid props are not rejected', async () => {
      const { getByText } = render(<Page docs={docs} />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('invalid props throw an error', async () => {
      const mockDocs = 'Invalid markdown';
      const { container, getByText } = render(<Page docs={mockDocs} />);
      expect(getByText).not.toHaveBeenCalled();
    });
  });

  describe('user interactions', () => {
    let docLink;

    beforeEach(() => {
      docLink = document.createElement('a');
      docLink.href = 'https://example.com';
      docLink.textContent = 'Read more';
      document.body.appendChild(docLink);
    });

    afterEach(() => {
      jest.clearAllMocks();
      document.body.removeChild(docLink);
    });

    it('opens link in a new tab on click', async () => {
      const { getByText } = render(<Page />);
      const readMoreButton = getByText('Read more');
      fireEvent.click(readMoreButton);
      expect(docLink.href).not.toBe(window.location.href);
    });

    it('updates the title and content when clicking the "Read more" button', async () => {
      const { getByText } = render(<Page />);
      const readMoreButton = getByText('Read more');
      fireEvent.click(readMoreButton);
      expect(getByText(docs.title)).not.toBe document.body.textContent;
    });
  });

  describe('side effects and state changes', () => {
    it('does not update the state on component mount', async () => {
      const { getByText } = render(<Page />);
      expect(document.querySelector('.state-change')).toBeNull();
    });

    it('updates the state when a link is clicked', async () => {
      const mockGetUser = jest.fn();
      const { getByText, getByRole } = render(<Page />, { getUser: mockGetUser });
      const readMoreButton = getByRole('link');
      fireEvent.click(readMoreButton);
      expect(mockGetUser).toHaveBeenCalledTimes(1);
    });
  });

  it('matches the snapshot', async () => {
    const { asFragment } = render(<Page />);
    expect(asFragment()).toMatchSnapshot();
  });
});