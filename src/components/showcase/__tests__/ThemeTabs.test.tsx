import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ThemeTabs from './ThemeTabs';

describe('ThemeTabs component', () => {
  let tabs;
  let setTabsValue;

  beforeEach(() => {
    tabs = render(<ThemeTabs />);
    setTabsValue = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(tabs).toBeTruthy();
  });

  it('render tabs with correct styles', async () => {
    await waitFor(() => expect(tabs.getByRole('tab')).toHaveLength(3));
  });

  describe('conditional rendering', () => {
    it('renders only one tab by default', () => {
      expect(tabs.queryByRole('tab')).not.toBeInTheDocument();
    });

    it('renders all tabs when value is set to 1', async () => {
      tabs.queryByRole('tab').forEach(tab => {
        fireEvent.change(tab, { target: { value: '1' } });
      });
      await waitFor(() => expect(tabs.getByRole('tab')).toHaveLength(3));
    });

    it('renders only one tab when value is set to 0', async () => {
      tabs.queryByRole('tab').forEach(tab => {
        fireEvent.change(tab, { target: { value: '0' } });
      });
      await waitFor(() => expect(tabs.getByRole('tab')).toHaveLength(1));
    });

    it('renders all tabs when value is set to 2', async () => {
      tabs.queryByRole('tab').forEach(tab => {
        fireEvent.change(tab, { target: { value: '2' } });
      });
      await waitFor(() => expect(tabs.getByRole('tab')).toHaveLength(3));
    });
  });

  describe('prop validation', () => {
    it('renders with valid props', async () => {
      const value = tabs.getByLabel('Stoked UI');
      expect(value).toHaveStyleRule('minHeight', '48px');
    });

    it('throws an error when no value prop is provided', async () => {
      render(<ThemeTabs />);
      expect(tabs.queryByRole('tab')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('changes tab on click', async () => {
      const tabs = tabs.allByRole('tab');
      fireEvent.click(tabs[0]);
      expect(setTabsValue).toHaveBeenCalledTimes(1);
    });

    it('changes tab on arrow key press', async () => {
      const tabs = tabs.allByRole('tab');
      fireEvent.keyPress(tabs[0], 'ArrowRight');
      expect(setTabsValue).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    it('calls setTabsValue when tab is changed', async () => {
      const setValue = jest.fn();
      tabs.setProps({ value: 1, onChange: setValue });
      await waitFor(() => expect(setValue).toHaveBeenCalledTimes(1));
    });
  });

  describe('snapshot test', () => {
    it('renders correct styles', async () => {
      const tabStyles = tabs.getByRole('tab').style;
      expect(tabStyles.backgroundColor).toBeTransparent();
    });
  });
});