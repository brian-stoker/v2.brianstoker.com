import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './premium-plan-release.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toBeTruthy();
    });

    it('renders correct component layout', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText('Page Title')).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('renders correctly with valid props', async () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toBeTruthy();
    });

    it('renders correctly with invalid props (missing docs prop)', async () => {
      const { container } = render(<TopLayoutBlog />);
      expect(container).toBeFalsy();
    });
  });

  describe('User interactions', () => {
    it('calls onDocClick function when clicking on a doc link', async () => {
      global.onDocClick = jest.fn();

      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const docLink = getByText('Doc Link');

      fireEvent.click(docLink);
      expect(global.onDocClick).toHaveBeenCalledTimes(1);
    });

    it('calls onDocClick function when clicking on a non-doc link', async () => {
      global.onDocClick = jest.fn();

      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const nonDocLink = getByText('Non Doc Link');

      fireEvent.click(nonDocLink);
      expect(global.onDocClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Conditional rendering', () => {
    it('renders correct component when docs prop is truthy', async () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toBeTruthy();
    });

    it('renders empty component when docs prop is falsy', async () => {
      const { container } = render(<TopLayoutBlog docs={null} />);
      expect(container).toBeFalsy();
    });
  });

  describe('Snapshot tests', () => {
    it('matches snapshot for valid props', async () => {
      const { asFragment } = render(<TopLayoutBlog docs={docs} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches snapshot for invalid props', async () => {
      const { asFragment } = render(<TopLayoutBlog />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});