import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ThemeChip from './ThemeChip';

describe('ThemeChip', () => {
  let wrapper: any;
  let theme: any;

  beforeEach(() => {
    theme = {
      applyDarkStyles: jest.fn(),
      palette: {
        primary: {
          main: '#333',
          dark: '#666',
          light: '#000',
          contrastText: 'white',
        },
        success: {
          main: '#34C759',
          dark: '#2E865F',
          light: '#33CC59',
          contrastText: 'black',
        },
        warning: {
          main: '#FF9800',
          dark: '#FFB200',
          light: '#FFF',
          contrastText: 'black',
        },
        error: {
          main: '#E91E63',
          dark: '#C80039',
          light: '#FF69B4',
          contrastText: 'white',
        },
      },
    };

    wrapper = render(
      <ThemeChip theme={theme} />
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(wrapper).toBeTruthy();
  });

  describe('props', () => {
    it('should validate props', () => {
      expect(
        render(
          <ThemeChip theme={theme} color="invalid" />
        )
      ).toThrowError();

      expect(
        render(
          <ThemeChip theme={theme} size="small" />
        )
      ).not.toThrowError();
    });

    it('should display Chip component with correct props', () => {
      const chip = wrapper.queryByRole('button');
      expect(chip).toBeInTheDocument();
      expect(chip?.getAttribute('color')).toBe('primary');
      expect(chip?.getAttribute('size')).toBe('small');
    });
  });

  describe('conditional rendering', () => {
    it('should render Chip component with correct color', () => {
      const chip = wrapper.queryByRole('button');
      expect(chip).toBeInTheDocument();
      expect(chip?.getAttribute('color')).toBe('primary');

      chip = wrapper.queryByRole('button', { exact: false });
      expect(chip).toBeInTheDocument();
      expect(chip?.getAttribute('color')).toBe('warning');

      chip = wrapper.queryByRole('button', { exact: false, exactMatch: false });
      expect(chip).toBeInTheDocument();
      expect(chip?.getAttribute('color')).toBe('success');
    });

    it('should render Chip component with correct size', () => {
      const chip = wrapper.queryByRole('button', { exact: false });
      expect(chip).toBeInTheDocument();
      expect(chip?.getAttribute('size')).toBe('small');

      chip = wrapper.queryByRole('button', { exactMatch: false });
      expect(chip).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should call onClick on Chip component when clicked', async () => {
      const handleItemClick = jest.fn();

      const chip = wrapper.getByRole('button');
      fireEvent.click(chip);

      await waitFor(() => expect(handleItemClick).toHaveBeenCalledTimes(1));
    });
  });

  describe('side effects', () => {
    it('should apply dark theme styles correctly', async () => {
      const applyDarkStylesMock = jest.fn(theme.applyDarkStyles);
      theme.applyDarkStyles = applyDarkStylesMock;

      await waitFor(() => expect(applyDarkStylesMock).toHaveBeenCalledTimes(1));
    });
  });

  it('renders snapshot', async () => {
    const wrapperSnapshot = render(
      <ThemeChip theme={theme} />
    );

    await waitFor(() => expect(wrapperSnapshot).toMatchSnapshot());
  });
});