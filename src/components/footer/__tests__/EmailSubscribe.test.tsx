import * as React from 'react';
import { SxProps } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { NewsletterForm } from './NewsletterForm';

describe('Newsletter Form', () => {
  it('should render the form with correct styling', () => {
    const sx = {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      width: 320,
      padding: 4,
    };

    const { getByText } = render(<NewsletterForm sx={sx} />);
    expect(getByText('Your email')).toBeInTheDocument();
    expect(getByText('Subscribe')).toBeInTheDocument();
    expect(getByText('Oops! Something went wrong, please try again later.')).toBeInTheDocument();
  });

  it('should call handleSubmit when form is submitted', () => {
    const { getByText } = render(<NewsletterForm />);
    const submitButton = getByText('Subscribe');
    submitButton.click();

    expect(window.fetch).toHaveBeenCalledTimes(1);
    expect(window.fetch).toHaveBeenCalledWith('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      mode: 'no-cors',
    });
  });

  it('should render success message after successful submission', () => {
    const { getByText } = render(<NewsletterForm />);
    const submitButton = getByText('Subscribe');
    submitButton.click();

    expect(getByText('Go to your email and open the <strong>confirmation email</strong> to confirm your subscription.')).toBeInTheDocument();
  });

  it('should render error message after failed submission', () => {
    const { getByText } = render(<NewsletterForm />);
    const submitButton = getByText('Subscribe');
    submitButton.click();

    expect(getByText('Oops! Something went wrong, please try again later.')).toBeInTheDocument();
  });
});