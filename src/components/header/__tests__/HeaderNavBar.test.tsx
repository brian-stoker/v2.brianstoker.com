import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import HeaderNavBar from './HeaderNavBar.test.tsx';

describe('HeaderNavBar component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<HeaderNavBar />);
    expect(container).not.toBeNull();
  });

  describe('Conditional rendering', () => {
    it('should render sub menu for products when subMenuOpen is "products"', async () => {
      const { getAllByRole, getByText } = render(
        <HeaderNavBar />,
      );
      await waitFor(() => getAllByRole('menuitem'));
      expect(getByText('Products')).toBeInTheDocument();
      expect(getAllByRole('menuitem')[1]).not.toBeNull();
    });

    it('should render sub menu for docs when subMenuOpen is "docs"', async () => {
      const { getAllByRole, getByText } = render(
        <HeaderNavBar />,
      );
      await waitFor(() => getAllByRole('menuitem'));
      expect(getByText('Docs')).toBeInTheDocument();
      expect(getAllByRole('menuitem')[2]).not.toBeNull();
    });

    it('should not render sub menu when subMenuOpen is null', async () => {
      const { getAllByRole } = render(
        <HeaderNavBar />,
      );
      await waitFor(() => getAllByRole('menuitem'));
      expect(getAllByRole('menuitem')).toHaveLength(0);
    });
  });

  describe('Prop validation', () => {
    it('should throw an error when ROUTES is not provided', async () => {
      const { container } = render(
        <HeaderNavBar />,
      );
      expect(container).not.toBeNull();
      expect(() =>
        HeaderNavBar(),
      ).toThrowError('ROUTES prop is required');
    });

    it('should throw an error when PRODUCTS is not provided', async () => {
      const { container } = render(<HeaderNavBar routes={ROUTES} />);
      expect(container).not.toBeNull();
      expect(() =>
        <HeaderNavBar products={null} routes={ROUTES} />,
      ).toThrowError('PRODUCTS prop is required');
    });
  });

  describe('User interactions', () => {
    it('should focus the first menu item when navigating down', async () => {
      const { getAllByRole, getByText } = render(
        <HeaderNavBar />,
      );
      await waitFor(() => getAllByRole('menuitem'));
      const firstMenuItem = getByText('Art');
      fireEvent.keyDown(firstMenuItem, { key: 'ArrowDown' });
      expect(getByText('Art')).toHaveFocus();
    });

    it('should focus the last menu item when navigating down', async () => {
      const { getAllByRole, getByText } = render(
        <HeaderNavBar />,
      );
      await waitFor(() => getAllByRole('menuitem'));
      const firstMenuItem = getByText('Art');
      fireEvent.keyDown(firstMenuItem, { key: 'ArrowDown', shiftKey: true });
      expect(getByText('Drums')).toHaveFocus();
    });

    it('should focus the last menu item when navigating up', async () => {
      const { getAllByRole, getByText } = render(
        <HeaderNavBar />,
      );
      await waitFor(() => getAllByRole('menuitem'));
      const firstMenuItem = getByText('Art');
      fireEvent.keyDown(firstMenuItem, { key: 'ArrowUp' });
      expect(getByText('Drums')).toHaveFocus();
    });

    it('should focus the last menu item when pressing escape or tab', async () => {
      const { getAllByRole, getByText } = render(
        <HeaderNavBar />,
      );
      await waitFor(() => getAllByRole('menuitem'));
      fireEvent.keyDown(getByText('Art'), { key: 'Escape' });
      expect(getByText('Drums')).toHaveFocus();
    });
  });

  describe('Debounced setSubMenuOpen', () => {
    it('should debounce the change of subMenuOpen to 40ms', async () => {
      const { getByText } = render(
        <HeaderNavBar />,
      );
      await waitFor(() => getByText('Art'));
      const clickButton = getByText('Products');
      fireEvent.click(clickButton);
      expect(getByText('Art')).toHaveFocus();
      setTimeout(async () => {
        expect(getByText('Art')).not.toHaveFocus();
        expect(getByText('Products')).toHaveFocus();
      }, 40);
    });
  });

  describe('Clearing debounced setSubMenuOpen', () => {
    it('should clear the debounced setSubMenuOpen when navigating away from a route', async () => {
      const { getAllByRole, getByText } = render(
        <HeaderNavBar />,
      );
      await waitFor(() => getAllByRole('menuitem'));
      const firstMenuItem = getByText('Art');
      fireEvent.click(firstMenuItem);
      expect(getByText('Art')).toHaveFocus();
      setTimeout(async () => {
        expect(getByText('Art')).not.toHaveFocus();
        expect(getByText('Products')).not.toHaveFocus();
        expect(setSubMenuOpenDebounced).toHaveBeenCalledTimes(0);
      }, 40);
    });
  });

  describe('setSubMenuOpenUndebounce', () => {
    it('should not call setSubMenuOpen when navigating away from a route', async () => {
      const { getByText } = render(
        <HeaderNavBar />,
      );
      await waitFor(() => getByText('Art'));
      const clickButton = getByText('Products');
      fireEvent.click(clickButton);
      expect(getByText('Art')).toHaveFocus();
      setTimeout(async () => {
        expect(getByText('Art')).not.toHaveFocus();
        expect(setSubMenuOpenUndebounce).toHaveBeenCalledTimes(0);
      }, 40);
    });

    it('should call setSubMenuOpen when navigating to a new route', async () => {
      const { getAllByRole, getByText } = render(
        <HeaderNavBar />,
      );
      await waitFor(() => getAllByRole('menuitem'));
      const firstMenuItem = getByText('Art');
      fireEvent.click(firstMenuItem);
      expect(getByText('Art')).toHaveFocus();
      setTimeout(async () => {
        expect(setSubMenuOpenUndebounce).toHaveBeenCalledTimes(1);
      }, 40);
    });
  });
});