import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import HomeView from './index';
import { photography } from './photography';

describe('HomeView component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<HomeView />);
      expect(container).toBeTruthy();
    });

    it('renders masonry image list', async () => {
      const { getByRole, getByText } = render(<HomeView />);
      await waitFor(() => expect(getByRole('img')).toBeInTheDocument());
      expect(getByText(photography[0])).toBeInTheDocument();
      for (let i = 1; i < photography.length; i++) {
        expect(getByText(photography[i])).toBeInTheDocument();
      }
    });

    it('renders correctly with props', async () => {
      const { getByText, getByRole } = render(<HomeView HomeMain={<img src="test" />} />);
      expect(getByRole('img')).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    let mockHomeMain: any;

    beforeEach(() => {
      mockHomeMain = jest.fn();
    });

    it('accepts React.ComponentType as prop HomeMain', async () => {
      render(<HomeView HomeMain={mockHomeMain} />);
      expect(mockHomeMain).toHaveBeenCalledTimes(1);
    });

    it('rejects non-React.ComponentType as prop HomeMain', async () => {
      try {
        render(<HomeView HomeMain="test" />);
        fail('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
      }
    });
  });

  describe('User interactions', () => {
    let mockHomeMain: any;

    beforeEach(() => {
      mockHomeMain = jest.fn();
    });

    it('calls HomeMain prop on click', async () => {
      const { getByRole, click } = render(<HomeView HomeMain={mockHomeMain} />);
      await waitFor(() => expect(getByRole('img')).toBeInTheDocument());
      click(getByRole('img'));
      expect(mockHomeMain).toHaveBeenCalledTimes(1);
    });

    it('calls HomeMain prop on input change', async () => {
      const { getByRole, onChange } = render(<HomeView HomeMain={mockHomeMain} />);
      await waitFor(() => expect(getByRole('img')).toBeInTheDocument());
      const imgInput = document.querySelector('input') as HTMLInputElement;
      onChange(imgInput);
      expect(mockHomeMain).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot test', () => {
    it('renders correctly and matches previous snapshot', async () => {
      const { container } = render(<HomeView />);
      await waitFor(() => expect(getByRole('img')).toBeInTheDocument());
      expect(container).toMatchSnapshot();
    });
  });
});