import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TableEmotion from './TableEmotion.test.js';

describe('TableEmotion component', () => {
  it('renders without crashing', async () => {
    const { container } = render(<TableEmotion />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders table rows correctly', async () => {
      const { getAllByRole, getByText } = render(<TableEmotion />);
      const row1 = await getAllByRole('row');
      const row2 = await getAllByRole('row')[1];
      expect(getByText('Dessert (100g serving)')).toBeInTheDocument();
      expect(getByText('Calories')).toBeInTheDocument();
      expect(getByText('Fat&nbsp;(g)')).toBeInTheDocument();
      expect(getByText('Carbs&nbsp;(g)')).toBeInTheDocument();
      expect(getByText('Protein&nbsp;(g)')).toBeInTheDocument();
    });

    it('renders table with different components', async () => {
      const { getAllByRole, getByText } = render(<TableEmotion component="div" />);
      const row1 = await getAllByRole('row');
      const row2 = await getAllByRole('row')[1];
      expect(getByText('Dessert (100g serving)')).toBeInTheDocument();
      expect(getByText('Calories')).toBeInTheDocument();
      expect(getByText('Fat&nbsp;(g)')).toBeInTheDocument();
      expect(getByText('Carbs&nbsp;(g)')).toBeInTheDocument();
      expect(getByText('Protein&nbsp;(g)')).toBeInTheDocument();
    });

    it('renders table with default components', async () => {
      const { getAllByRole, getByText } = render(<TableEmotion />);
      const row1 = await getAllByRole('row');
      const row2 = await getAllByRole('row')[1];
      expect(getByText('Dessert (100g serving)')).toBeInTheDocument();
      expect(getByText('Calories')).toBeInTheDocument();
      expect(getByText('Fat&nbsp;(g)')).toBeInTheDocument();
      expect(getByText('Carbs&nbsp;(g)')).toBeInTheDocument();
      expect(getByText('Protein&nbsp;(g)')).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('validates component type prop', async () => {
      const { error } = render(<TableEmotion component="div" />);
      expect(error).not.toBeNull();
    });

    it('does not validate component type prop', async () => {
      const { error } = render(<TableEmotion component={''} />);
      expect(error).toBeNull();
    });
  });

  describe('user interactions', () => {
    it('calls onRowClick event when clicking on table row', async () => {
      const onRowClickMock = jest.fn();
      const { getByText } = render(<TableEmotion onRowClick={onRowClickMock} />);
      await waitFor(() => expect(onRowClickMock).toHaveBeenCalledTimes(1));
    });

    it('calls onInputChange event when input changes', async () => {
      const onInputChangeMock = jest.fn();
      const { getByText, getByRole } = render(<TableEmotion onInputChange={onInputChangeMock} />);
      const inputField = getByRole('textbox');
      fireEvent.change(inputField, { target: { value: 'new value' } });
      await waitFor(() => expect(onInputChangeMock).toHaveBeenCalledTimes(1));
    });

    it('calls onSubmit event when form is submitted', async () => {
      const onSubmitMock = jest.fn();
      const { getByText, getByRole } = render(<TableEmotion onSubmit={onSubmitMock} />);
      const inputField = getByRole('textbox');
      fireEvent.change(inputField, { target: { value: 'new value' } });
      await waitFor(() => expect(onSubmitMock).toHaveBeenCalledTimes(1));
    });
  });

  describe('side effects', () => {
    it('updates state when data changes', async () => {
      const updateDataMock = jest.fn();
      const { rerender } = render(<TableEmotion updateData={updateDataMock} />);
      await waitFor(() => expect(updateDataMock).toHaveBeenCalledTimes(1));
    });
  });

  describe('snapshot tests', () => {
    it('renders correctly', async () => {
      const { asFragment } = render(<TableEmotion />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});