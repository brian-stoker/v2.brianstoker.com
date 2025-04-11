import { render } from '@testing-library/react';
import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import store from './store';
import Newsletter from './Newsletter';

describe('Newsletter component', () => {
  it('renders the newsletter form with email input and submit button', () => {
    const { getByPlaceholderText, getByRole, queryByValue } = render(
      <Provider store={store}>
        <Newsletter />
      </Provider>
    );

    expect(getByPlaceholderText('example@email.com')).toBeInTheDocument();
    expect(getByRole('submit')).toBeInTheDocument();
  });

  it('displays a success message after submitting the form', () => {
    const { getByPlaceholderText, getByRole, queryByText } = render(
      <Provider store={store}>
        <Newsletter />
      </Provider>
    );

    const emailInput = getByPlaceholderText('example@email.com');
    const submitButton = getByRole('submit');

    emailInput.value = 'test@example.com';
    submitButton.click();

    expect(queryByText('Go to your email and open the confirmation email')).toBeInTheDocument();
  });

  it('displays a failure message after submitting the form with an error', () => {
    const { getByPlaceholderText, getByRole, queryByText } = render(
      <Provider store={store}>
        <Newsletter />
      </Provider>
    );

    const emailInput = getByPlaceholderText('example@email.com');
    const submitButton = getByRole('submit');

    emailInput.value = 'invalid-email';
    submitButton.click();

    expect(queryByText('Oops! Something went wrong, please try again later')).toBeInTheDocument();
  });

  it('disables the submit button when the form is loading', () => {
    const { getByPlaceholderText, getByRole } = render(
      <Provider store={store}>
        <Newsletter />
      </Provider>
    );

    const emailInput = getByPlaceholderText('example@email.com');
    const submitButton = getByRole('submit');

    expect(submitButton).toHaveAttribute('disabled', 'true');
  });
});

const store = configureStore({
  reducer: {
    form: {
      status: { value: '', submitting: false },
    },
  },
});