import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Box from '@mui/material/Box';
import ProgressBar from './ProgressBar';

describe('ProgressBar component', () => {
  let progressBars: any;

  beforeEach(() => {
    progressBars = [];
  });

  it('renders without crashing', async () => {
    const { getByText } = render(<ProgressBar value={50} />);
    expect(getByText('50 %')).toBeInTheDocument();
  });

  it('renders dark theme with correct colors', async () => {
    const { getByText, queryByColor } = render(
      <Box>
        <ProgressBar value={30} />
        <ProgressBar value={70} />
      </Box>,
      { theme: 'dark' }
    );
    expect(queryByColor('error.700')).toBeInTheDocument();
    expect(queryByColor('warning.900')).toBeInTheDocument();
    expect(queryByColor('success.800')).toBeInTheDocument();
  });

  it('renders light theme with correct colors', async () => {
    const { getByText, queryByColor } = render(
      <Box>
        <ProgressBar value={30} />
        <ProgressBar value={70} />
      </Box>,
      { theme: 'light' }
    );
    expect(queryByColor('error.200')).toBeInTheDocument();
    expect(queryByColor('warning.400')).toBeInTheDocument();
    expect(queryByColor('success.300')).toBeInTheDocument();
  });

  it('renders with correct width and height', async () => {
    const { getByText, queryByStyle } = render(<ProgressBar value={50} />);
    expect(queryByStyle('width: 50%')).toBeInTheDocument();
    expect(queryByStyle('height: 100%')).toBeInTheDocument();
  });

  it('updates progress bar on value change', async () => {
    const { getByText } = render(<ProgressBar value={30} />);
    fireEvent.change(getByText('Value'), { target: { value: '70' } });
    await waitFor(() => expect(getByText('70 %')).toBeInTheDocument());
  });

  it('updates color and width on progress bar change', async () => {
    const { getByText, queryByColor, queryByStyle } = render(<ProgressBar value={30} />);
    fireEvent.change(getByText('Value'), { target: { value: '50' } });
    await waitFor(() => expect(queryByColor('error.200')).toBeInTheDocument());
    await waitFor(() => expect(queryByStyle('width: 50%')).toBeInTheDocument());
  });

  it('renders with no props when no props are passed', () => {
    const { getByText } = render(<ProgressBar />);
    expect(getByText('0 %')).toBeInTheDocument();
  });

  it('throws an error if value is not a number', () => {
    expect(() => <ProgressBar value="abc" />).toThrowError(
      'value must be a number'
    );
  });

  describe('renders conditional rendering', () => {
    const renderWithCondition = (condition: boolean, value?: number) => {
      return render(
        <Box>
          {condition && <ProgressBar value={value} />}
        </Box>,
        {}
      );
    };

    it('renders when condition is true', async () => {
      const { getByText } = renderWithCondition(true, 50);
      expect(getByText('50 %')).toBeInTheDocument();
    });

    it('does not render when condition is false', async () => {
      const { queryByText } = renderWithCondition(false, 50);
      expect(queryByText).not.toBeInTheDocument();
    });
  });

  describe('renders with theme changes', () => {
    const renderWithThemeChange = (theme: string) => {
      return render(
        <Box>
          <ProgressBar value={30} />
          <ProgressBar value={70} />
        </Box>,
        { theme }
      );
    };

    it('applies dark theme colors', async () => {
      const { getByText, queryByColor } = renderWithThemeChange('dark');
      expect(queryByColor('error.700')).toBeInTheDocument();
      expect(queryByColor('warning.900')).toBeInTheDocument();
      expect(queryByColor('success.800')).toBeInTheDocument();
    });

    it('applies light theme colors', async () => {
      const { getByText, queryByColor } = renderWithThemeChange('light');
      expect(queryByColor('error.200')).toBeInTheDocument();
      expect(queryByColor('warning.400')).toBeInTheDocument();
      expect(queryByColor('success.300')).toBeInTheDocument();
    });
  });
});