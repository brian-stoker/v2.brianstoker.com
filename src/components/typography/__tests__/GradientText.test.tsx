import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import GradientText from './GradientText';

describe('GradientText', () => {
  const theme = { palette: {} };
  const colorProps = ['primary', 'error', 'success', 'warning'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      await render(<GradientText />);
      expect(component).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    colorProps.forEach((color) => {
      it(`renders with ${color} color`, async () => {
        const { getByText } = render(<GradientText color={color} />);
        expect(getByText('GradientText')).toHaveStyle(
          `background: linear-gradient(90deg, ${theme.palette[color][400]} 5%, ${theme.palette[color].main} 90%)`
        );
      });
    });
  });

  describe('Prop Validation', () => {
    it('validates color prop', async () => {
      const { getByText } = render(<GradientText color="primary" />);
      expect(getByText('GradientText')).toHaveStyle(
        `background: linear-gradient(90deg, ${theme.palette['primary'][400]} 5%, ${theme.palette['primary'].main} 90%)`
      );
    });

    it('invalidates invalid color prop', async () => {
      const { getByText } = render(<GradientText color="unknown" />);
      expect(getByText('GradientText')).toHaveStyle({
        background: undefined,
      });
    });
  });

  describe('User Interactions', () => {
    const mockChange = jest.fn();
    const { getByText, getByRole } = render(<GradientText color="primary" />);

    it('updates color when clicked', async () => {
      fireEvent.click(getByText('GradientText'));
      expect(mockChange).toHaveBeenCalledTimes(1);
    });

    it('updates text color input value', async () => {
      const inputField = getByRole('textbox');
      fireEvent.change(inputField, { target: { value: 'new-color' } });
      expect(mockChange).toHaveBeenCalledTimes(2);
    });

    it('submits form when clicked', async () => {
      const submitButton = getByRole('button');
      fireEvent.click(submitButton);
      expect(mockChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Snapshot Testing', () => {
    it('matches snapshot with default props', () => {
      const { asFragment } = render(<GradientText />);
      expect(asFragment()).toMatchSnapshot();
    });

    colorProps.forEach((color) => {
      it(`matches snapshot with ${color} color`, async () => {
        const { asFragment } = render(<GradientText color={color} />);
        expect(asFragment()).toMatchSnapshot();
      });
    });
  });
});