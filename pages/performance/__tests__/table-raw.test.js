import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { NoSsr } from '@mui/base/NoSsr';
import TableRaw from './TableRaw.test';

describe('TableRaw component', () => {
  let tableRaw;

  beforeEach(() => {
    tableRaw = render(<TableRaw />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(tableRaw).toMatchSnapshot();
  });

  describe('props validation', () => {
    it('renders with valid props', () => {
      const { getByText } = render(<TableRaw />);
      expect(getByText('Frozen yoghurt')).toBeInTheDocument();
    });

    it('throws an error when missing required props', () => {
      const mockConsoleError = jest.spyOn(console, 'error');
      render(<TableRaw />);
      expect(mockConsoleError).toThrow();
    });
  });

  describe('conditional rendering', () => {
    it('renders table rows correctly', () => {
      const { getByText } = render(<TableRaw />);
      const rowTexts = Array.from(getByText('.')).map((text) => text.textContent);
      expect(rowTexts.length).toBe(100);
    });

    it('does not render table rows when NoSsr is disabled', () => {
      const { queryByText } = render(<TableRaw deferred={false} />);
      expect(queryByText('.')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('renders column headers correctly on click', () => {
      const tableHeadCell = document.querySelector('th');
      fireEvent.click(tableHeadCell);
      expect(document.querySelector('table .MuiDataGridColumnHeader')).toBeInTheDocument();
    });

    it('renders input field for filtering data when using search functionality', async () => {
      const { getByLabelText } = render(<TableRaw />);
      await waitFor(() => expect(getByLabelText('Search')).toBeInTheDocument());
      fireEvent.change(getByLabelText('Search'), { target: { value: 'yogurt' } });
      await waitFor(() => expect(tableRaw).toMatchSnapshot());
    });

    it('submits form and updates data correctly', async () => {
      const { getByText, queryByText } = render(<TableRaw />);
      await waitFor(() => expect(getByText('Frozen yoghurt')).toBeInTheDocument());
      fireEvent.change(getByText('Search'), { target: { value: 'yogurt' } });
      await waitFor(() => expect(queryByText('yogurt')).not.toBeInTheDocument());
    });
  });

  describe('side effects', () => {
    it('does not throw an error when NoSsr is disabled', async () => {
      const mockConsoleError = jest.spyOn(console, 'error');
      render(<TableRaw deferred={false} />);
      await waitFor(() => expect(mockConsoleError).not.toHaveBeenCalled());
    });
  });
});