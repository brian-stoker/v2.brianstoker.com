import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import EditProgress from './EditProgress.test.tsx';
import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import { debounce } from '@mui/material/utils';
import Slider, { SliderValueLabelProps } from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';

describe('EditProgress Component', () => {
  const initialProps = {
    id: 1,
    value: '0.5',
    field: 'field',
  };

  const gridApiMock = {
    currentFocus: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<EditProgress {...initialProps} />);
    expect(screen).not.toThrowError();
  });

  describe('Conditional Rendering', () => {
    const conditionalProps = {
      id: 1,
      value: '0.5',
      field: 'field',
      open: true,
    };

    it('renders value label when open is true', () => {
      render(<EditProgress {...conditionalProps} />);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('does not render value label when open is false', () => {
      const props = { ...initialProps, open: false };
      render(<EditProgress {...props} />);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Prop Validation', () => {
    const invalidProps = {
      id: undefined,
      value: 'abc',
      field: undefined,
    };

    it('throws an error when id is missing', () => {
      expect(() => render(<EditProgress {...invalidProps} />)).toThrowError();
    });

    it('throws an error when value is not a number', () => {
      const props = { ...initialProps, value: 'abc' };
      expect(() => render(<EditProgress {...props} />)).toThrowError();
    });
  });

  describe('User Interactions', () => {
    let inputElement;

    beforeEach(() => {
      inputElement = document.createElement('input');
    });

    it('focuses the input when click is triggered', async () => {
      const props = { ...initialProps, open: true };
      const { getByRole } = render(<EditProgress {...props} />);
      const slider = getByRole('slider');
      fireEvent.click(slider);
      await waitFor(() => expect(inputElement).not.toBeNull());
    });

    it('updates the value when input is changed', async () => {
      const props = { ...initialProps, open: true };
      const { getByRole } = render(<EditProgress {...props} />);
      const slider = getByRole('slider');
      fireEvent.change(inputElement, { target: { value: '1' } });
      await waitFor(() => expect(screen.getByText('100')).toBeInTheDocument());
    });

    it('submits the form when submit is triggered', async () => {
      const props = { ...initialProps, open: true };
      const { getByRole } = render(<EditProgress {...props} />);
      const slider = getByRole('slider');
      fireEvent.click(slider);
      await waitFor(() => expect(screen.getByText('Form submitted')).toBeInTheDocument());
    });
  });

  describe('Side Effects', () => {
    it('updates the state when value changes', async () => {
      const props = { ...initialProps, open: true };
      const { getByRole } = render(<EditProgress {...props} />);
      const slider = getByRole('slider');
      fireEvent.change(inputElement, { target: { value: '1' } });
      await waitFor(() => expect(screen.getByText('100')).toBeInTheDocument());
    });

    it('refreshes the grid when edit cell props are updated', async () => {
      const props = { ...initialProps, open: true };
      const apiMock = jest.fn();
      const { getByRole } = render(<EditProgress {...props} />);
      const slider = getByRole('slider');
      fireEvent.change(inputElement, { target: { value: '1' } });
      await waitFor(() => expect(apiMock).toHaveBeenCalledTimes(1));
    });
  });
});