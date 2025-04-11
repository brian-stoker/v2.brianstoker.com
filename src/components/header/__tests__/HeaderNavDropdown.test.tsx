Here is an example of how you could write a test for the given React component using Jest and the `@testing-library/react` library:
```
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Helmet } from 'react-helmet';
import { navigate } from 'next/navigation';
import Header from './Header';

jest.mock('next/navigation', () => ({
  useNavigation: () => ({ go: jest.fn(), push: jest.fn() }),
}));

describe('Header component', () => {
  it('renders correctly', async () => {
    const { getByText, getByRole } = render(<Header />);
    expect(getByText('Products')).toBeInTheDocument();
    expect(getByText('Docs')).toBeInTheDocument();
    expect(getByRole('link', { name: 'Pricing' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'About us' })).toBeInTheDocument();
  });

  it('toggles collapse on click', async () => {
    const { getByText, getByRole } = render(<Header />);
    const productsCollapse = getByText('Products');
    fireEvent.click(productsCollapse);
    expect(productsCollapse).not.toHaveClass('collapsed');
    fireEvent.click(productsCollapse);
    expect(productsCollapse).toHaveClass('collapsed');
  });

  it('navigates to correct route on click', async () => {
    const { getByRole } = render(<Header />);
    const pricingLink = getByRole('link', { name: 'Pricing' });
    fireEvent.click(pricingLink);
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
  });

  it('renders correctly with dark theme', async () => {
    global.theme = {
      darkMode: true,
    };
    const { getByText, getByRole } = render(<Header />);
    expect(getByText('Products')).toHaveStyle({ color: 'primary' });
    expect(getByText('Docs')).toHaveStyle({ color: 'primary' });
  });

  it('does not allow navigation when in collapse', async () => {
    const { getByRole } = render(<Header />);
    const productsCollapse = getByText('Products');
    fireEvent.click(productsCollapse);
    fireEvent.click(navigate.go);
    expect(navigate.go).toHaveBeenCalledTimes(1);
  });
});
```
Note that this is just an example and you may need to modify it to fit your specific use case. Additionally, you will need to add the necessary imports and configurations for `@testing-library/react` and other dependencies.

Also, please note that `next/navigation` module is not a real one, you should replace it with the actual navigation library you are using in your project.

Please let me know if this helps!