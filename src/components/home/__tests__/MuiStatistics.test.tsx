import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MuiStatistics from './MuiStatistics';

describe('MuiStatistics component', () => {
  const MockBox = ({ children, ...props }: any) => <Box {...props}>{children}</Box>;
  const MockTypography = ({ children, ...props }: any) => <Typography {...props}>{children}</Typography>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { getByText } = render(<MuiStatistics />);
    expect(getByText(/weekly downloads on npm/)).toBeInTheDocument();
  });

  it('renders data with valid props', async () => {
    const { getAllByRole } = render(<MuiStatistics data={data} />);
    const boxes = getAllByRole('region');
    expect(boxes.length).toBe(data.length);
  });

  it('renders data with invalid prop', async () => {
    const { getByText } = render(<MuiStatistics data={[{ title: 'Invalid' }]}/>);
    expect(getByText(/Invalid/)).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders only one box for xs screen size', async () => {
      const { getAllByRole, queryAllByRole } = render(<MuiStatistics data={data} />);
      const boxesSmall = await queryAllByRole('region');
      expect(boxesSmall.length).toBe(1);
    });

    it('renders all boxes for sm screen size', async () => {
      const { getAllByRole, queryAllByRole } = render(<MuiStatistics data={data} sx={{ '@media (min-width: 600px)': { display: 'none' } }} />);
      const boxesSmall = await queryAllByRole('region');
      expect(boxesSmall.length).toBe(data.length);
    });

    it('renders only one box for lg screen size', async () => {
      const { getAllByRole, queryAllByRole } = render(<MuiStatistics data={data} sx={{ '@media (min-width: 600px)': { display: 'none' } }} />);
      const boxesLarge = await queryAllByRole('region');
      expect(boxesLarge.length).toBe(1);
    });
  });

  it('calls onCardClick when clicked', async () => {
    const mockOnCardClick = jest.fn();
    const { getAllByRole, getByText } = render(<MuiStatistics data={data} onCardClick={mockOnCardClick} />);
    const box = await getByRole('region');
    fireEvent.click(box);
    expect(mockOnCardClick).toHaveBeenCalledTimes(1);
  });

  it('calls onChange when input changed', async () => {
    const mockOnChange = jest.fn();
    const { getAllByRole, getByText } = render(<MuiStatistics data={data} onChange={mockOnChange} />);
    const box = await getByRole('region');
    fireEvent.change(box, { target: { value: 'New Value' } });
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when form submitted', async () => {
    const mockOnSubmit = jest.fn();
    const { getAllByRole, getByText } = render(<MuiStatistics data={data} onSubmit={mockOnSubmit} />);
    const box = await getByRole('region');
    fireEvent.click(box);
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders with correct styles', async () => {
    const { getAllByRole, getByText } = render(<MuiStatistics data={data} sx={{ display: 'none' }} />);
    const box = await getByRole('region');
    expect(box).toHaveStyle({
      display: 'none',
    });
  });

  it('matches snapshot', async () => {
    const { asFragment } = render(<MuiStatistics data={data} />);
    expect(asFragment()).toMatchSnapshot();
  });
});