import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { createMemoryHistory, createBrowser } from 'history';
import Box, { BoxProps } from '@mui/material/Box';
import Frame, { FrameDemo, FrameInfo, Frame } from './Frame';

const mockCreateTheme = () => {
  return {
    palette: {
      gradients: {
        linearSubtle: '#C7D2E7',
      },
      colors: {
        primaryDark: '#1a202c',
      },
    },
    themeApplyDarkStyles: (theme) => {
      return {};
    },
  };
};

const history = createMemoryHistory();
const browser = createBrowser(history);

describe('Frame component', () => {
  beforeEach(() => {
    document.body.style = 'display: block';
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.unmockModule('@mui/material');
  });

  it('renders without crashing', async () => {
    const { container } = render(<Frame sx={[]}>{}</Frame>);
    expect(container).toBeInTheDocument();
  });

  describe('FrameDemo component', () => {
    let mockRef: any;
    let mockSx: any;

    beforeEach(() => {
      mockRef = jest.fn();
      mockSx = [];
    });

    it('renders without crashing', async () => {
      const { container } = render(<FrameDemo ref={mockRef} sx={mockSx}>{}</FrameDemo>);
      expect(container).toBeInTheDocument();
    });

    it('passes props to Box component', async () => {
      const props: BoxProps = {};
      const { container, getByText } = render(<FrameDemo ref={mockRef} sx={mockSx} {...props}>{}</FrameDemo>);
      expect(getByText(props.id)).toBeInTheDocument();
      expect(mockRef).toHaveBeenCalledTimes(1);
    });

    it('renders with correct styles', async () => {
      mockSx.push({
        position: 'relative',
        border: '1px solid',
        background: '#C7D2E7',
        borderColor: 'grey.100',
        ...mockCreateTheme().themeApplyDarkStyles({}),
      });
      const { container } = render(<FrameDemo ref={mockRef} sx={mockSx}>{}</FrameDemo>);
      expect(container).toHaveStyleRule('border-color', 'grey.100');
    });

    it('renders with array of styles', async () => {
      mockSx.push([
        {
          position: 'relative',
          border: '1px solid',
          background: '#C7D2E7',
          borderColor: 'grey.100',
        },
        {
          color: 'blue',
        },
      ]);
      const { container } = render(<FrameDemo ref={mockRef} sx={mockSx}>{}</FrameDemo>);
      expect(container).toHaveStyleRule('border-color', 'grey.100');
    });

    it('renders with default styles', async () => {
      mockSx.push({ overflow: 'initial' });
      const { container } = render(<FrameDemo ref={mockRef} sx={mockSx}>{}</FrameDemo>);
      expect(container).toHaveStyleRule('overflow', 'initial');
    });

    it('renders with invalid style', async () => {
      try {
        render(<FrameDemo ref={mockRef} sx={[{ invalid: true }]}>{}</FrameDemo>);
      } catch (error) {}
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('FrameInfo component', () => {
    let mockRef: any;
    let mockSx: any;

    beforeEach(() => {
      mockRef = jest.fn();
      mockSx = [];
    });

    it('renders without crashing', async () => {
      const { container } = render(<FrameInfo ref={mockRef} sx={mockSx}>{}</FrameInfo>);
      expect(container).toBeInTheDocument();
    });

    it('passes props to Box component', async () => {
      const props: BoxProps = {};
      const { container, getByText } = render(<FrameInfo ref={mockRef} sx={mockSx} {...props}>{}</FrameInfo>);
      expect(getByText(props.id)).toBeInTheDocument();
      expect(mockRef).toHaveBeenCalledTimes(1);
    });

    it('renders with correct styles', async () => {
      mockSx.push({
        color: '#fff',
        p: 2,
        bgcolor: 'common.black',
        border: '1px solid',
        borderColor: 'primaryDark.700',
        borderTop: 0,
        colorScheme: 'dark',
        '* pre, code': {
          bgcolor: 'common.black',
        },
        ...mockCreateTheme().themeApplyDarkStyles({}),
      });
      const { container } = render(<FrameInfo ref={mockRef} sx={mockSx}>{}</FrameInfo>);
      expect(container).toHaveStyleRule('border-color', 'primaryDark.700');
    });

    it('renders with array of styles', async () => {
      mockSx.push([
        {
          color: 'blue',
        },
      ]);
      const { container } = render(<FrameInfo ref={mockRef} sx={mockSx}>{}</FrameInfo>);
      expect(container).toHaveStyleRule('border-color', 'primaryDark.700');
    });

    it('renders with default styles', async () => {
      mockSx.push({ overflow: 'initial' });
      const { container } = render(<FrameInfo ref={mockRef} sx={mockSx}>{}</FrameInfo>);
      expect(container).toHaveStyleRule('overflow', 'initial');
    });

    it('renders with invalid style', async () => {
      try {
        render(<FrameInfo ref={mockRef} sx={[{ invalid: true }]}>{}</FrameInfo>);
      } catch (error) {}
      expect(error).toBeInstanceOf(Error);
    });
  });
});