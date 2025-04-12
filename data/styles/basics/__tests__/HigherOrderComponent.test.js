import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import UnstyledComponent from './HigherOrderComponent';

describe('UnstyledComponent', () => {
  const classes = {};
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<UnstyledComponent />);
    expect(container).toBeInTheDocument();
  });

  it('renders with styled button when provided classes', () => {
    classes.root = 'custom-style';
    const { getByText } = render(<UnstyledComponent classes={classes} />);
    expect(getByText('Styled with HOC API')).toHaveClass(classes.root);
  });

  it('renders without props when no classes are provided', () => {
    const { container } = render(<UnstyledComponent />);
    expect(container).toBeInTheDocument();
  });

  it('throws an error when classes prop is not provided', () => {
    expect(() => render(<UnstyledComponent />)).toThrowError(
      'classes' is required
    );
  });

  it('renders with correct styles when classes prop is valid', () => {
    const { getByText } = render(<UnstyledComponent classes={styles} />);
    expect(getByText('Styled with HOC API')).toHaveStyle('background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)');
  });

  it('renders without error when classes prop is invalid', () => {
    const invalidClasses = {};
    expect(() => render(<UnstyledComponent classes={invalidClasses} />)).not.toThrowError();
  });

  it('triggers click event on button', () => {
    const { getByText } = render(<UnstyledComponent />);
    const button = getByText('Styled with HOC API');
    fireEvent.click(button);
    expect(button).toHaveClass('MuiButton-active');
  });

  it('updates text when input value changes', () => {
    const { getByText, getByPlaceholderValue } = render(<UnstyledComponent />);
    const inputField = getByPlaceholderValue('');
    fireEvent.change(inputField, { target: { value: 'new-value' } });
    expect(getByText('Styled with HOC API')).toHaveTextContent('new-value');
  });

  it('submits form when button is clicked', () => {
    const { getByText, getByRole } = render(<UnstyledComponent />);
    const button = getByText('Styled with HOC API');
    fireEvent.click(button);
    expect(getByRole('form')).toHaveAttribute('method', 'POST');
  });

  it('calls function when prop changes', () => {
    let updatedProp = false;
    UnstyledComponent.prototype.updateProp = jest.fn(() => { updatedProp = true; });
    const { rerender } = render(<UnstyledComponent updateProp={() => {}} />);
    rerender(<UnstyledComponent updateProp={jest.fn()} />);
    expect(updatedProp).toBe(true);
  });

  it('calls function when state changes', () => {
    let updatedState = false;
    UnstyledComponent.prototype.updateState = jest.fn(() => { updatedState = true; });
    const { rerender } = render(<UnstyledComponent />);
    rerender(<UnstyledComponent />);
    expect(updatedState).toBe(true);
  });

  it('does not crash with valid props and state', () => {
    const props = {};
    const state = {};
    UnstyledComponent(props, state);
  });
});