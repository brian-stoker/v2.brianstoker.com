import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import EditStatus from './EditStatus.test.tsx';

describe('EditStatus component', () => {
  it('renders without crashing', async () => {
    const { container } = render(<EditStatus />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders all options', async () => {
      const { getByText, getByRole } = render(<EditStatus />);
      const selectElement = getByRole('combobox');
      const openOption = getByText('Open');
      const partiallyFilledOption = getByText('Partially Filled');
      const filledOption = getByText('Filled');
      const rejectedOption = getByText('Rejected');

      expect(openOption).toBeInTheDocument();
      expect(partiallyFilledOption).toBeInTheDocument();
      expect(filledOption).toBeInTheDocument();
      expect(rejectedOption).toBeInTheDocument();

      expect(getByRole('option', { name: 'Open' })).toBeInTheDocument();
      expect(getByRole('option', { name: 'Partially Filled' })).toBeInTheDocument();
      expect(getByRole('option', { name: 'Filled' })).toBeInTheDocument();
      expect(getByRole('option', { name: 'Rejected' })).toBeInTheDocument();
    });

    it('does not render rejected option by default', async () => {
      const { queryByText, getByRole } = render(<EditStatus />);
      const selectElement = getByRole('combobox');
      const partiallyFilledOption = getByText('Partially Filled');
      const filledOption = getByText('Filled');

      expect(queryByText('Rejected')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('passes valid props to the component', async () => {
      const { container } = render(<EditStatus id={1} value="Open" field="status" />);
      expect(container).toBeInTheDocument();
    });

    it('throws error for invalid props (missing id)', async () => {
      const { container } = render(<EditStatus value="Open" field="status" />);
      expect(container).not.toBeInTheDocument();
    });

    it('throws error for invalid props (invalid id type)', async () => {
      const { container } = render(<EditStatus value="Open" field="status" id={null} />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls onChange when select option changes', async () => {
      const handleChangeMock = jest.fn();

      const { getByRole, getByText } = render(<EditStatus id={1} value="Open" field="status" />);
      const selectElement = getByRole('combobox');
      const partiallyFilledOption = getByText('Partially Filled');

      fireEvent.change(selectElement, { target: { value: 'Partially Filled' } });

      expect(handleChangeMock).toHaveBeenCalledTimes(1);
      expect(handleChangeMock).toHaveBeenCalledWith({ event: { target: { value: 'Partially Filled' } } });
    });

    it('calls stopCellEditMode when select option is closed', async () => {
      const handleChangeMock = jest.fn();

      const { getByRole, getByText } = render(<EditStatus id={1} value="Open" field="status" />);
      const selectElement = getByRole('combobox');
      const partiallyFilledOption = getByText('Partially Filled');

      fireEvent.change(selectElement, { target: { value: 'Partially Filled' } });

      const handleCloseMock = jest.fn();
      const MenuProps = {
        onClose: handleCloseMock,
      };

      render(
        <Select
          {...MenuProps}
          onChange={handleChangeMock}
          value="Partially Filled"
          open={true}
        >
          {partiallyFilledOption}
        </Select>
      );

      fireEvent.click(selectElement);

      expect(handleCloseMock).toHaveBeenCalledTimes(1);
    });

    it('calls setEditCellValue and stopCellEditMode when edit cell is saved', async () => {
      const handleChangeMock = jest.fn();
      const apiRefMock = { current: { setEditCellValue: jest.fn() } };

      const { getByRole, getByText } = render(<EditStatus id={1} value="Open" field="status" />);
      const selectElement = getByRole('combobox');
      const partiallyFilledOption = getByText('Partially Filled');

      fireEvent.change(selectElement, { target: { value: 'Partially Filled' } });

      const handleCloseMock = jest.fn();
      const MenuProps = {
        onClose: handleCloseMock,
      };

      render(
        <Select
          {...MenuProps}
          onChange={handleChangeMock}
          value="Partially Filled"
          open={true}
        >
          {partiallyFilledOption}
        </Select>
      );

      fireEvent.click(selectElement);

      expect(apiRefMock.current.setEditCellValue).toHaveBeenCalledTimes(1);
      expect(handleCloseMock).not.toHaveBeenCalled();
    });
  });

  describe('API calls', () => {
    it('makes correct API call when status is saved', async () => {
      const apiCallMock = jest.fn();

      const { getByRole, getByText } = render(<EditStatus id={1} value="Open" field="status" />);
      const selectElement = getByRole('combobox');
      const partiallyFilledOption = getByText('Partially Filled');

      fireEvent.change(selectElement, { target: { value: 'Partially Filled' } });

      const handleCloseMock = jest.fn();
      const MenuProps = {
        onClose: handleCloseMock,
      };

      render(
        <Select
          {...MenuProps}
          onChange={() => apiCallMock('updateStatus')}
          value="Partially Filled"
          open={true}
        >
          {partiallyFilledOption}
        </Select>
      );

      fireEvent.click(selectElement);

      expect(apiCallMock).toHaveBeenCalledTimes(1);
    });
  });
});