import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { GridRenderEditCellParams } from '@mui/x-data-grid';
import { useGridRootProps, useGridApiContext } from '@mui/x-data-grid';
import EditStatus from './EditStatus';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Select: jest.fn(() => {
    const select = { onChange: jest.fn(), onClose: jest.fn() };
    return { ...select, MenuProps: {} };
  }),
}));

describe('EditStatus component', () => {
  it('renders without crashing', async () => {
    const props = GridRenderEditCellParams.createEmpty();
    const { container } = render(<EditStatus {...props} />);
    expect(container).toBeInTheDocument();
  });

  it('renders all options for edit status', async () => {
    const props = GridRenderEditCellParams.createEmpty();
    props.value = 'Open';
    const { getAllByRole, getByText } = render(<EditStatus {...props} />);
    const openOption = await getAllByRole('option').find((element) => element.textContent === 'Open');
    expect(openOption).toBeInTheDocument();

    const partiallyFilledOption = await getAllByRole('option').find(
      (element) => element.textContent === 'Partially Filled'
    );
    expect(partiallyFilledOption).toBeInTheDocument();

    const filledOption = await getAllByRole('option').find((element) => element.textContent === 'Filled');
    expect(filledOption).toBeInTheDocument();

    const rejectedOption = await getAllByRole('option').find(
      (element) => element.textContent === 'Rejected'
    );
    expect(rejectedOption).toBeInTheDocument();
  });

  it('validates prop types', async () => {
    const props = GridRenderEditCellParams.createEmpty();
    const { getByText } = render(<EditStatus {...props} />);
    expect(getByText('Invalid prop')).toBeInTheDocument();

    // Add test for invalid prop values
  });

  it('fires onChange event correctly', async () => {
    const props = GridRenderEditCellParams.createEmpty();
    props.value = 'Open';
    const { getByText } = render(<EditStatus {...props} />);
    const select = await getByText('Open');
    fireEvent.change(select, { target: { value: 'Partially Filled' } });
    expect(props.onChange).toHaveBeenCalledTimes(1);
  });

  it('fires onClose event correctly', async () => {
    const props = GridRenderEditCellParams.createEmpty();
    props.value = 'Open';
    const { getByText } = render(<EditStatus {...props} />);
    const select = await getByText('Open');
    fireEvent.click(select);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('renders menu options correctly', async () => {
    const props = GridRenderEditCellParams.createEmpty();
    props.value = 'Open';
    const { getAllByRole, getByText } = render(<EditStatus {...props} />);
    await waitFor(() => expect(getByText('Partially Filled')).toBeInTheDocument());
  });
});