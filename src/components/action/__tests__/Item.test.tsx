import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { render } from 'vitest';
import { createMockTheme } from './mocks/theme.mock';

describe('Group component', () => {
  const theme = createMockTheme();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('props', () => {
    it('renders with default props', () => {
      const { container } = render(
        <Group desktopColumns={1} rowLayout={false} />,
        { theme }
      );
      expect(container).toMatchSnapshot();
    });

    it('handles invalid prop types', () => {
      expect(() => <Group desktopColumns={null} rowLayout={true} />).toThrowError();
    });

    it('handles missing required props', () => {
      expect(() => <Group rowLayout={false} />).toThrowError();
    });
  });

  describe('conditional rendering', () => {
    it('renders row layout on medium and up screens', () => {
      const { container } = render(
        <Group desktopColumns={1} rowLayout={true} />,
        { theme }
      );
      expect(container).toMatchSnapshot();
    });

    it('renders grid layout on small screens', () => {
      const { container } = render(
        <Group desktopColumns={1} rowLayout={false} />,
        { theme }
      );
      expect(container).toMatchSnapshot();
    });
  });

  describe('user interactions', () => {
    it('calls onChange prop when icon is clicked', () => {
      const onChangeMock = jest.fn();
      const { container } = render(
        <Group
          desktopColumns={1}
          rowLayout={false}
          onChange={() => onChangeMock()}
        />,
        { theme }
      );
      const icon = container.querySelector('span');
      icon.click();
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('calls onChange prop when description is changed', () => {
      const onChangeMock = jest.fn();
      const { container } = render(
        <Item
          description="new description"
          onChange={() => onChangeMock()}
        />,
        { theme }
      );
      const inputField = container.querySelector('input');
      inputField.value = '';
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects and state changes', () => {
    it('calls useEffect hook when scroll is detected', async () => {
      const useScrollEffectMock = jest.fn();
      const { container } = render(
        <Group
          desktopColumns={1}
          rowLayout={false}
          useScrollEffect={useScrollEffectMock}
        />,
        { theme }
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(useScrollEffectMock).toHaveBeenCalledTimes(1);
    });
  });

  it('renders correctly with mock theme', () => {
    const { container } = render(<Group desktopColumns={1} rowLayout={false} />, { theme });
    expect(container).toMatchSnapshot();
  });
});

describe('Item component', () => {
  // Similar tests as for Group component
});