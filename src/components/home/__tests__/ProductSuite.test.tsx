import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ProductSuite from './ProductSuite';

describe('Product Suite', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<ProductSuite />);
    expect(container).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it('renders children when props are valid', async () => {
      const { getByText } = render(<ProductSuite children="Test Content" />);
      expect(getByText('Test Content')).toBeInTheDocument();
    });

    it('does not render children when props are invalid', async () => {
      const { queryByText } = render(<ProductSuite children="Invalid Content" invalidProp={1} />);
      expect(queryByText('Invalid Content')).not.toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('throws an error when invalidProp is provided', () => {
      expect(() => <ProductSuite children="Test Content" invalidProp={1} />).toThrowError();
    });

    it('does not throw an error when props are valid', async () => {
      const { getByText } = render(<ProductSuite children="Test Content" />);
      expect(getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onClick when button is clicked', async () => {
      const mockClick = jest.fn();
      const { getByText, getByRole } = render(<ProductSuite children="Test Content" onClick={mockClick} />);
      const button = getByRole('button');
      fireEvent.click(button);
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('calls onChange when input changes', async () => {
      const mockChange = jest.fn();
      const { getByText, getByRole } = render(<ProductSuite children="Test Content" onChange={mockChange} />);
      const input = getByRole('textbox');
      fireEvent.change(input, { target: { value: 'New Value' } });
      expect(mockChange).toHaveBeenCalledTimes(1);
    });

    it('submits the form when submit button is clicked', async () => {
      const mockSubmit = jest.fn();
      const { getByText, getByRole } = render(<ProductSuite children="Test Content" onSubmit={mockSubmit} />);
      const submitButton = getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot Tests', () => {
    it('renders correctly', async () => {
      const { asFragment } = render(<ProductSuite />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});