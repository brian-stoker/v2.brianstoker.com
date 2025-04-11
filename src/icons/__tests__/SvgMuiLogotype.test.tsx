import { render, fireEvent, waitFor } from '@testing-library/react';
import SvgMuiLogomark from './SvgMuiLogotype';

const mockTheme = {
  applyDarkStyles: (styles) => styles,
};

describe('SvgMuiLogotype', () => {
  const props = {
    sx: [
      'flexShrink',
      'color',
      'fill',
      'stroke',
      'strokeWidth',
      'opacity',
    ],
    children: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<SvgMuiLogomark {...props} />);
    expect(document.body).toMatchSnapshot();
  });

  describe('prop validation', () => {
    const invalidProps = { ...props, sx: null };

    it('throws an error with invalid sx prop', () => {
      expect(() => render(<SvgMuiLogomark {...invalidProps} />)).toThrow(
        Error,
      );
    });
  });

  describe('user interactions', () => {
    const mockClickEvent = { preventDefault: () => {} };

    it('calls onClick callback on click event', async () => {
      props.onClick = jest.fn();
      render(<SvgMuiLogomark {...props} onClick={mockClickEvent} />);
      fireEvent.click(mockClickEvent);
      expect(props.onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('conditional rendering', () => {
    const disabledProps = { ...props, onClick: null };

    it('renders without clicking on disabled component', async () => {
      render(<SvgMuiLogomark {...disabledProps} />);
      await waitFor(() => expect(document.body).toMatchSnapshot());
    });
  });
});