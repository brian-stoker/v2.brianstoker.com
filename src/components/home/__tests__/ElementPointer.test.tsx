import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { debounce } from '@mui/material/utils';
import PointerContainer from './PointerContainer';

const mockOnElementChange = jest.fn();
const mockHandleMouseOver = jest.fn();

describe('PointerContainer', () => {
  beforeEach(() => {
    mockOnElementChange.mockReset();
    mockHandleMouseOver.mockReset();
  });

  it('renders without crashing', async () => {
    const { container } = render(<PointerContainer />);
    expect(container).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it(' renders children when props.children is truthy', () => {
      const { container, getByText } = render(
        <Box>
          <Typography color="#fff" fontSize="0.625rem" fontWeight={500} sx={{ display: 'block' }}>
            Hello
          </Typography>
        </Box>,
        {
          wrapper: (element) => <PointerContainer><Box>{element}</Box></PointerContainer>,
        }
      );
      expect(getByText('Hello')).toBeTruthy();
    });

    it('does not render children when props.children is falsy', () => {
      const { container } = render(<PointerContainer />);
      expect(container).not.toContain(document.querySelector('Typography'));
    });
  });

  describe('Props Validation', () => {
    it('should throw an error when onElementChange is not a function', () => {
      const withInvalidProp = <PointerContainer onElementChange="not a function" />;
      expect(() => render(withInvalidProp)).toThrowError(
        'onElementChange must be a function'
      );
    });

    it('should not throw an error when onElementChange is a valid function', () => {
      const withValidProp = <PointerContainer onElementChange={mockOnElementChange} />;
      expect(() => render(withValidProp)).not.toThrowError();
    });
  });

  describe('User Interactions', () => {
    it('should trigger handleMouseOver when mouse is over the component', async () => {
      const { getByRole } = render(
        <PointerContainer onElementChange={mockOnElementChange} />
      );
      const mockHandleMouseOverSpy = jest.spyOn(PointerContext.Provider, 'value');
      const element = getByRole('region');
      fireEvent.mouseOver(element);
      expect(mockHandleMouseOverSpy).toHaveBeenCalledTimes(1);
    });

    it('should not trigger handleMouseOver when mouse is over the parent', async () => {
      const { getByRole } = render(
        <Box>
          <PointerContainer onElementChange={mockOnElementChange} />
        </Box>
      );
      const mockHandleMouseOverSpy = jest.spyOn(PointerContext.Provider, 'value');
      const element = getByRole('region');
      fireEvent.mouseOver(element.parentNode);
      expect(mockHandleMouseOverSpy).not.toHaveBeenCalled();
    });
  });

  describe('State Changes', () => {
    it('should update data when onElementChange is called', async () => {
      const { getByText } = render(
        <PointerContainer onElementChange={mockOnElementChange} />
      );
      expect(getByText('Hello')).not.toExist();
      mockOnElementChange({ id: null, name: 'Hello', target: null });
      expect(getByText('Hello')).toBeTruthy();
    });

    it('should not update data when onElementChange is not called', async () => {
      const { getByText } = render(<PointerContainer />);
      expect(getByText('Hello')).not.toExist();
      await waitFor(() => expect(getByText('Hello')).toBeTruthy());
    });
  });
});