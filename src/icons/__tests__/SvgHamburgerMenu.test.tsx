import { render, fireEvent, waitFor } from '@testing-library/react';
import SvgHamburgerMenu from './SvgHamburgerMenu';
import type { RootSvgProps } from 'src/icons/RootSvg';

describe('SvgHamburgerMenu component', () => {
  let props: RootSvgProps;
  let svgElement: HTML SVGElement;

  beforeEach(() => {
    props = {
      fill: '#007FFF',
      size: 24,
      strokeColor: 'black',
    };
    svgElement = render(<SvgHamburgerMenu {...props} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(svgElement).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders when props are provided', () => {
      const { getByTitle } = render(<SvgHamburgerMenu {...props} />);
      expect(getByTitle('Root Svg')).toBeInTheDocument();
    });

    it('does not render when no props are provided', () => {
      const { container, queryByText } = render(<SvgHamburgerMenu />);
      expect(queryByText('Root Svg')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('renders with valid fill prop', () => {
      const { getByTitle } = render(<SvgHamburgerMenu {...props} fill="#000" />);
      expect(getByTitle('Root Svg')).toBeInTheDocument();
    });

    it('does not render with invalid fill prop (not a string)', () => {
      props.fill = 123;
      const { container, queryByText } = render(<SvgHamburgerMenu {...props} />);
      expect(queryByText('Root Svg')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('renders with default fill prop when clicked', () => {
      const { getByTitle, getByText } = render(<SvgHamburgerMenu {...props} fill="#000" />);
      fireEvent.click(getByTitle('Root Svg'));
      expect(getByText('Fill')).toHaveValue('black');
    });

    it('updates fill prop on click', async () => {
      props.fill = '#000';
      const { getByTitle, getByText } = render(<SvgHamburgerMenu {...props} fill="#007FFF" />);
      fireEvent.click(getByTitle('Root Svg'));
      await waitFor(() => expect(getByText('Fill')).toHaveValue('#000'));
    });

    it('renders with default strokeColor prop when clicked', () => {
      const { getByTitle, getByText } = render(<SvgHamburgerMenu {...props} strokeColor="blue" />);
      fireEvent.click(getByTitle('Root Svg'));
      expect(getByText('Stroke Color')).toHaveValue('black');
    });
  });

  describe('side effects and state changes', () => {
    // Add tests for side effects or state changes here
  });
});