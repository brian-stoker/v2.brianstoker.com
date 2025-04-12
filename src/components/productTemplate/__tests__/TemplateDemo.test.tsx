Here is an example of how you can unit test the provided React component using Jest and the `@testing-library/react` package:
```
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Box, Typography, Link, Frame, SwipeableViews, ActionArea, Button } from 'components'; // assuming these are your components
import App from './App';

describe('App', () => {
  it('renders the component', async () => {
    const { getByText } = render(<App />);
    expect(getByText('Template').toBeInTheDocument()).toBe(true);
  });

  it('navigates to the next template', async () => {
    const { getByText, getByRole } = render(<App />);
    const previousButton = getByRole('button', { name: 'Previous template' });
    fireEvent.click(previousButton);

    await waitFor(() => expect(getByText('Template')).toBeInTheDocument());
  });

  it('navigates to the next template when clicking on a link', async () => {
    const { getByText, getByRole } = render(<App />);
    const link = getByText('Go to store');
    fireEvent.click(link);

    await waitFor(() => expect(getByText('Template')).toBeInTheDocument());
  });

  it('displays the correct template', async () => {
    const { getByText, getByRole } = render(<App />);
    const nextButton = getByRole('button', { name: 'Next template' });
    fireEvent.click(nextButton);

    await waitFor(() => expect(getByText('Template')).toBeInTheDocument());
  });

  it('displays the correct information about the current template', async () => {
    const { getByText, getByRole } = render(<App />);
    const infoBox = getByRole('button', { name: 'Info' });
    fireEvent.click(infoBox);

    await waitFor(() => expect(getByText('Template')).toBeInTheDocument());
  });
});
```
Note that this is just an example and you may need to modify it to fit your specific use case. Additionally, you will likely need to add more tests to cover all the scenarios.

Also, make sure to configure Jest to run in a test environment by adding the following configuration:
```
module.exports = {
  // ... other configurations ...
  testEnvironment: 'jsdom',
};
```
This will allow Jest to run in a headless browser-like environment, which is suitable for testing React components.