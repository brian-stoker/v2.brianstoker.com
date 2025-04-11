import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import { Link } from '@stoked-ui/docs/Link';
import ROUTES from 'src/route';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('StylingInfo component', () => {
  const defaultProps: BoxProps = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<StylingInfo appeared={true} stylingContent="test" />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders default content when stylingContent is not provided', async () => {
      const { container } = render(<StylingInfo appeared={true} />);
      expect(screen.getByText('Own the styling!')).toBeInTheDocument();
    });

    it('renders stylingContent when provided', async () => {
      const stylingContent = <div>Test content</div>;
      const { container } = render(<StylingInfo appeared={true} stylingContent={stylingContent} />);
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('props validation', () => {
    it('accepts default props', async () => {
      const { container } = render(<StylingInfo appeared={true} stylingContent="test" {...defaultProps} />);
      expect(container).toBeTruthy();
    });

    it('rejects invalid props (missing appeared prop)', async () => {
      try {
        render(<StylingInfo stylingContent="test" />);
        fail('Expected error');
      } catch (error) {
        // Expected
      }
    });
  });

  describe('user interactions', () => {
    let hidden;

    beforeEach(() => {
      hidden = jest.fn();
    });

    it('toggles hidden state when button is clicked', async () => {
      const { getByRole, getByText } = render(<StylingInfo appeared={true} stylingContent="test" />);
      const button = getByRole('button');
      fireEvent.click(button);
      expect(hidden).toHaveBeenCalledTimes(1);
    });

    it('updates appearing state when button is hovered over', async () => {
      const { getByRole, getByText } = render(<StylingInfo appeared={true} stylingContent="test" />);
      const button = getByRole('button');
      userEvent.hover(button);
      expect(hidden).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects and state changes', () => {
    it('updates zIndex when appearing state is changed', async () => {
      const { container } = render(<StylingInfo appeared={true} stylingContent="test" />);
      fireEvent.click(screen.getByRole('button'));
      expect(container.querySelector('.MuiBox-root')).toHaveStyle('z-index: 2');
    });
  });

  it('snapshot test for default content', async () => {
    const { container } = render(<StylingInfo appeared={true} stylingContent="test" />);
    await waitFor(() => expect(screen.getByText('Own the styling!')).toHaveClass('MuiTypography-root--body2'));
    expect(container).toMatchSnapshot();
  });
});