import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TableMui from './table-mui';

describe('TableMui component', () => {
  let tableMui;

  beforeEach(() => {
    tableMui = render(<TableMui />);
  });

  it('renders without crashing', () => {
    expect(tableMui).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders table header and body when no props are passed', () => {
      expect(tableMui.queryByRole('heading')).not.toBeNull();
      expect(tableMui.queryByRole('listitem')).not.toBeNull();
    });

    it('does not render table header or body when empty rows prop is set to true', () => {
      const { container } = render(<TableMui rows={[]} emptyRows={true} />);
      expect(container.querySelector('thead')).toBeNull();
      expect(container.querySelector('tbody')).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('throws an error when no rows prop is passed', () => {
      const { container } = render(<TableMui />);
      expect(container.querySelector('table')).not.toBeNull();

      const consoleErrorMock = jest.spyOn(console, 'error');
      expect(() => render(<TableMui rows={[]} />)).toThrowError(
        /Expected row prop to be an array of objects/,
      );
      consoleErrorMock.mockRestore();
    });

    it('throws an error when no emptyRows prop is passed', () => {
      const { container } = render(<TableMui rows={[]} />);
      expect(container.querySelector('table')).not.toBeNull();

      const consoleErrorMock = jest.spyOn(console, 'error');
      expect(() =>
        render(
          <TableMui
            rows={Array.from(new Array(100)).map(() => ({ name: 'test' }))}>
            emptyRows={false}
          </TableMui>,
        ),
      ).toThrowError(/Expected emptyRows prop to be a boolean/);
      consoleErrorMock.mockRestore();
    });
  });

  describe('user interactions', () => {
    it('renders table header and body when clicking on the first column', () => {
      const { getByText } = render(<TableMui />);
      const cell = getByText('Frozen yoghurt');
      fireEvent.click(cell);
      expect(getByText('Calories')).toHaveClass('selected');
    });

    it('renders all rows when inputting a new value in the first column', () => {
      const { getByText, getByRole } = render(<TableMui />);
      const cell = getByRole('gridcell');
      fireEvent.change(cell, { target: { value: 'new frozen yoghurt' } });
      expect(getByRole('listitem')).toHaveLength(100);
    });

    it('renders the last row when submitting a form with no input', () => {
      const { getByText } = render(<TableMui />);
      const cell = getByText('Frozen yoghurt');
      fireEvent.change(cell, { target: { value: 'new frozen yoghurt' } });
      const submitButton = getByRole('button');
      fireEvent.click(submitButton);
      expect(getByText('Calories')).toHaveClass('last-row');
    });

    it('renders the last row when submitting a form with input', () => {
      const { getByText, getByRole } = render(<TableMui />);
      const cell = getByText('Frozen yoghurt');
      fireEvent.change(cell, { target: { value: 'new frozen yoghurt' } });
      const submitButton = getByRole('button');
      fireEvent.click(submitButton);
      expect(getByText('Calories')).toHaveClass('last-row');
    });
  });

  describe('state changes', () => {
    it('updates the table body when rows change', () => {
      const { rerender } = render(<TableMui />);
      setTimeout(() => {
        rerender(<TableMui rows={[{ name: 'new frozen yoghurt' }, { name: 'new dessert' }]}>);
      }, 0);
      expect(tableMui.queryByRole('listitem')).toHaveLength(2);
    });

    it('does not update the table body when emptyRows prop is set to true', () => {
      const { rerender } = render(<TableMui rows={[]} emptyRows={true} />);
      setTimeout(() => {
        rerender(<TableMui rows={[{ name: 'new frozen yoghurt' }, { name: 'new dessert' }]}>);
      }, 0);
      expect(tableMui.queryByRole('listitem')).toHaveLength(0);
    });
  });

  it('matches snapshot', () => {
    expect(tableMui).toMatchSnapshot();
  });
});