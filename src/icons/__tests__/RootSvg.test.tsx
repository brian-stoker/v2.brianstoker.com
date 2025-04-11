import { render, fireEvent, waitFor } from '@testing-library/react';
import Svg from './RootSvg';

interface Props {
  sx?: object;
  ref?: React.RefObject<SVGSVGElement>;
}

const mockTheme = {
  palette: {
    primary: {
      main: 'primary-color',
    },
  },
};

describe('RootSvg component', () => {
  beforeEach(() => {
    global.theme = mockTheme;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<Svg />);
    expect(container).toBeInTheDocument();
  });

  it('renders with sx prop', () => {
    const sx = {
      fontSize: '24px',
      color: 'primary-color',
    };
    const { container } = render(<Svg sx={sx} />);
    expect(container).toHaveStyleRule('font-size', '24px');
    expect(container).toHaveStyleRule('color', 'primary-color');
  });

  it('renders with ref prop', () => {
    const ref = new React.RefObject<SVGSVGElement>(null);
    const { container } = render(<Svg ref={ref} />);
    expect(ref.current).toBe(null);
  });

  it('handles invalid sx prop', () => {
    const invalidSx = { fontSize: 'invalid' };
    const { container, getByText } = render(<Svg sx={invalidSx} />);
    expect(getByText('Error: Invalid font size')).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders if theme is provided', () => {
      global.theme = null;
      const { container } = render(<Svg theme={mockTheme} />);
      expect(container).toHaveStyleRule('vertical-align', 'bottom');
    });

    it('does not render if theme is not provided', () => {
      global.theme = null;
      const { queryByTitle } = render(<Svg />);
      expect(queryByTitle('Error: Theme is required')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('handles click event', () => {
      const onClickMock = jest.fn();
      const { getByRole } = render(<Svg onClick={onClickMock} />);
      const svg = getByRole('img');
      fireEvent.click(svg);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('handles input change event', () => {
      const onChangeMock = jest.fn();
      const { getByRole } = render(<Svg onChange={onChangeMock} />);
      const svg = getByRole('img');
      fireEvent.change(svg, { target: { value: 'new-value' } });
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('handles form submission', () => {
      const onSubmitMock = jest.fn();
      const { getByRole } = render(<form><Svg onSubmit={onSubmitMock} /></form>);
      const svg = getByRole('img');
      fireEvent.submit(svg);
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  it('snaps', () => {
    const { asFragment } = render(<Svg />);
    expect(asFragment()).toMatchSnapshot();
  });
});