import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { render as renderNext, cleanup, setupTestClient } from './next-env.d.test';
import type { AppProps } from './App';

describe('App component', () => {
  let app;

  beforeEach(async () => {
    const testClient = await setupTestClient();
    app = await renderNext(testClient);
    cleanup(app);
  });

  afterEach(cleanup);

  it('renders without crashing', async () => {
    expect(await renderNext()).not.toBeNull();
  });

  it('renders the navigation bar on page load', async () => {
    const { container } = await renderNext();
    expect(container.querySelector('#nav')).not.toBeNull();
  });

  it('should not be able to disable the navbar', async () => {
    // @ts-ignore
    const disabledProp = { 'aria-disabled': 'disabled' };
    const { getByText } = render(<App {...disabledProp} />);
    expect(getByText('Navbar Button')).not.toBeDisabled();
  });

  it('should be possible to enable/disenable the navbar', async () => {
    // @ts-ignore
    const disabledProp = { 'aria-disabled': '' };
    const { getByText } = render(<App {...disabledProp} />);
    expect(getByText('Navbar Button')).toBeDisabled();

    const navButton = document.querySelector('#nav button')!;
    fireEvent.click(navButton);

    expect(getByText('Navbar Button')).not.toBeDisabled();
  });

  it('should handle form submission', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': '' };
    const { getByText } = render(<App {...submitProp} />);
    const form = document.querySelector('#form');
    fireEvent.change(form.querySelector('input'), { target: { value: 'Test' } });
    fireEvent.click(form.querySelector('button'));

    expect(await renderNext()).not.toBeNull();
  });

  it('should not submit the form when disabled', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': 'disabled' };
    const { getByText } = render(<App {...submitProp} />);
    const form = document.querySelector('#form');
    fireEvent.change(form.querySelector('input'), { target: { value: 'Test' } });
    fireEvent.click(form.querySelector('button'));

    expect(document.querySelector('.alert')).not.toBeNull();
  });

  it('should update the text when the input changes', async () => {
    const { getByText, getByPlaceholderText } = render(<App />);
    const inputField = document.querySelector('input');
    fireEvent.change(inputField, { target: { value: 'Test' } });
    expect(getByText('You entered:')).toHaveTextContent('You entered:');
  });

  it('should display the alert message', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': '' };
    const { getByText, getByRole } = render(<App {...submitProp} />);
    fireEvent.click(getByRole('button'));

    expect(getByText('Form submitted successfully')).not.toBeNull();
  });

  it('should not display the alert message when form is disabled', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': 'disabled' };
    const { getByText, getByRole } = render(<App {...submitProp} />);
    fireEvent.click(getByRole('button'));

    expect(getByText('Form submitted successfully')).toBeNull();
  });

  it('renders the loading message when data is fetching', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': '' };
    const { getByText, getByRole } = render(<App {...submitProp} />);
    fireEvent.click(getByRole('button'));

    await waitFor(() => expect(getByText('Loading...')).toBeInTheDocument());
  });

  it('renders the default message when data is not available', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': '' };
    const { getByText } = render(<App {...submitProp} />);
    fireEvent.click(getByRole('button'));

    expect(getByText('Default message')).toBeInTheDocument();
  });

  it('renders an error message when form submission fails', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': '' };
    const { getByText, getByPlaceholderText } = render(<App {...submitProp} />);
    fireEvent.change(getByPlaceholderText('Input'), { target: { value: '' } });
    fireEvent.click(getByRole('button'));

    expect(getByText('Error message')).toBeInTheDocument();
  });

  it('should not display an error message when form submission succeeds', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': '' };
    const { getByText, getByPlaceholderText } = render(<App {...submitProp} />);
    fireEvent.change(getByPlaceholderText('Input'), { target: { value: 'Test' } });
    fireEvent.click(getByRole('button'));

    expect(getByText('Error message')).toBeNull();
  });

  it('renders the submit button text', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': '' };
    const { getByText, getByPlaceholderText } = render(<App {...submitProp} />);
    expect(getByText('Submit')).toBeInTheDocument();
  });

  it('renders the placeholder text', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': '' };
    const { getByPlaceholderText } = render(<App {...submitProp} />);
    expect(getByPlaceholderText('Input')).toHaveTextContent('Enter your message');
  });

  it('renders the form title', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': '' };
    const { getByText } = render(<App {...submitProp} />);
    expect(getByText('Form Title')).toBeInTheDocument();
  });

  it('should not be able to disable the form title', async () => {
    // @ts-ignore
    const disabledTitleProp = { 'aria-disabled': 'disabled' };
    const { getByText } = render(<App {...disabledTitleProp} />);
    expect(getByText('Form Title')).not.toBeDisabled();
  });

  it('should be possible to enable/disable the form title', async () => {
    // @ts-ignore
    const disabledTitleProp = { 'aria-disabled': '' };
    const { getByText } = render(<App {...disabledTitleProp} />);
    expect(getByText('Form Title')).toBeDisabled();

    const title = document.querySelector('.form-title');
    fireEvent.click(title);

    expect(getByText('Form Title')).not.toBeDisabled();
  });

  it('renders the error message when form submission fails', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': '' };
    const { getByText, getByPlaceholderText } = render(<App {...submitProp} />);
    fireEvent.change(getByPlaceholderText('Input'), { target: { value: '' } });
    fireEvent.click(getByRole('button'));

    expect(getByText('Error message')).toBeInTheDocument();
  });

  it('should not display the error message when form submission succeeds', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': '' };
    const { getByText, getByPlaceholderText } = render(<App {...submitProp} />);
    fireEvent.change(getByPlaceholderText('Input'), { target: { value: 'Test' } });
    fireEvent.click(getByRole('button'));

    expect(getByText('Error message')).toBeNull();
  });

  it('should not be able to disable the form title', async () => {
    // @ts-ignore
    const disabledTitleProp = { 'aria-disabled': 'disabled' };
    const { getByText } = render(<App {...disabledTitleProp} />);
    expect(getByText('Form Title')).not.toBeDisabled();
  });

  it('should be possible to enable/disable the form title', async () => {
    // @ts-ignore
    const disabledTitleProp = { 'aria-disabled': '' };
    const { getByText } = render(<App {...disabledTitleProp} />);
    expect(getByText('Form Title')).toBeDisabled();

    const title = document.querySelector('.form-title');
    fireEvent.click(title);

    expect(getByText('Form Title')).not.toBeDisabled();
  });

  it('should not be able to disable the form', async () => {
    // @ts-ignore
    const disabledFormProp = { 'aria-disabled': 'disabled' };
    const { getByText } = render(<App {...disabledFormProp} />);
    expect(getByText('Form')).not.toBeDisabled();
  });

  it('should be possible to enable/disable the form', async () => {
    // @ts-ignore
    const disabledFormProp = { 'aria-disabled': '' };
    const { getByText } = render(<App {...disabledFormProp} />);
    expect(getByText('Form')).toBeDisabled();

    const form = document.querySelector('.form');
    fireEvent.click(form);

    expect(getByText('Form')).not.toBeDisabled();
  });

  it('renders the submit button when form is enabled', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': '' };
    const { getByRole } = render(<App {...submitProp} />);
    fireEvent.click(getByRole('button'));

    expect(getByText('Submit')).toBeInTheDocument();
  });

  it('renders the cancel button when form is enabled', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': '' };
    const { getByRole } = render(<App {...submitProp} />);
    fireEvent.click(getByRole('button'));

    expect(getByText('Cancel')).toBeInTheDocument();
  });

  it('should not display the cancel button when form is disabled', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': 'disabled' };
    const { getByText, getByRole } = render(<App {...submitProp} />);
    fireEvent.click(getByRole('button'));

    expect(getByText('Cancel')).toBeNull();
  });

  it('renders the form title when form is enabled', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': '' };
    const { getByText } = render(<App {...submitProp} />);
    fireEvent.click(getByRole('button'));

    expect(getByText('Form Title')).toBeInTheDocument();
  });

  it('should not display the form title when form is disabled', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': 'disabled' };
    const { getByText } = render(<App {...submitProp} />);
    fireEvent.click(getByRole('button'));

    expect(getByText('Form Title')).toBeNull();
  });

  it('renders the form when form is enabled', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': '' };
    const { getByText } = render(<App {...submitProp} />);
    fireEvent.click(getByRole('button'));

    expect(getByText('Form')).toBeInTheDocument();
  });

  it('should not display the form when form is disabled', async () => {
    // @ts-ignore
    const submitProp = { 'aria-disabled': 'disabled' };
    const { getByText } = render(<App {...submitProp} />);
    fireEvent.click(getByRole('button'));

    expect(getByText('Form')).toBeNull();
  });
});