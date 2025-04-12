import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2023-chamonix-retreat.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<TopLayoutBlog docs={docs} />);
    expect(true).toBe(true);
  });

  describe('conditional rendering', () => {
    it('renders doc title if docs prop is truthy', () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('does not render doc title if docs prop is falsy', () => {
      const { queryByText } = render(<TopLayoutBlog docs={} />);
      expect(queryByText(docs.title)).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('passes props to TopLayoutBlog component', () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('throws error if docs prop is invalid', () => {
      expect(() => <TopLayoutBlog docs="invalid" />).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('calls onDocClick callback when doc title is clicked', async () => {
      const onDocClick = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={docs} onDocClick={onDocClick} />);
      expect(getByText(docs.title)).toBeInTheDocument();
      fireEvent.click(getByText(docs.title));
      await waitFor(() => expect(onDocClick).toHaveBeenCalledTimes(1));
    });

    it('calls onDocChange callback when doc content is changed', async () => {
      const onDocChange = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={docs} onDocChange={onDocChange} />);
      expect(getByText(docs.title)).toBeInTheDocument();
      fireEvent.change(document.querySelector('#doc-content'), { target: { value: 'new content' } });
      await waitFor(() => expect(onDocChange).toHaveBeenCalledTimes(1));
    });

    it('calls onSubmit callback when form is submitted', async () => {
      const onSubmit = jest.fn();
      const { getByText, getByPlaceholderText } = render(<TopLayoutBlog docs={docs} onSubmit={onSubmit} />);
      expect(getByText(docs.title)).toBeInTheDocument();
      fireEvent.change(getByPlaceholderText('new content'), { target: { value: 'new content' } });
      fireEvent.submit(document.querySelector('form'));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    });
  });

  describe('side effects', () => {
    it('calls onDocLoad callback when docs prop is loaded', async () => {
      const onDocLoad = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={docs} onDocLoad={onDocLoad} />);
      expect(getByText(docs.title)).toBeInTheDocument();
      await waitFor(() => expect(onDocLoad).toHaveBeenCalledTimes(1));
    });
  });

  describe('snapshot testing', () => {
    it('renders correctly', () => {
      const { asFragment } = render(<TopLayoutBlog docs={docs} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});