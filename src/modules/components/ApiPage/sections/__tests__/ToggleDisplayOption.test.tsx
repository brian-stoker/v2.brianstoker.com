import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ToggleDisplayOption from './ToggleDisplayOption';

describe('ToggleDisplayOption', () => {
  const storageKey = 'apiPage_storage_key';
  let neverHydrated: boolean;
  let updateOptionMock: (newOption: ApiDisplayOptions) => void;

  beforeEach(() => {
    neverHydrated = true;
    updateOptionMock = jest.fn();
  });

  afterEach(() => {
    neverHydrated = true;
    updateOptionMock.mockReset();
  });

  it('renders without crashing', () => {
    const { container } = render(<ToggleDisplayOption displayOption="collapsed" />);
    expect(container).toBeTruthy();
  });

  it('renders all options', () => {
    const { getAllByRole } = render(<ToggleDisplayOption displayOption="table" />);
    const menuItems = getAllByRole('option');
    expect(menuItems.length).toBe(3);
    expect(menuItems[0].textContent).toContain('Table');
    expect(menuItems[1].textContent).toContain('Expanded list');
    expect(menuItems[2].textContent).toContain('Collapsed list');
  });

  it('calls updateOption when a menu item is clicked', () => {
    const { getAllByRole } = render(<ToggleDisplayOption displayOption="collapsed" />);
    const menuItems = getAllByRole('option');
    const firstMenuItem = menuItems[0];
    fireEvent.click(firstMenuItem);
    expect(updateOptionMock).toHaveBeenCalledTimes(1);
  });

  it('renders selected option', () => {
    const { getByText } = render(<ToggleDisplayOption displayOption="expanded" />);
    expect(getByText('Expanded list')).toHaveStyle({ opacity: 1 });
  });

  it('does not render selected option when collapsed', () => {
    const { getByText } = render(<ToggleDisplayOption displayOption="collapsed" />);
    expect(getByText('Collapsed list')).not.toHaveStyle({ opacity: 1 });
  });

  it('calls handleClose when the button is clicked outside of the menu', async () => {
    jest.spyOn(ToggleDisplayOption.prototype, 'handleClose');
    const { getByText } = render(<ToggleDisplayOption displayOption="collapsed" />);
    const button = getByText('View:');
    fireEvent.click(button);
    await waitFor(() => expect(ToggleDisplayOption.prototype.handleClose).toHaveBeenCalledTimes(1));
  });

  it('renders with correct aria attributes', async () => {
    const { container, byRole } = render(<ToggleDisplayOption displayOption="table" />);
    const button = byRole('button');
    expect(button).toHaveAttribute('aria-controls', 'view-switching-button');
    expect(button).toHaveAttribute('aria-haspopup', 'true');
    expect(button).toHaveAttribute('aria-expanded', 'true');

    const menu = byRole('menu');
    expect(menu).toHaveAttribute('aria-labelledby', 'view-switching-button');
  });
});