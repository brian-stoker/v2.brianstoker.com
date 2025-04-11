import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { TableHook } from './TableHook';
import '@testing-library/jest-dom';

describe('TableHook', () => {
  const tableRows = Array.from(new Array(100)).map(() => ({ name: 'Frozen yoghurt', calories: 159, fat: 6.0, carbs: 24, protein: 4.0 }));

  it('renders without crashing', async () => {
    const { container } = render(<TableHook />);
    expect(container).toBeTruthy();
  });

  it('renders table head row', async () => {
    const { getByText } = render(<TableHook />);
    expect(getByText('Dessert (100g serving)')).toBeInTheDocument();
  });

  it('renders table body rows', async () => {
    const { getAllByRole } = render(<TableHook />);
    expect(getAllByRole('row')).toHaveLength(100);
  });

  it('renders correct data for first row', async () => {
    const { getByText, queryByText } = render(<TableHook />);
    expect(getByText('Frozen yoghurt')).toBeInTheDocument();
    expect(queryByText('Calories')).not.toBeInTheDocument();
    expect(getByText('6.0')).toBeInTheDocument();
    expect(queryByText('Carbs&nbsp;(g)')).not.toBeInTheDocument();
    expect(getByText('4.0')).toBeInTheDocument();
  });

  it('renders correct data for last row', async () => {
    const { getByText, queryByText } = render(<TableHook />);
    expect(getByText('Frozen yoghurt')).toBeInTheDocument();
    expect(queryByText('Calories')).not.toBeInTheDocument();
    expect(queryByText('Carbs&nbsp;(g)')).not.toBeInTheDocument();
    expect(getByText('24')).toBeInTheDocument();
    expect(queryByText('Protein&nbsp;(g)')).not.toBeInTheDocument();
  });

  it('calls prop Component with ref', async () => {
    const ref = jest.fn();
    const { container } = render(<TableHook component={div} ref={ref} />);
    expect(ref).toHaveBeenCalledTimes(1);
  });

  it(' validates component prop Component', () => {
    TableHook.propTypes.component;
  });

  it('renders when data is provided', async () => {
    const { getByText, queryByText } = render(<TableHook rows={tableRows} />);
    expect(getByText('Frozen yoghurt')).toBeInTheDocument();
    expect(queryByText('Calories')).not.toBeInTheDocument();
    expect(getByText('6.0')).toBeInTheDocument();
  });

  it('renders when data is not provided', async () => {
    const { getByText, queryByText } = render(<TableHook />);
    expect(getByText('Frozen yoghurt')).toBeInTheDocument();
    expect(queryByText('Calories')).not.toBeInTheDocument();
    expect(getByText('6.0')).toBeInTheDocument();
  });

  it('renders when data is provided with incorrect rows', async () => {
    const { getByText, queryByText } = render(<TableHook rows={[]} />);
    expect(getByText('Frozen yoghurt')).toBeInTheDocument();
    expect(queryByText('Calories')).not.toBeInTheDocument();
    expect(queryByText('Carbs&nbsp;(g)')).not.toBeInTheDocument();
    expect(queryByText('Protein&nbsp;(g)')).not.toBeInTheDocument();
  });

  it('renders when data is provided with incorrect rows', async () => {
    const { getByText, queryByText } = render(<TableHook rows={[null]} />);
    expect(getByText('Frozen yoghurt')).toBeInTheDocument();
    expect(queryByText('Calories')).not.toBeInTheDocument();
    expect(queryByText('Carbs&nbsp;(g)')).not.toBeInTheDocument();
    expect(queryByText('Protein&nbsp;(g)')).not.toBeInTheDocument();
  });

  it('calls render method when data changes', async () => {
    const { rerender } = render(<TableHook rows={tableRows} />);
    await waitFor(() => expect(getByText('Frozen yoghurt')).toBeInTheDocument());
    rerender({ rows: [null] });
    await waitFor(() => expect(queryByText('Frozen yoghurt')).not.toBeInTheDocument());
  });

  it('calls render method when table row changes', async () => {
    const { rerender } = render(<TableHook rows={tableRows} />);
    await waitFor(() => expect(getByText('Frozen yoghurt')).toBeInTheDocument());
    await waitFor(() => expect(getByRole('row')).toHaveLength(99));
    const newRow = [{ name: 'New Name', calories: 100 }];
    rerender({ rows: [newRow] });
    await waitFor(() => expect(queryByText('Frozen yoghurt')).not.toBeInTheDocument());
    await waitFor(() => expect(getByRole('row')).toHaveLength(100));
  });

  it('calls render method when table row is removed', async () => {
    const { rerender } = render(<TableHook rows={tableRows} />);
    await waitFor(() => expect(getByText('Frozen yoghurt')).toBeInTheDocument());
    await waitFor(() => expect(getByRole('row')).toHaveLength(99));
    const newRow = [{ name: 'New Name', calories: 100 }];
    rerender({ rows: [newRow] });
    await waitFor(() => expect(queryByText('Frozen yoghurt')).not.toBeInTheDocument());
    await waitFor(() => expect(getByRole('row')).toHaveLength(100));
  });

});