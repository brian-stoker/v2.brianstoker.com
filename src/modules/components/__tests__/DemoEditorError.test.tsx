import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import DemoEditorError from './DemoEditorError';

describe('DemoEditorError component', () => {
  const defaultProps: AlertProps = {
    severity: 'error',
    sx: {},
  };

  const testProps: AlertProps = {
    children: <div>Test Child</div>,
    severity: 'warning',
    sx: { fontSize: 16 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<DemoEditorError {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('renders alert with children when provided', () => {
    const { getByText } = render(<DemoEditorError {...testProps} />);
    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('does not render without children prop', () => {
    const { container } = render(<DemoEditorError />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders alert with correct severity and sx props', () => {
    const { getByText, getByRole } = render(<DemoEditorError {...testProps} />);
    expect(getByText('Test Child')).toHaveStyle({ fontSize: 16 });
    expect(getByRole('alert-icon')).toHaveStyle({
      fontSize: 14,
      mr: '0.5',
      mt: '0.25',
      py: 0,
    });
    expect(getByRole('alert-message')).toHaveStyle({
      fontSize: 12,
      py: 0,
    });
  });

  it('calls onChange function when severity prop changes', () => {
    const onChange = jest.fn();
    const { getByText } = render(<DemoEditorError {...testProps} onChange={onChange} />);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('does not render alert with invalid children prop (null)', () => {
    const { container } = render(<DemoEditorError children=null />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders alert with invalid severity prop (non-string value)', () => {
    const { getByText } = render(<DemoEditorError {...testProps} severity={123} />);
    expect(getByText('Test Child')).toHaveStyle({
      fontSize: 16,
      severity: 'error',
    });
  });

  it('renders alert with invalid sx prop (non-object value)', () => {
    const { getByText } = render(<DemoEditorError {...testProps} sx=123 />);
    expect(getByText('Test Child')).toHaveStyle({ fontSize: 16 });
  });

  it('submits form when submitted', async () => {
    const onSubmit = jest.fn();
    const { getByRole, getByLabelText } = render(<DemoEditorError {...testProps} onSubmit={onSubmit} />);
    const inputField = getByLabelText('Input Field');
    fireEvent.change(inputField, { target: { value: 'Test Value' } });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders alert when focus is lost', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const { getByText } = render(<DemoEditorError {...testProps} />);
    const inputField = getByRole('textbox');
    fireEvent.focus(inputField);
    expect(onFocus).toHaveBeenCalledTimes(1);
    fireEventBlur(inputField);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});