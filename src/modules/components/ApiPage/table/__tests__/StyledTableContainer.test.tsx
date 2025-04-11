import { render, fireEvent, screen } from '@testing-library/react';
import { StyledTableContainer, StyledTableHeaderRow, StyledTableRow, StyledTableCell } from './StyledTableContainer';
import { mockProps } from './mocks';

describe('StyledTableContainer', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<StyledTableContainer />);
    expect(container).toBeInTheDocument();
  });

  describe('Conditional rendering', () => {
    it('should have the dark mode CSS when the theme has a color scheme set to "dark"', () => {
      global.theme.vars = { [data: string]: 'dark' };
      const { container } = render(<StyledTableContainer />);
      expect(container).toHaveClass('mode-dark');
    });

    it('does not have the dark mode CSS when the theme does not have a color scheme set to "dark"', () => {
      delete global.theme.vars;
      const { container } = render(<StyledTableContainer />);
      expect(container).not.toHaveClass('mode-dark');
    });
  });

  describe('Props validation', () => {
    it('should throw an error when the theme is not provided', () => {
      expect(() => <StyledTableContainer />).toThrowError('Theme is required');
    });

    it('should render correctly with a valid theme prop', () => {
      const { container } = render(<StyledTableContainer theme={mockProps.theme} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('should trigger the hover event on a table row', () => {
      const handleHover = jest.fn();
      const { container } = render(<StyledTableContainer onMouseEnter={handleHover} />);
      const tableRow = screen.getByRole('row');
      fireEvent.mouseOver(tableRow);
      expect(handleHover).toHaveBeenCalledTimes(1);
    });

    it('should trigger the hover event on a table cell', () => {
      const handleHover = jest.fn();
      const { container } = render(<StyledTableContainer onMouseEnter={handleHover} />);
      const tableCell = screen.getByRole('cell');
      fireEvent.mouseOver(tableCell);
      expect(handleHover).toHaveBeenCalledTimes(1);
    });
  });

  describe('State changes', () => {
    it('should update the theme state when the dark mode switch is toggled', () => {
      jest.spyOn(global.theme, 'setTheme').mockImplementation(() => {});
      const { container } = render(<StyledTableContainer />);
      const darkModeSwitch = screen.getByRole('switch');
      fireEvent.click(darkModeSwitch);
      expect(global.theme.setTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshots', () => {
    it('should match the expected snapshot for a valid theme prop', () => {
      const { container } = render(<StyledTableContainer theme={mockProps.theme} />);
      expect(container).toMatchSnapshot();
    });

    it('should match the expected snapshot for an invalid theme prop', () => {
      const { container } = render(<StyledTableContainer theme={{}} />);
      expect(container).toMatchSnapshot();
    });
  });
});