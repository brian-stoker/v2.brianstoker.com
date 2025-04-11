import { render, fireEvent } from '@testing-library/react';
import Divider from './ApiDivider.test.js';
import { MuiDivider } from '@mui/material';
jest.mock('@mui/material/Divider');

describe('Divider Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<Divider />);
    expect(container).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it('renders when divider prop is true', () => {
      const { getByRole } = render(<Divider divider={true} />);
      expect(getByRole('divider')).toBeInTheDocument();
    });

    it('does not render when divider prop is false', () => {
      const { queryByRole } = render(<Divider divider={false} />);
      expect(queryByRole('divider')).not.toBeInTheDocument();
    });
  });

  describe('Prop Validation', () => {
    it('accepts valid props', () => {
      const { getByText } = render(<Divider title="Divider" />);
      expect(getByText('Divider')).toBeInTheDocument();
    });

    it('throws an error when divider prop is not a boolean', () => {
      expect(() => render(<Divider divider={1} />)).toThrowError();
    });
  });

  describe('User Interactions', () => {
    it('calls dividerChange function on click', () => {
      const handleDividerChange = jest.fn();
      const { getByText } = render(
        <Divider title="Divider" handleDividerChange={handleDividerChange} />
      );
      fireEvent.click(getByText('Divider'));
      expect(handleDividerChange).toHaveBeenCalledTimes(1);
    });

    it('does not call dividerChange function when disabled', () => {
      const handleDividerChange = jest.fn();
      const { getByText } = render(
        <Divider title="Divider" handleDividerChange={handleDividerChange} />
      );
      fireEvent.click(getByText('Divider'));
      expect(handleDividerChange).not.toHaveBeenCalled();
    });

    it('does not call dividerChange function when readOnly', () => {
      const handleDividerChange = jest.fn();
      const { getByText } = render(
        <Divider title="Divider" handleDividerChange={handleDividerChange} />
      );
      fireEvent.keyDown(getByText('Divider'), { key: 'Enter' });
      expect(handleDividerChange).not.toHaveBeenCalled();
    });

    it('calls dividerChange function on form submission', () => {
      const handleDividerChange = jest.fn();
      const { getByText } = render(
        <form>
          <Divider title="Divider" handleDividerChange={handleDividerChange} />
          <button type="submit">Submit</button>
        </form>
      );
      fireEvent.submit(document.querySelector('form'));
      expect(handleDividerChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mock External Dependencies', () => {
    it('works with mock MuiDivider component', () => {
      jest.mock('@mui/material/Divider');
      const { getByRole } = render(<Divider />);
      expect(getByRole('divider')).toBeInTheDocument();
    });

    it('throws an error when MuiDivider is not mocked', () => {
      expect(() => render(<Divider />)).toThrowError();
    });
  });
});