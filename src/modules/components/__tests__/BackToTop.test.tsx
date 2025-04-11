import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BackToTop from './BackToTop.test.tsx';
import { useTranslate } from '@stoked-ui/docs/i18n';
import Theme from '@mui/material/styles';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';

jest.mock('@mui/material/useScrollTrigger');

describe('BackToTop component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<BackToTop />);
    expect(BackToTop).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('should render when trigger is true', () => {
      useScrollTrigger.mockImplementation(() => ({ trigger: true }));
      const { getByRole } = render(<BackToTop />);
      expect(getByRole('tooltip')).toBeInTheDocument();
    });

    it('should not render when trigger is false', () => {
      useScrollTrigger.mockImplementation(() => ({ trigger: false }));
      const { queryByRole } = render(<BackToTop />);
      expect(queryByRole('tooltip')).toBeNull();
    });
  });

  describe('props validation', () => {
    it('should not throw error when props are valid', () => {
      useScrollTrigger.mockImplementation(() => ({ trigger: true }));
      const { getByRole } = render(<BackToTop />);
      expect(getByRole('tooltip')).toBeInTheDocument();
    });

    it('should throw error when prop is invalid', () => {
      useScrollTrigger.mockImplementation(() => ({ invalidProp: true }));
      expect(() => render(<BackToTop />)).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('should handle click event correctly', () => {
      const { getByRole } = render(<BackToTop />);
      const fab = getByRole('button');
      fireEvent.click(fab);
      expect(window.scrollTo).toHaveBeenCalledTimes(1);
      expect(setOpen).toHaveBeenCalledTimes(1);
    });

    it('should not scroll to top when prefersReducedMotion is true', () => {
      window.matchMedia.mockImplementation((matchMedia) => ({
        matches: false,
      }));
      const { getByRole } = render(<BackToTop />);
      const fab = getByRole('button');
      fireEvent.click(fab);
      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it('should handle input change event correctly', () => {
      const { getByRole } = render(<BackToTop />);
      const inputField = getByRole('textbox');
      fireEvent.change(inputField, { target: { value: 'test' } });
      expect(setOpen).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('should handle zoom event correctly', () => {
      window.matchMedia.mockImplementation((matchMedia) => ({
        matches: false,
      }));
      const { getByRole } = render(<BackToTop />);
      const fab = getByRole('button');
      expect(window.scrollTo).toHaveBeenCalledTimes(1);
      expect(setOpen).toHaveBeenCalledTimes(1);
    });
  });

  it('should match snapshot', () => {
    useScrollTrigger.mockImplementation(() => ({ trigger: true }));
    const { asFragment } = render(<BackToTop />);
    expect(asFragment()).toMatchSnapshot();
  });
});