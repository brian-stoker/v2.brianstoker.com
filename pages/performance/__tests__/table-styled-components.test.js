import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TableStyledComponents from './TableStyledComponents.test.js';
import { NoSsr as NoSsrMock } from '@mui/material/NoSsr';

jest.mock('@mui/base/NoSsr');

describe('Table Styled Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = render(<TableStyledComponents />);
      expect(container).toBeTruthy();
    });
  });

  describe('Conditional Rendering', () => {
    it('renders table head and body', async () => {
      const { getByRole, queryByRole } = render(<TableStyledComponents />);
      const tableHead = getByRole('heading', 'tablehead');
      const tableBody = getByRole('listitem', 'row');

      expect(tableHead).toBeTruthy();
      expect(tableBody).toBeTruthy();
    });

    it('renders table row and cell', async () => {
      const { queryByRole, queryByText } = render(<TableStyledComponents />);
      const tableRow = queryByRole('row');
      const tableCell = queryByText('Dessert (100g serving)');

      expect(tableRow).toBeTruthy();
      expect(tableCell).toBeTruthy();
    });

    it('does not render empty rows', async () => {
      const { queryAllByRole } = render(<TableStyledComponents />);
      const rows = await queryAllByRole('row');
      expect(rows).toHaveLength(100);
    });
  });

  describe('Props Validation', () => {
    it('accepts valid component prop', async () => {
      const { getByText, queryByText } = render(<TableStyledComponents component="div" />);
      const divComponent = getByText('div');

      expect(divComponent).toBeTruthy();
    });

    it('rejects invalid component prop', async () => {
      const { getByText, queryByText } = render(<TableStyledComponents component="invalid-component" />);
      expect(getByText('invalid-component')).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('clicks table row', async () => {
      const { getByRole, queryByRole } = render(<TableStyledComponents />);
      const tableRow = await queryByRole('row');
      const clickEvent = new MouseEvent('click');

      fireEvent.click(tableRow, clickEvent);
      expect(queryByRole).not.toBeDefined();
    });

    it('enters text into table cell', async () => {
      const { getByText, queryByText } = render(<TableStyledComponents />);
      const tableCell = await queryByText('Dessert (100g serving)');
      const inputField = await getByRole('textbox');

      fireEvent.change(inputField, new Event('change'));
      expect(queryByText('Dessert')).toBeNull();
    });

    it('submits form', async () => {
      const { getByText, queryByText } = render(<TableStyledComponents />);
      const submitButton = await getByRole('button');
      const inputField = await getByRole('textbox');

      fireEvent.change(inputField, new Event('change'));
      fireEvent.click(submitButton);
    });
  });

  describe('Side Effects', () => {
    it('renders table data correctly', async () => {
      const { getByText, queryByText } = render(<TableStyledComponents />);
      const tableHead = await getByRole('heading', 'tablehead');
      const tableBody = await getByRole('listitem', 'row');

      expect(tableHead).toHaveClass('pink');
      expect(tableBody).toHaveClass('pink');
    });
  });

  describe('Snapshots', () => {
    it('renders correctly with snapshot test', async () => {
      const { asFragment } = render(<TableStyledComponents />);
      await waitFor(() => {
        expect(asFragment()).toMatchSnapshot();
      });
    });
  });
});