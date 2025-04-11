import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import stylingSolutionMapping from './stylingSolutionMapping.test.js';

jest.mock('src/modules/constants');

describe('stylingSolutionMapping Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<stylingSolutionMapping />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering paths', () => {
    it('renders tailwind styling solution mapping', async () => {
      const { getByText } = render(<stylingSolutionMapping code={CODE_STYLING.TAILWIND} />);
      expect(getByText('tailwind')).toBeInTheDocument();
    });

    it('renders css styling solution mapping', async () => {
      const { getByText } = render(<stylingSolutionMapping code={CODE_STYLING.CSS} />);
      expect(getByText('css')).toBeInTheDocument();
    });

    it('renders system styling solution mapping', async () => {
      const { getByText } = render(<stylingSolutionMapping code={CODE_STYLING.SYSTEM} />);
      expect(getByText('system')).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws an error for invalid prop type', async () => {
      expect(() => render(<stylingSolutionMapping code="invalid" />)).toThrowError(
        expect.stringMatching(/Invalid prop: code/)
      );
    });

    it('renders with valid code prop value', async () => {
      const { getByText } = render(<stylingSolutionMapping code={CODE_STYLING.TAILWIND} />);
      expect(getByText('tailwind')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls the correct function when user clicks on styling solution mapping', async () => {
      const mockFunction = jest.fn();
      render(<stylingSolutionMapping code={CODE_STYLING.TAILWIND} onClick={mockFunction} />);
      fireEvent.click(await getHTMLElementByTagname('button'));
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('calls the correct function when user changes the styling solution mapping input', async () => {
      const mockFunction = jest.fn();
      render(<stylingSolutionMapping code={CODE_STYLING.TAILWIND} onChange={mockFunction} />);
      fireEvent.change(await getHTMLElementByTagname('input'));
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    it('should update the component state on styling solution mapping selection change', async () => {
      const mockSetState = jest.fn();
      render(<stylingSolutionMapping code={CODE_STYLING.TAILWIND} setState={mockSetState} />);
      fireEvent.change(await getHTMLElementByTagname('select'));
      expect(mockSetState).toHaveBeenCalledTimes(1);
    });
  });

  describe('snapshot test', () => {
    it('renders the styling solution mapping with correct values', async () => {
      const { asFragment } = render(<stylingSolutionMapping code={CODE_STYLING.TAILWIND} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});