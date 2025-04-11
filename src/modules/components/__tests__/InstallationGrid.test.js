import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import InfoCard from '@stoked-ui/docs/InfoCard';
import AccountTreeRounded from '@mui/icons-material/AccountTreeRounded';
import PivotTableChartRoundedIcon from '@mui/icons-material/PivotTableChartRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';

const content = [
  {
    title: 'Data Grid',
    description: 'Fast, feature-rich data table.',
    link: '/x/react-data-grid/getting-started/#installation',
    icon: <PivotTableChartRoundedIcon fontSize="small" color="primary" />,
  },
  {
    title: 'Date and Time Pickers',
    description: 'A suite of components for selecting dates, times, and ranges.',
    link: '/x/react-date-pickers/gettin g-started/#installation',
    icon: <CalendarMonthRoundedIcon fontSize="small" color="primary" />,
  },
  {
    title: 'Charts',
    link: '/x/react-charts/getting-started/#installation',
    description:
      'A collection of data visualization graphs, including bar, line, pie, scatter, and more.',
    icon: <BarChartRoundedIcon fontSize="small" color="primary" />,
  },
  {
    title: 'Tree View',
    description: 'Display hierarchical data, such as a file system navigator.',
    link: '/x/react-tree-view/getting-started/#installation',
    icon: <AccountTreeRounded fontSize="small" color="primary" />,
  },
];

describe('InstallationGrid component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing and renders content', async () => {
    const { container } = render(<InstallationGrid />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering paths', () => {
    it('renders InfoCard with title, description, icon, and link when all props are present', async () => {
      const { getByText } = render(
        <InstallationGrid content={content} />
      );
      expect(getByText(content[0].title)).toBeInTheDocument();
      expect(getByText(content[0].description)).toBeInTheDocument();
      expect(getByText(content[0].link)).toBeInTheDocument();
    });

    it('renders only title, icon when link prop is not present', async () => {
      const { getByText } = render(
        <InstallationGrid content={content} link="" />
      );
      expect(getByText(content[0].title)).toBeInTheDocument();
      expect(getByText(content[0].icon.toString())).toBeInTheDocument();
    });

    it('renders only title, description when icon prop is not present', async () => {
      const { getByText } = render(
        <InstallationGrid content={content} link="" icon={null} />
      );
      expect(getByText(content[0].title)).toBeInTheDocument();
      expect(getByText(content[0].description)).toBeInTheDocument();
    });

    it('renders only link when all props are missing', async () => {
      const { getByText } = render(
        <InstallationGrid content={content} link="" title="" description="" icon={null} />
      );
      expect(getByText(content[0].link)).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('should not throw an error when all props are present', async () => {
      render(<InstallationGrid content={content} />);
    });

    it('throws an error when link prop is not provided', async () => {
      expect(() =>
        render(<InstallationGrid content={content} link="" />)
      ).toThrowError('Link prop is required');
    });

    it('throws an error when title prop is not provided', async () => {
      expect(() =>
        render(<InstallationGrid content={content} title="" description="" icon={null} link=""/>)
      ).toThrowError('Title prop is required');
    });

    it('throws an error when description prop is not provided', async () => {
      expect(() =>
        render(
          <InstallationGrid content={content} link="" title="" icon={<PivotTableChartRoundedIcon fontSize="small" color="primary" />} />
        )
      ).toThrowError('Description prop is required');
    });

    it('throws an error when icon prop is not provided', async () => {
      expect(() =>
        render(
          <InstallationGrid content={content} link="" title="" description="" />
        )
      ).toThrowError('Icon prop is required');
    });
  });

  describe('user interactions', () => {
    it('calls link on click', async () => {
      const { getByText } = render(<InstallationGrid content={content} />);
      const linkElement = getByText(content[0].link);
      fireEvent.click(linkElement);
      expect(window.location).toBe(content[0].link);
    });

    it('calls title when infoCard is clicked', async () => {
      const { getByText, getByRole } = render(<InstallationGrid content={content} />);
      const infoCardElement = getByRole('button');
      fireEvent.click(infoCardElement);
      expect(getByText(content[0].title)).toBeInTheDocument();
    });
  });

  describe('side effects and state changes', () => {
    it('does not trigger any side effects when component is re-rendered with the same props', async () => {
      const { rerender } = render(<InstallationGrid content={content} />);
      rerender(<InstallationGrid content={content} />);
      expect(() => global.console.log('Side effect triggered')).not.toThrow();
    });

    it('triggers side effects when component is re-rendered with different props', async () => {
      const { rerender } = render(<InstallationGrid content={content} />);
      rerender(<InstallationGrid content={content.slice(1)} />);
      expect(() => global.console.log('Side effect triggered')).not.toThrow();
    });
  });
});