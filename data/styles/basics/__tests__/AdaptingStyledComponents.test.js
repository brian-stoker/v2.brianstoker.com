import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Button from '@mui/material/Button';
import MyButton from './AdaptingStyledComponents';

describe('AdaptingStyledComponents', () => {
  const MyButtonMock = (props) => <div {...props} />;
  const renderWithProps = (props) => render(<MyButton {...props} />);
  
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    expect(renderWithProps({})).toBeTruthy();
  });

  describe('Conditional rendering paths', () => {
    it('renders red button when color is "red"', () => {
      const { container } = renderWithProps({ color: 'red' });
      expect(container.querySelector('.MuiButton-root')).toHaveClass('linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)');
    });

    it('renders blue button when color is "blue"', () => {
      const { container } = renderWithProps({ color: 'blue' });
      expect(container.querySelector('.MuiButton-root')).toHaveClass('linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)');
    });

    it('renders default style when color is not provided', () => {
      const { container } = renderWithProps({});
      expect(container.querySelector('.MuiButton-root')).toHaveClass('');
    });
  });

  describe('Prop validation', () => {
    it('throws error if color prop is not a string', () => {
      expect(() => renderWithProps({ color: null })).toThrow();
    });

    it('throws error if color prop is an empty string', () => {
      expect(() => renderWithProps({ color: '' })).toThrow();
    });
  });

  describe('User interactions', () => {
    it('calls onClick event when button is clicked', () => {
      const mockonClick = jest.fn();
      const { getByText } = renderWithProps({ onClick: mockonClick, color: 'red' });
      const button = getByText('Red');
      fireEvent.click(button);
      expect(mockonClick).toHaveBeenCalledTimes(1);
    });

    it('calls onChange event when input field changes', () => {
      const mockonChange = jest.fn();
      const { getByText } = renderWithProps({ onChange: mockonChange, color: 'red' });
      const button = getByText('Red');
      fireEvent.change(button, { target: { value: 'newValue' } });
      expect(mockonChange).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit event when form is submitted', () => {
      const mockonSubmit = jest.fn();
      const { getByText } = renderWithProps({ onSubmit: mockonSubmit, color: 'red' });
      const button = getByText('Red');
      fireEvent.submit(button);
      expect(mockonSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Side effects and state changes', () => {
    it('calls side effect when color prop is changed', async () => {
      const mockSideEffect = jest.fn();
      const { rerender } = renderWithProps({ onClick: mockSideEffect, color: 'red' });
      await new Promise(resolve => setTimeout(resolve));
      expect(mockSideEffect).toHaveBeenCalledTimes(1);
    });

    it('changes state when user interacts with button', async () => {
      const mockUpdateState = jest.fn();
      const { getByText } = renderWithProps({ updateState: mockUpdateState, color: 'red' });
      await new Promise(resolve => setTimeout(resolve));
      const button = getByText('Red');
      fireEvent.click(button);
      expect(mockUpdateState).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot test', () => {
    it('matches snapshot', () => {
      const { asFragment } = renderWithProps({ color: 'red' });
      expect(asFragment()).toMatchSnapshot();
    });
  });
});