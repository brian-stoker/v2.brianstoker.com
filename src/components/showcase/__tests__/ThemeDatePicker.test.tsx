import React from 'react';
import { render } from '@testing-library/react';
import ThemeDatePicker from './ThemeDatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

jest.mock('@mui/material/styles', () => ({
  createTheme: (options) => options,
}));

describe('ThemeDatePicker component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<ThemeDatePicker />);
    expect(container).not.toBeNull();
  });

  describe('conditional rendering', () => {
    it('renders with year calendar when displayStaticWrapperAs is set to desktop', () => {
      const { getByText } = render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <ThemeDatePicker displayStaticWrapperAs="desktop" />
        </LocalizationProvider>
      );
      expect(getByText('2022')).not.toBeNull();
    });

    it('renders with date calendar when displayStaticWrapperAs is set to mobile', () => {
      const { getByText } = render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <ThemeDatePicker displayStaticWrapperAs="mobile" />
        </LocalizationProvider>
      );
      expect(getByText('2022')).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('throws an error when displayStaticWrapperAs prop is not provided', () => {
      const {toThrowError } = render(
        <ThemeDatePicker>
          {() => <div>Test</div>}
        </ThemeDatePicker>
      );
      expect(() => render(<ThemeDatePicker displayStaticWrapperAs={null} />)).toThrowError();
    });

    it('throws an error when displayStaticWrapperAs prop is not one of desktop or mobile', () => {
      const {toThrowError } = render(
        <ThemeDatePicker displayStaticWrapperAs="invalid" />
      );
      expect(() => render(<ThemeDatePicker displayStaticWrapperAs={null} />)).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('calls onDateChange when the date is changed', () => {
      const onChangeMock = jest.fn();
      const { getByLabelText, getByRole } = render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <ThemeDatePicker onDateChange={onChangeMock} />
        </LocalizationProvider>
      );
      const inputField = getByRole('textbox');
      expect(onChangeMock).not.toHaveBeenCalled();

      inputField.value = '2022-01-01';
      inputField.dispatchEvent(new Event('change'));
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('calls onDateSelect when the day is selected', () => {
      const onChangeMock = jest.fn();
      const { getByLabelText, getByRole } = render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <ThemeDatePicker onDateSelect={onChangeMock} />
        </LocalizationProvider>
      );
      const inputField = getByRole('textbox');
      expect(onChangeMock).not.toHaveBeenCalled();

      inputField.value = '2022-01-01';
      inputField.dispatchEvent(new Event('change'));
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('calls onYearSelect when the year is selected', () => {
      const onChangeMock = jest.fn();
      const { getByLabelText, getByRole } = render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <ThemeDatePicker onYearSelect={onChangeMock} />
        </LocalizationProvider>
      );
      const inputField = getByRole('textbox');
      expect(onChangeMock).not.toHaveBeenCalled();

      inputField.value = '2022';
      inputField.dispatchEvent(new Event('change'));
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    it('calls onDateUpdate when the date is updated', () => {
      const onUpdateMock = jest.fn();
      const { getByLabelText, getByRole } = render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <ThemeDatePicker onDateUpdate={onUpdateMock} />
        </LocalizationProvider>
      );
      const inputField = getByRole('textbox');
      expect(onUpdateMock).not.toHaveBeenCalled();

      inputField.value = '2022-01-01';
      inputField.dispatchEvent(new Event('change'));
      expect(onUpdateMock).toHaveBeenCalledTimes(1);
    });
  });
});