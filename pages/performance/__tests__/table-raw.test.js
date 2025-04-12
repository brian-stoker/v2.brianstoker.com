import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TableRaw from './TableRaw';

const mockData = {
  name: 'Frozen yoghurt',
  calories: 159,
  fat: 6.0,
  carbs: 24,
  protein: 4.0,
};

describe('TableRaw', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<TableRaw />);
    expect(container).toBeInTheDocument();
  });

  describe('Conditional Rendering', () => {
    it('renders table head when table is present', () => {
      const { getByRole } = render(
        <React.Fragment>
          <TableRaw />
          <table />
        </React.Fragment>,
      );
      expect(getByRole('heading')).toBeInTheDocument();
    });

    it('does not render table head when table is absent', () => {
      const { queryByRole } = render(<TableRaw />);
      expect(queryByRole('heading')).toBeNull();
    });
  });

  describe('Props Validation', () => {
    it('passes data prop to component', () => {
      const { getByText } = render(
        <TableRaw data={mockData} />,
      );
      expect(getByText(mockData.name)).toBeInTheDocument();
    });

    it('throws error when invalid props are passed', () => {
      expect(() => render(<TableRaw invalidProp="value" />)).toThrowError(
        'Invalid prop: invalidProp',
      );
    });
  });

  describe('User Interactions', () => {
    let table;

    beforeEach(() => {
      table = render(<TableRaw />);
    });

    it('renders data row when user clicks on each cell', () => {
      const cells = [
        { name: mockData.name, calories: mockData.calories },
        { name: 'Pistachio ice cream', calories: 200 },
      ];

      cells.forEach((row) => {
        cells.forEach((cell) => {
          fireEvent.click(table.getByRole('gridcell', { name: cell.name }));
          expect(getByRole('gridcell', { name: row.name })).toBeInTheDocument();
        });
      });
    });

    it('updates input value when user changes input field', () => {
      const inputField = table.getByPlaceholderText('');
      fireEvent.change(inputField, { target: { value: 'new value' } });
      expect(getByRole('gridcell', { name: mockData.name })).toHaveValue(
        'new value',
      );
    });

    it('submits form when user submits input field', () => {
      const submitButton = table.getByText('Submit');
      fireEvent.click(submitButton);
      expect(table.queryByTitle('Form submitted')).toBeNull();
    });
  });

  describe('Snapshots', () => {
    it('renders data rows as expected', () => {
      const { asFragment } = render(<TableRaw />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});