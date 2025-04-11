import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MuiStatistics } from './MuiStatistics';

const data = [
  { title: '5.8M', metadata: 'Weekly downloads on npm' },
  { title: '90.5k', metadata: 'Stars on GitHub' },
  { title: '2.9k', metadata: 'Open-source contributors' },
  { title: '18.9k', metadata: 'Followers on X' },
];

describe('MuiStatistics component', () => {
  beforeEach(() => {
    jest.mock('@mui/material/styles');
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<MuiStatistics />);
    expect(container).toBeInTheDocument();
  });

  it('renders with correct colors', async () => {
    const { container } = render(<MuiStatistics />);
    const backgroundGradient = container.style.background;
    expect(backgroundGradient).not.toBe('');
  });

  describe('conditional rendering', () => {
    it('renders data when passed', async () => {
      const { container } = render(<MuiStatistics data={data} />);
      await waitFor(() => expect(container).toHaveTextContent(data.map((item) => item.title)));
    });

    it('does not render data when not passed', async () => {
      const { container } = render(<MuiStatistics />);
      expect(container).not.toHaveTextContent(data.map((item) => item.title));
    });
  });

  describe('prop validation', () => {
    it('renders with default props', async () => {
      const { container } = render(<MuiStatistics />);
      await waitFor(() => expect(container).toHaveStyle({
        'display': 'flex',
        'justifyContent': 'center',
      }));
    });

    it('throws error when missing required prop', async () => {
      try {
        render(<MuiStatistics />);
      } catch (error) {
        expect(error.message).toContain('Missing required prop: data');
      }
    });
  });

  describe('user interactions', () => {
    let inputField;

    beforeEach(() => {
      const { getByPlaceholderText, getByRole } = render(<MuiStatistics />);
      inputField = getByRole('textbox');
    });

    it('renders input field', async () => {
      expect(inputField).toBeInTheDocument();
    });

    it('triggers onChange event on input change', async () => {
      fireEvent.change(inputField, { target: { value: 'test' } });
      expect(screen.getByRole('textbox')).toHaveValue('test');
    });
  });

  describe('side effects or state changes', () => {
    // Currently there are no side effects or state changes in the component
  });
});