import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Status from './Status.test.tsx';

describe('Status component', () => {
  let mockProps: Partial<StatusProps>;
  let mockStatuses: string[];
  const mockChangeHandler = jest.fn();
  const mockHandleClick = jest.fn();

  beforeEach(() => {
    mockProps = { status: 'Open' };
    mockStatuses = ['PartiallyFilled', 'Rejected'];
    mockProps.status = undefined;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Status {...mockProps} />);
    expect(screen.getByRole('chip')).toBeInTheDocument();
  });

  it('renders partially filled status as partial chip label', () => {
    mockProps.status = 'PartiallyFilled';
    render(<Status {...mockProps} />);
    expect(screen.getByText('Partial')).toBeInTheDocument();
  });

  it('renders rejected status as error chip label', () => {
    mockProps.status = 'Rejected';
    render(<Status {...mockProps} />);
    expect(screen.getByRole('chip')).toHaveStyle({
      borderColor: 'error.500',
      bgcolor: alpha('#000000', 0.1),
      color: 'error.600',
    });
  });

  it('renders filled status as success chip label', () => {
    mockProps.status = 'Filled';
    render(<Status {...mockProps} />);
    expect(screen.getByRole('chip')).toHaveStyle({
      borderColor: 'success.500',
      bgcolor: alpha('#000000', 0.1),
      color: 'success.800',
    });
  });

  it('renders open status as primary chip label', () => {
    mockProps.status = 'Open';
    render(<Status {...mockProps} />);
    expect(screen.getByRole('chip')).toHaveStyle({
      borderColor: 'primary.500',
      bgcolor: alpha('#000000', 0.1),
      color: 'primary.600',
    });
  });

  it('calls change handler when input changes', () => {
    mockChangeHandler.mockImplementation(() => {});
    render(<Status {...mockProps} onChange={mockChangeHandler} />);
    screen.getByRole('input').value = 'Filled';
    expect(mockChangeHandler).toHaveBeenCalledTimes(1);
  });

  it('calls click handler when chip is clicked', () => {
    mockHandleClick.mockImplementation(() => {});
    render(<Status {...mockProps} onClick={mockHandleClick} />);
    const chip = screen.getByRole('chip');
    act(() => chip.click());
    expect(mockHandleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with default props when status is undefined', () => {
    mockProps.status = undefined;
    render(<Status {...mockProps} />);
    expect(screen.getByRole('chip')).toHaveStyle({
      fontSize: '10px',
      fontWeight: 'bold',
    });
  });

  it('does not throw error when invalid prop is provided', () => {
    const invalidProp = 123;
    expect(() => render(<Status status={invalidProp} />)).not.toThrow();
  });
});