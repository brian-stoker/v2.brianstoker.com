import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2021-q1-update.md?muiMarkdown';

describe('Page', () => {
  const mockDocs = docs;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={mockDocs} />);
    expect(container).toBeTruthy();
  });

  describe('props validation', () => {
    it('passes valid props', async () => {
      const { container } = render(<TopLayoutBlog docs={mockDocs} />);
      expect(TopLayoutBlog.propsValidProps()).toBe(true);
    });

    it('fails on invalid prop', async () => {
      const invalidPropDoc = ' invalid doc';
      const { container, getByText } = render(
        <TopLayoutBlog docs={invalidPropDoc} />
      );
      expect(getByText(invalidPropDoc)).not.toBeNull();
    });
  });

  describe('conditional rendering', () => {
    it('renders with default props', async () => {
      const { container } = render(<TopLayoutBlog />);
      expect(container).toBeTruthy();
    });

    it('renders docs when provided', async () => {
      const { getByText } = render(<TopLayoutBlog docs={mockDocs} />);
      expect(getByText(mockDocs)).not.toBeNull();
    });
  });

  describe('user interactions', () => {
    it('calls onDocClick handler on click', async () => {
      const onDocClick = jest.fn();
      const { getByText } = render(
        <TopLayoutBlog docs={mockDocs} onDocClick={onDocClick} />
      );
      fireEvent.click(getByText(mockDocs));
      expect(onDocClick).toHaveBeenCalledTimes(1);
    });

    it('calls onDocInputHandler on input change', async () => {
      const onDocInputHandler = jest.fn();
      const { getByText } = render(
        <TopLayoutBlog docs={mockDocs} onDocInputHandler={onDocInputHandler} />
      );
      fireEvent.change(getByText(mockDocs), { target: 'input value' });
      expect(onDocInputHandler).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmitForm handler on form submission', async () => {
      const onSubmithandler = jest.fn();
      const { getByText, getByRole } = render(
        <TopLayoutBlog docs={mockDocs} onSubmitForm={onSubmithandler} />
      );
      fireEvent.change(getByRole('textbox'), { target: 'input value' });
      fireEvent.submit(getByRole('form'));
      expect(onSubmithandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('calls updateDocs API when docs are provided', async () => {
      const updateDocs = jest.fn();
      const { getByText } = render(
        <TopLayoutBlog
          docs={mockDocs}
          onDocClick={updateDocs}
        />
      );
      fireEvent.click(getByText(mockDocs));
      expect(updateDocs).toHaveBeenCalledTimes(1);
    });
  });

  it('renders a snapshot', async () => {
    const { asFragment } = render(<TopLayoutBlog />);
    await waitFor(() => {
      jest.takeSnapshot();
    });
    expect(asFragment()).toMatchSnapshot();
  });
});