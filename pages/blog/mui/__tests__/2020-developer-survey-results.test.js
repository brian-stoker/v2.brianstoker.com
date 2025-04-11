import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2020-developer-survey-results.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(page.container).not.toBeNull();
  });

  it('renders TopLayoutBlog with correct props', () => {
    const { container } = page;
    const topLayoutBlog = container.querySelector('TopLayoutBlog');
    expect(topLayoutBlog).toBeInTheDocument();
    expect(topLayoutBlog).toHaveAttribute('docs', docs);
  });

  it('renders TopLayoutBlog with valid props', () => {
    const mockDocs = 'mock-docs';
    render(<Page docs={mockDocs} />);
    const topLayoutBlog = page.getByRole('article');
    expect(topLayoutBlog).toBeInTheDocument();
    expect(topLayoutBlog).toHaveAttribute('docs', mockDocs);
  });

  it('renders TopLayoutBlog with invalid props throws error', () => {
    const mockInvalidProps = null;
    render(<Page docs={mockInvalidProps} />);
    expect(page.getByRole('article')).not.toBeInTheDocument();
  });

  it('calls TopLayoutBlog\'s useEffect hook when rendering', () => {
    jest.spyOn(TopLayoutBlog, 'useEffect');
    render(<Page docs={docs} />);
    expect(TopLayoutBlog.useEffect).toHaveBeenCalledTimes(1);
  });

  it('renders form with valid input changes', () => {
    const { getByPlaceholderText } = page;
    const inputField = getByPlaceholderText('input field');
    fireEvent.change(inputField, { target: { value: 'mock-input' } });
    expect(page.getByRole('textbox')).toHaveValue('mock-input');
  });

  it('renders form without valid input changes', () => {
    const { getByPlaceholderText } = page;
    const inputField = getByPlaceholderText('input field');
    fireEvent.change(inputField, { target: { value: 'mock-input' } });
    expect(page.getByRole('textbox')).toHaveValue('');
  });

  it('submits form without clicking submit', () => {
    const { getByText, getByRole } = page;
    const submitButton = getByText('submit button');
    const inputField = getByPlaceholderText('input field');
    fireEvent.change(inputField, { target: { value: 'mock-input' } });
    expect(getByText('button')).not.toBeDisabled();
  });

  it('submits form and calls submission function', () => {
    const mockSubmitFunction = jest.fn();
    render(<Page docs={docs} submit={mockSubmitFunction} />);
    const inputField = page.getByPlaceholderText('input field');
    const submitButton = page getByText('submit button');
    fireEvent.change(inputField, { target: { value: 'mock-input' } });
    expect(submitButton).not.toBeDisabled();
    fireEvent.click(submitButton);
    expect(mockSubmitFunction).toHaveBeenCalledTimes(1);
  });

  it('renders TopLayoutBlog in document', () => {
    const { getByRole } = page;
    const topLayoutBlog = getByRole('article');
    expect(topLayoutBlog).toBeInTheDocument();
  });

  it('renders TopLayoutBlog with correct theme', () => {
    const { container } = page;
    const theme = 'mock-theme';
    render(<Page docs={docs} theme={theme} />);
    const topLayoutBlog = container.querySelector('TopLayoutBlog');
    expect(topLayoutBlog).toHaveStyle(`--ui-theme: ${theme}`);
  });
});