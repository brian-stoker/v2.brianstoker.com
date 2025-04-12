import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ThemeTabs from './ThemeTabs';

describe('ThemeTabs', () => {
  const component = (props: any) => (
    <ThemeTabs {...props} />
  );

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders without crashing', () => {
    const { container } = render(component({})); // tslint:disable-line:no-any
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders tabs when value is defined', () => {
      const { getAllByRole } = render(component({ value: 0 }));
      const tabs = getAllByRole('tab');
      expect(tabs.length).toBe(3);
    });

    it('does not render tabs when value is undefined', () => {
      const { queryAllByRole } } = render(component({}));
      const tabs = queryAllByRole('tab');
      expect(tabs).toHaveLength(0);
    });
  });

  describe('prop validation', () => {
    it('accepts valid theme props', () => {
      const result = render(component({ value: 1, onChange: jest.fn() }));
      const tabs = document.querySelectorAll(`.${tabsClasses.root}`);
      expect(tabs.length).toBe(3);
      expect(result.container.querySelector(`.${tabClasses.root}`)?.getAttribute('aria-selected')).not.toBe(false);
    });

    it('rejects invalid theme props', () => {
      const result = render(component({ value: 1, onChange: null }));
      expect(result.container.querySelector(`.${tabsClasses.root}`)).toBeNull();
      expect(document.querySelector('div')).toHaveStyleRule('border-radius', '0px');
    });
  });

  describe('user interactions', () => {
    it('calls onChange when tab is clicked', () => {
      const handleChange = jest.fn();
      render(component({ value: 1, onChange: handleChange }));
      const tabs = document.querySelectorAll(`.${tabsClasses.root}`);
      const firstTab = tabs[0];
      fireEvent.click(firstTab);
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('calls onChange with new tab index when tab is clicked', () => {
      const handleChange = jest.fn();
      render(component({ value: 1, onChange: handleChange }));
      const tabs = document.querySelectorAll(`.${tabsClasses.root}`);
      const firstTab = tabs[0];
      fireEvent.click(firstTab);
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(undefined, 0);
    });

    it('calls onChange when tab is selected', () => {
      const handleChange = jest.fn();
      render(component({ value: 1, onChange: handleChange }));
      const tabs = document.querySelectorAll(`.${tabsClasses.root}`);
      const firstTab = tabs[0];
      fireEvent.click(firstTab);
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('calls onChange with new tab index when tab is selected', () => {
      const handleChange = jest.fn();
      render(component({ value: 1, onChange: handleChange }));
      const tabs = document.querySelectorAll(`.${tabsClasses.root}`);
      const firstTab = tabs[0];
      fireEvent.click(firstTab);
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(undefined, 0);
    });
  });

  describe('snapshot testing', () => {
    it('matches the expected HTML snapshot', async () => {
      const result = render(component({ value: 1 }));
      await waitFor(() => { return document.querySelector(`#${tabsClasses.root}`); } as Promise<void>);
      expect(result.container).toMatchSnapshot();
    });
  });
});