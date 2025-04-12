import React from 'react';
import PropTypes from 'prop-types';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TableEmotion from './TableEmotion.test.js';

describe('TableEmotion', () => {
  const tableData = [
    { name: 'Frozen yoghurt', calories: 159, fat: 6.0, carbs: 24, protein: 4.0 },
    // Add more data here...
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders without crashing', () => {
    it('should render the component', async () => {
      const { container } = render(<TableEmotion />);
      expect(container).toBeTruthy();
    });
  });

  describe('conditional rendering', () => {
    it('renders table rows when data is provided', async () => {
      const { getAllByRole } = render(<TableEmotion data={tableData} />);
      const rows = await getAllByRole('row');
      expect(rows.length).toBe(2);
    });

    it('does not render table rows when no data is provided', async () => {
      const { queryAllByRole } = render(<TableEmotion />);
      const rows = await queryAllByRole('row');
      expect(rows).toHaveLength(0);
    });
  });

  describe('prop validation', () => {
    it('should validate the component type prop', () => {
      expect(PropTypes.elementType).toBeValidAgainst({
        component: 'div',
      });
      expect(PropTypes.elementType).not.toBeValidAgainst({
        component: 'invalid-type',
      });
    });

    it('should not throw an error when a valid prop is passed', async () => {
      const { render, queryAllByRole } = render(<TableEmotion data={tableData} />);
      const rows = await queryAllByRole('row');
      expect(rows.length).toBe(2);
    });

    it('should throw an error when an invalid prop is passed', async () => {
      expect(() =>
        render(
          <TableEmotion
            component="div"
            data={tableData}
            onChange={() => {}}
          />,
        ),
      ).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('should not throw an error when the user changes the row count', async () => {
      const { getAllByRole } = render(<TableEmotion data={tableData} />);
      const rows = await getAllByRole('row');
      fireEvent.change(rows[0], { target: { value: '10' } });
      expect(rows).toHaveLength(1);
    });

    it('should not throw an error when the user clicks on a row', async () => {
      const { getAllByRole, getByText } = render(<TableEmotion data={tableData} />);
      const row = await getByText(tableData[0].name);
      fireEvent.click(row);
      expect(row).toHaveClass('active');
    });
  });

  describe('snapshots', () => {
    it('should render the correct layout', async () => {
      const { container } = render(<TableEmotion />);
      const snapshot = await waitFor(() =>
        expect(container).toMatchSnapshot(),
      );
    });
  });
});