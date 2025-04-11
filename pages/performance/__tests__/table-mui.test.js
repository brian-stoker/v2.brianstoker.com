import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TableMui from './TableMui.test.js';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  TableBody: jest.fn(),
  TableCell: jest.fn(),
  TableRow: jest.fn(),
}));

describe('TableMui component', () => {
  let tableMui;

  beforeEach(() => {
    tableMui = render(<TableMui />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(tableMui).toBeTruthy();
  });

  describe('Conditional rendering', () => {
    it('renders TableHead when present as prop', () => {
      const tableMuiWithTablehead = render(<TableMui tableHead={<TableRow>Test</TableRow>} />);
      expect(tableMuiWithTablehead.getByRole('heading')).toBeInTheDocument();
    });

    it('does not render TableHead by default', () => {
      const tableMuiWithoutTablehead = render(<TableMui />);
      expect(tableMuiWithoutTablehead.queryByRole('heading')).toBeNull();
    });
  });

  describe('Prop validation', () => {
    it('throws an error when tableHead prop is missing', () => {
      expect(() => render(<TableMui />)).toThrowError();
    });

    it('throws an error when data prop is missing', () => {
      expect(() => render(<TableMui tableHead={<TableRow />} />)).toThrowError();
    });
  });

  describe('User interactions', () => {
    it('calls onClick event on TableBody when clicked', async () => {
      const onClickSpy = jest.fn();
      const tableMuiWithOnClick = render(<TableMui onClick={onClickSpy} />);
      fireEvent.click(tableMuiWithOnClick.getByRole('row'));
      await waitFor(() => expect(onClickSpy).toHaveBeenCalledTimes(1));
    });

    it('calls onChange event on TableCell when input changes', async () => {
      const onChangeSpy = jest.fn();
      const tableMuiWithOnChange = render(<TableMui onChange={onChangeSpy} />);
      fireEvent.change(tableMuiWithOnChange.getByRole('cell'), { target: 'new value' });
      await waitFor(() => expect(onChangeSpy).toHaveBeenCalledTimes(1));
    });

    it('calls onSubmit event on form when submitted', async () => {
      const onSubmitSpy = jest.fn();
      const tableMuiWithOnSubmit = render(<TableMui onSubmit={onSubmitSpy} />);
      fireEvent.submit(tableMuiWithOnSubmit.getByRole('form'));
      await waitFor(() => expect(onSubmitSpy).toHaveBeenCalledTimes(1));
    });
  });

  describe('Side effects and state changes', () => {
    it('calls API to fetch data when component mounts', async () => {
      jest.spyOn(window, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({ name: 'Frozen yoghurt' }),
      });
      tableMui.current && tableMui.current.fetchData();
      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    });

    it('calls API to update data when component updates', async () => {
      jest.spyOn(window, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({ name: 'Frozen yoghurt' }),
      });
      tableMui.current && tableMui.current.updateData();
      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    });
  });

  it('renders snapshot correctly', () => {
    const renderedTableMui = render(<TableMui />);
    expect(renderedTableMui).toMatchSnapshot();
  });
});