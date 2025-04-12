import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './introducing-the-row-grouping-feature.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    jest.clearMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders docs prop correctly', async () => {
      const { container } = render(<TopLayoutBlog docs="test docs" />);
      const docsElement = container.querySelector('.docs-container');
      expect(docsElement).toBeInTheDocument();
    });

    it('does not render docs prop if empty string is passed', async () => {
      const { container } = render(<TopLayoutBlog docs="" />);
      expect(container.querySelector('.docs-container')).not.toBeInTheDocument();
    });

    it('renders default docs if no props are passed', async () => {
      const { container } = render(<TopLayoutBlog />);
      const docsElement = container.querySelector('.docs-container');
      expect(docsElement).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('validates docs prop type correctly', async () => {
      const { container } = render(<TopLayoutBlog docs={123} />);
      expect(container).not.toBeInTheDocument();
    });

    it('invalidates docs prop if invalid type is passed', async () => {
      const { container } = render(<TopLayoutBlog docs={"test" as any} />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('does not trigger onDocLoaded when no props are passed', async () => {
      const { getByText } = render(<TopLayoutBlog />);
      const button = getByText('Load docs');
      fireEvent.click(button);
      expect(document.querySelector('.onDocLoaded')).not.toBeInTheDocument();
    });

    it('triggers onDocLoaded correctly with valid docs prop', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const button = getByText('Load docs');
      fireEvent.click(button);
      expect(document.querySelector('.onDocLoaded')).toBeInTheDocument();
    });

    it('triggers onDocLoaded correctly with empty string as docs prop', async () => {
      const { getByText } = render(<TopLayoutBlog docs="" />);
      const button = getByText('Load docs');
      fireEvent.click(button);
      expect(document.querySelector('.onDocLoaded')).toBeInTheDocument();
    });
  });

  describe('side effects and state changes', () => {
    it('does not trigger onDocLoaded when no props are passed', async () => {
      const { getByText } = render(<TopLayoutBlog />);
      const button = getByText('Load docs');
      fireEvent.click(button);
      expect(document.querySelector('.onDocLoaded')).not.toBeInTheDocument();
    });

    it('triggers onDocLoaded correctly with valid docs prop', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const button = getByText('Load docs');
      fireEvent.click(button);
      expect(document.querySelector('.onDocLoaded')).toBeInTheDocument();
    });

    it('updates state correctly when onDocLoaded is clicked', async () => {
      const { getByText, getByRole } = render(<TopLayoutBlog docs={docs} />);
      const button = getByText('Load docs');
      fireEvent.click(button);
      expect(getByRole('button')).toHaveAttribute('aria-active', 'false');
    });
  });

  it('renders snapshot correctly', async () => {
    const { asFragment } = render(<TopLayoutBlog docs={docs} />);
    expect(asFragment()).toMatchSnapshot();
  });
});