import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
importProgressBar from './ProgressBar';

jest.mock('@mui/material/Box', () => ({
  Box: ({ children }) => children,
}));

describe('ProgressBar component', () => {
  const defaultProps = {
    value: 50,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ProgressBar {...defaultProps} />);
    expect(renderedComponent).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders error color when value is below 30%', () => {
      const { getByText } = render(
        <ProgressBar {...{ ...defaultProps, value: 20 }} />
      );
      expect(getByText(`${20}%`).parentElement.style.backgroundColor).toBe(
        'error.200'
      );
    });

    it('renders warning color when value is between 30% and 70%', () => {
      const { getByText } = render(<ProgressBar {...defaultProps} />);
      expect(getByText(`${defaultProps.value}%`).parentElement.style.backgroundColor).toBe(
        'warning.400'
      );
    });

    it('renders success color when value is above 70%', () => {
      const { getByText } = render(<ProgressBar {...defaultProps} value={80} />);
      expect(getByText(`${defaultProps.value}%`).parentElement.style.backgroundColor).toBe(
        'success.300'
      );
    });
  });

  describe('prop validation', () => {
    it('throws an error when value is not a number', () => {
      expect(() => render(<ProgressBar {...{ value: 'abc' }} />)).toThrow();
    });

    it('renders without crashing when value is a valid number', () => {
      const { getByText } = render(<ProgressBar {...defaultProps} />);
      expect(getByText(`${defaultProps.value}%`).parentElement.style.backgroundColor).not.toBe('');
    });
  });

  describe('user interactions', () => {
    it('calls the onClick event handler when the progress bar is clicked', async () => {
      const { getByText } = render(<ProgressBar {...defaultProps} />);
      const progressBar = getByText(`${defaultProps.value}%`);
      fireEvent.click(progressBar);
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it('calls the onChange event handler when the value input changes', async () => {
      const { getByText, getByLabelText } = render(<ProgressBar {...defaultProps} />);
      const progressBar = getByText(`${defaultProps.value}%`);
      const valueInput = getByLabelText(`Value`);
      fireEvent.change(valueInput, { target: { value: '80' } });
      expect(changeHandler).toHaveBeenCalledTimes(1);
    });

    it('calls the onSubmit event handler when the form is submitted', async () => {
      const { getByText, getByLabelText } = render(<ProgressBar {...defaultProps} />);
      const progressBar = getByText(`${defaultProps.value}%`);
      const valueInput = getByLabelText(`Value`);
      fireEvent.change(valueInput, { target: { value: '80' } });
      fireEvent.submit(document.querySelector('form'));
      expect(submitHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    it('updates the progress bar value when the updateProgress function is called', async () => {
      const { getByText } = render(<ProgressBar {...defaultProps} />);
      const progressBar = getByText(`${defaultProps.value}%`);
      await waitFor(() => expect(progressBar).toHaveStyle('width: 80%'));
    });
  });

  describe('snapshot test', () => {
    it('matches the rendered snapshot', async () => {
      const { asFragment } = render(<ProgressBar {...defaultProps} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  let renderedComponent;
  let clickHandler;
  let changeHandler;
  let submitHandler;

  afterEach(() => {
    renderedComponent = null;
    clickHandler = null;
    changeHandler = null;
    submitHandler = null;
  });
});