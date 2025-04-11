import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TableComponent from './TableComponent';

const MyComponent = (props) => {
  return <div>My Component</div>;
};

describe('TableComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TableComponent />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders table head with valid prop', () => {
      const { container } = render(<TableComponent component={MyComponent} />);
      expect(
        container.querySelector('.MuiDataGridHeaderCell-root')
      ).toBeInTheDocument();
    });

    it('does not render table head without valid prop', () => {
      const { queryAllByText } = render(<TableComponent />);
      expect(queryAllByText('My Component')).toHaveLength(0);
    });
  });

  describe('prop validation', () => {
    it('accepts valid component type', () => {
      const { container } = render(<TableComponent component={MyComponent} />);
      expect(container.querySelector('.MuiDataGridHeaderCell-root')).toBeInTheDocument();
    });

    it('rejects invalid component type', () => {
      expect(() =>
        render(<TableComponent component="invalid-component" />)
      ).toThrowError();
    });
  });

  describe('user interactions', () => {
    let tableHead;
    let tableBody;

    beforeEach(() => {
      ({ tableHead, tableBody } = render(<TableComponent />));
    });

    it('renders rows when rendering function is called', async () => {
      expect(tableBody).toMatchSnapshot();
    });

    it('renders table header when user clicks on the first column', async () => {
      const { getByText, queryAllByText } = render(<TableComponent />);
      const column = await queryAllByText('Dessert (100g serving)');
      fireEvent.click(column[0]);
      expect(
        queryAllByText('.MuiDataGridHeaderCell-root')
      ).toHaveLength(1);
    });

    it('submits the form when user clicks on the last column', async () => {
      const { getByText } = render(<TableComponent />);
      const submitButton = await getByText('Submit');
      fireEvent.click(submitButton);
      expect(tableBody).not.toBeNull();
    });
  });
});