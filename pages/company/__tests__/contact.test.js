import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import * as pageProps from 'src/pages/company/contact/contact.md?muiMarkdown';

describe('Page Component', () => {
  let { getByText, getByRole } = render(<TopLayoutCareers {...pageProps} />);
  const header = getByText('Header');
  const content = getByText('Content');

  beforeEach(() => {
    jest.clearAllMocks();
    render(<TopLayoutCareers {...pageProps} />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it('renders header correctly', () => {
    const mockHeader = getByText('Mock Header');
    expect(mockHeader).toBeInTheDocument();
  });

  it('renders content correctly', () => {
    const mockContent = getByText('Mock Content');
    expect(mockContent).toBeInTheDocument();
  });

  it('calls callback on submit', async () => {
    const callback = jest.fn();
    const form = getByRole('form');
    const submitButton = form.querySelector('button[type="submit"]');
    fireEvent.change(form, { target: { value: 'mock value' } });
    fireEvent.click(submitButton);
    await waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
  });

  it('calls callback with correct data on submit', async () => {
    const callback = jest.fn();
    const form = getByRole('form');
    const submitButton = form.querySelector('button[type="submit"]');
    fireEvent.change(form, { target: { value: 'mock value' } });
    fireEvent.click(submitButton);
    await waitFor(() => expect(callback).toHaveBeenCalledTimes(1));
    expect(callback.mock.calls[0][0]).toHaveProperty('name', 'mock name');
  });

  it('calls callback on input change', async () => {
    const callback = jest.fn();
    const form = getByRole('form');
    const inputField = form.querySelector('input[type="text"]');
    fireEvent.change(inputField, { target: { value: 'mock value' } });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls callback with correct data on input change', async () => {
    const callback = jest.fn();
    const form = getByRole('form');
    const inputField = form.querySelector('input[type="text"]');
    fireEvent.change(inputField, { target: { value: 'mock value' } });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0]).toHaveProperty('name', 'mock name');
  });

  it('renders correctly with invalid props', () => {
    const mockProps = { ...pageProps, invalidProp: 'invalid value' };
    render(<TopLayoutCareers {...mockProps} />);
    expect(getByText('Header')).toBeInTheDocument();
    expect(getByText('Content')).toBeInTheDocument();
  });
});