import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MyButton as MuiButton } from '@mui/material/Button';
import { create } from 'styled-components';

const StyledComponent = create(MyButton);

describe('StyledComponents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Render', () => {
    it('renders without crashing', () => {
      const { container } = render(<StyledComponents />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('renders MyButton from styled-components API when present', () => {
      const { getByText } = render(<StyledComponents />);
      expect(getByText(/styled-components/)).toBeInTheDocument();
    });

    it('does not render MuiButton when missing from props', () => {
      const { container } = render(<StyledComponents />);
      expect(container).not.toContain(document.querySelector('button'));
    });
  });

  describe('Props Validation', () => {
    const validProps = ['children'];
    const invalidProps = ['invalidProp'];

    it.each(validProps)('accepts %p prop', (prop) => {
      const { container } = render(<StyledComponents {...{ [prop]: 'test' }} />);
      expect(container).toBeInTheDocument();
    });

    it.each(invalidProps)('does not accept %p prop', (prop) => {
      const { container } = render(<StyledComponents {...{ [prop]: 'test' }} />);
      expect(container).not.toContain(document.querySelector('button'));
    });
  });

  describe('User Interactions', () => {
    it('clicks the button and updates its text content', async () => {
      const { getByText, getByRole } = render(<StyledComponents />);
      const button = getByRole('button');
      fireEvent.click(button);
      expect(getByText('test')).toBeInTheDocument();
    });

    it('inputs text and submits the form', async () => {
      const { getByText, getByRole } = render(<StyledComponents />);
      const inputField = getByRole('textbox');
      fireEvent.change(inputField, { target: { value: 'test' } });
      const submitButton = getByRole('button');
      fireEvent.click(submitButton);
      expect(getByText('test')).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('renders correctly', () => {
      const { asFragment } = render(<StyledComponents />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});