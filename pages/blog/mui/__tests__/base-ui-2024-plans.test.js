import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './base-ui-2024-plans.md?muiMarkdown';

describe('Page component', () => {
  let page;
  let doc;

  beforeEach(() => {
    page = render(<Page />);
    doc = page.getByMarkdown().textContent.trim();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('renders without crashing', () => {
    it('should render without crashing', () => {
      expect(page).toMatchSnapshot();
    });
  });

  describe('conditional rendering', () => {
    it('should render docs prop if provided', () => {
      const props = { docs: docs };
      page = render(<Page {...props} />);
      expect(page.getByMarkdown()).toHaveTextContent(doc);
    });

    it('should not render docs prop if not provided', () => {
      const props = {};
      page = render(<Page {...props} />);
      expect(page.getByMarkdown()).toBeNull();
    });
  });

  describe('prop validation', () => {
    let page;

    beforeEach(() => {
      page = render(<Page docs={null} />);
    });

    it('should throw an error if docs prop is not provided', () => {
      expect(() => page.getByMarkdown().textContent).toThrowError();
    });
  });

  describe('user interactions', () => {
    let page;

    beforeEach(() => {
      page = render(<Page />);
    });

    it('should update the markdown text when clicked', async () => {
      const markdownButton = page.getByMarkdown();
      fireEvent.click(markdownButton);
      await waitFor(() => expect(page).toMatchSnapshot());
    });

    it('should handle invalid input', async () => {
      const props = { docs: 'invalid input' };
      page = render(<Page {...props} />);
      const markdownButton = page.getByMarkdown();
      fireEvent.click(markdownButton);
      await waitFor(() => expect(page).toMatchSnapshot());
    });
  });

  describe('side effects or state changes', () => {
    let page;

    beforeEach(() => {
      page = render(<Page />);
    });

    it('should trigger the render method when props change', async () => {
      const newProps = { docs: 'new docs' };
      page = render(<Page {...newProps} />);
      await waitFor(() => expect(page).toMatchSnapshot());
    });
  });
});