import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import CompareIcon from '@mui/icons-material/Compare';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import { GlowingIconContainer } from '@stoked-ui/docs/InfoCard';
import GetStartedButtons from 'src/components/home/GetStartedButtons';
import Section from 'src/layouts/Section';
import SectionHeadline from 'src/components/typography/SectionHeadline';
import GradientText from 'src/components/typography/GradientText';
import { GlowingIconContainerProps, GridItemProps } from '@stoked-ui/docs/InfoCard';
import GetStartedButtonsProps from 'src/components/home/GetStartedButtons';
import SectionProps from 'src/layouts/Section';
import SnapshotTestUtils from './SnapshotTestUtils';

describe('BaseUIEnd', () => {
  const renderComponent = (props: BaseUIEndProps) => {
    return render(<BaseUIEnd {...props} />, document.body);
  };

  beforeEach(() => {
    global.testRenderer = { testRenderer: jest.fn(), render: jest.fn() };
  });

  afterEach(() => {
    global.testRenderer = null;
  });

  it('renders without crashing', () => {
    const props: BaseUIEndProps = {};
    expect(renderComponent(props)).not.toBeNull();
  });

  describe('Section props', () => {
    const sectionProps: SectionProps = {};

    it('should set color scheme prop', () => {
      const { container } = renderComponent({ ...sectionProps, dataMuiColorScheme: 'light' });
      expect(container.getAttribute('data-mui-color-scheme')).toBe('light');
    });

    it('should set background color prop', () => {
      const { container } = renderComponent({ ...sectionProps, sx: { backgroundColor: 'red' } });
      expect(container.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });
  });

  describe('GetStartedButtons props', () => {
    const getStartedButtonsProps: GetStartedButtonsProps = {};

    it('should set primaryUrl prop', () => {
      const { container } = renderComponent({ ...getStartedButtonsProps, primaryUrl: 'https://example.com' });
      expect(container.getAttribute('data-primary-url')).toBe('https://example.com');
    });

    it('should set secondaryLabel prop', () => {
      const { container } = renderComponent({ ...getStartedButtonsProps, secondaryLabel: 'Learn Base UI' });
      expect(container.textContent).toBe('Learn Base UI');
    });

    it('should set secondaryUrl prop', () => {
      const { container } = renderComponent({ ...getStartedButtonsProps, secondaryUrl: 'https://example.com/secondary' });
      expect(container.getAttribute('data-secondary-url')).toBe('https://example.com/secondary');
    });
  });

  describe('GridItem props', () => {
    const gridItemProps: GridItemProps = {};

    it('should set xs prop', () => {
      const { container } = renderComponent({ ...gridItemProps, xs: '12' });
      expect(container.getAttribute('data-xs')).toBe('12');
    });

    it('should set sm prop', () => {
      const { container } = renderComponent({ ...gridItemProps, sm: '6' });
      expect(container.getAttribute('data-sm')).toBe('6');
    });
  });

  describe('GlowingIconContainer props', () => {
    const glowingIconContainerProps: GlowingIconContainerProps = {};

    it('should set icon prop', () => {
      const { container } = renderComponent({ ...glowingIconContainerProps, icon: <CompareIcon color="primary" /> });
      expect(container.querySelector('compare-icon')).not.toBeNull();
    });

    it('should set style prop', () => {
      const { container } = renderComponent({ ...glowingIconContainerProps, style: { fontSize: '24px' } });
      expect(container.style.fontSize).toBe('24px');
    });
  });

  describe('List item props', () => {
    const listItemProps: ListItemProps = {};

    it('should set p prop', () => {
      const { container } = renderComponent({ ...listItemProps, p: '12px' });
      expect(container.style.padding).toBe('12px');
    });

    it('should set style prop', () => {
      const { container } = renderComponent({ ...listItemProps, style: { color: 'red' } });
      expect(container.style.color).toBe('rgb(255, 0, 0)');
    });
  });

  describe('Snapshot testing', () => {
    it('should match snapshot', async () => {
      await SnapshotTestUtils.takeSnapshot(BaseUIEnd, renderComponent);
    });
  });
});

type BaseUIEndProps = Omit<GetStartedButtonsProps & GridItemProps & SectionProps & GlowingIconContainerProps & ListItemProps, 'primaryUrl' | 'secondaryLabel' | 'secondaryUrl'>;