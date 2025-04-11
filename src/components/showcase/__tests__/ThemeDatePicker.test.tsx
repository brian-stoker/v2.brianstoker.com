import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ThemeDatePicker from './ThemeDatePicker';
import AdapterDateFns from '@mui/x-date-pickers/AdapterDateFns';

jest.mock('@mui/material/styles', () => ({
  createMuiTheme: () => ({ palette: { primary: { main: '#fff' }, dark: true } }),
}));

describe('ThemeDatePicker component', () => {
  beforeEach(() => {
    // Create a mock theme for testing
    const theme = { palette: { primary: { main: '#fff' }, dark: true } };
    // Use the AdapterDateFns from @mui/x-date-pickers to date adapter
    const AdapterDateFns = jest.fn();
    AdapterDateFns.mockImplementation(() => ({ getMonth: () => 0, getYear: () => 2023 }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    // Render the component
    const { container } = render(<ThemeDatePicker />);
    expect(container).toBeTruthy();
  });

  describe('prop validation', () => {
    it('should validate prop types', async () => {
      // Define expected props
      const expectedProps = {};

      // Render with invalid props
      const { container } = render(
        <ThemeDatePicker {...expectedProps} displayStaticWrapperAs="invalid" />
      );
      expect(container).not.toBeNull();
    });
  });

  describe('conditional rendering', () => {
    it('should render correctly when displayStaticWrapperAs prop is set to "desktop"', async () => {
      // Render with valid props
      const { container } = render(<ThemeDatePicker displayStaticWrapperAs="desktop" />);
      expect(container).toHaveTextContent(/static date picker/);
    });

    it('should render correctly when displayStaticWrapperAs prop is set to "mobile"', async () => {
      // Render with valid props
      const { container } = render(<ThemeDatePicker displayStaticWrapperAs="mobile" />);
      expect(container).toHaveTextContent(/static date picker/);
    });
  });

  describe('user interactions', () => {
    it('should change the selected date on clicking on the calendar buttons', async () => {
      // Render with valid props
      const { getByRole } = render(<ThemeDatePicker />);
      const prevDate = new Date(2023, 0, 1);
      await waitFor(() => expect(getByRole('button')).toHaveTextContent(prevDate.toLocaleDateString()));
      fireEvent.click(getByRole('button'));
      await waitFor(() => expect(getByRole('button')).toHaveTextContent(new Date(2023, 0, 2).toLocaleDateString()));
    });

    it('should update the selected date when input is changed', async () => {
      // Render with valid props
      const { getByRole } = render(<ThemeDatePicker />);
      await waitFor(() => expect(getByRole('button')).toHaveTextContent(new Date(2023, 0, 1).toLocaleDateString()));
      fireEvent.change(getByRole('input'), { target: { value: '2023-02-01' } });
      await waitFor(() => expect(getByRole('button')).toHaveTextContent(new Date(2023, 0, 2).toLocaleDateString()));
    });

    it('should handle form submission', async () => {
      // Render with valid props
      const { getByRole } = render(<ThemeDatePicker />);
      await waitFor(() => expect(getByRole('button')).toHaveTextContent(new Date(2023, 0, 1).toLocaleDateString()));
      fireEvent.change(getByRole('input'), { target: { value: '2023-02-01' } });
      fireEvent.click(getByRole('button'));
      const form = await Promise.all([getByRole('form')]);
      expect(form[0]).toHaveAttribute('method', 'POST');
    });
  });

  describe('side effects or state changes that should occur', () => {
    it('should update the date state when selected date is changed', async () => {
      // Render with valid props
      const { getByRole } = render(<ThemeDatePicker />);
      await waitFor(() => expect(getByRole('button')).toHaveTextContent(new Date(2023, 0, 1).toLocaleDateString()));
      fireEvent.change(getByRole('input'), { target: { value: '2023-02-01' } });
      await waitFor(() => expect(getByRole('button')).toHaveTextContent(new Date(2023, 0, 2).toLocaleDateString()));
    });

    it('should trigger the date format change event when selected date is changed', async () => {
      // Render with valid props
      const { getByRole } = render(<ThemeDatePicker />);
      await waitFor(() => expect(getByRole('button')).toHaveTextContent(new Date(2023, 0, 1).toLocaleDateString()));
      fireEvent.change(getByRole('input'), { target: { value: '2023-02-01' } });
      const formatChangeEvent = await Promise.all([getByRole('button')].map(button => expect(button).toHaveAttribute('data-date-format-change')));
      expect(formatChangeEvent).toBeTruthy();
    });
  });
});