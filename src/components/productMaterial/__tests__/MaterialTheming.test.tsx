import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MaterialTheming from './MaterialTheming.test.tsx';

const mockSetPaused = jest.fn();

describe('MaterialTheming component', () => {
  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<MaterialTheming />);
    expect(container).not.toThrowError();
  });

  describe('Conditional rendering', () => {
    it('renders PlayerCard when customTheme is true', async () => {
      const { getByText } = render(<MaterialTheming customized={true} />);
      expect(getByText('PlayerCard')).toBeInTheDocument();
    });

    it('renders disableTheming PlayerCard when customTheme is false', async () => {
      const { getByText } = render(<MaterialTheming customized={false} />);
      expect(getByText('disableTheming PlayerCard')).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('should not throw an error when all props are valid', () => {
      const component = render(<MaterialTheming />);
      expect(() => component).not.toThrowError();
    });

    it('should throw an error when customTheme prop is invalid', async () => {
      await expect(render(<MaterialTheming customized={false} />)).rejects.toThrowError(
        'Invalid prop: "customized" expected to be a boolean, but got null'
      );
    });
  });

  describe('User interactions', () => {
    it('should call setPaused when play/pause button is clicked', async () => {
      const { getByText } = render(<MaterialTheming />);
      const playPauseButton = getByText('Play music');
      fireEvent.click(playPauseButton);
      expect(mockSetPaused).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot tests', () => {
    it('renders correctly with custom theme', async () => {
      await waitFor(() => {
        const { asFragment } = render(<MaterialTheming customized={true} />);
        expect(asFragment()).toMatchSnapshot();
      });
    });

    it('renders correctly without custom theme', async () => {
      await waitFor(() => {
        const { asFragment } = render(<MaterialTheming customized={false} />);
        expect(asFragment()).toMatchSnapshot();
      });
    });
  });
});