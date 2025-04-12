import { render, fireEvent, waitFor } from '@testing-library/react';
import { ThemeButton } from './ThemeButton';
import React from 'react';

describe('ThemeButton', () => {
  const setup = ({ children }: any) => render(<ThemeButton>{children}</ThemeButton>);
  const mockClick = jest.fn();
  const mockChange = jest.fn();

  beforeEach(() => {
    mockClick.mockReset();
    mockChange.mockReset();
  });

  it('renders without crashing', () => {
    const { container } = setup({});

    expect(container).toBeInTheDocument();
  });

  describe('Conditional Rendering', () => {
    it('renders install everything button with contained variant', () => {
      const { getByText } = setup({
        children: <Button variant="contained">Install everything</Button>,
      });

      expect(getByText('Install everything')).toBeInTheDocument();
    });

    it('renders learn about it button with outlined variant', () => {
      const { getByText } = setup({
        children: <Button variant="outlined">Learn about it</Button>,
      });

      expect(getByText('Learn about it')).toBeInTheDocument();
    });
  });

  describe('Prop Validation', () => {
    it('accepts valid props', () => {
      const { container, getByText } = setup({});

      expect(getByText('Install everything')).toBeInTheDocument();
      expect(getByText('Learn about it')).toBeInTheDocument();

      expect(mockClick).not.toHaveBeenCalled();
      expect(mockChange).not.toHaveBeenCalled();
    });

    it('rejects invalid props', () => {
      const { container, getByText } = setup({
        children: <div>Invalid child</div>,
      });

      expect(getByText('Install everything')).toBeInTheDocument();
      expect(getByText('Learn about it')).toBeInTheDocument();

      expect(mockClick).not.toHaveBeenCalled();
      expect(mockChange).not.toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('clicks install everything button', async () => {
      const { getByText } = setup({
        children: <Button variant="contained">Install everything</Button>,
      });

      await fireEvent.click(getByText('Install everything'));

      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('clicks learn about it button', async () => {
      const { getByText } = setup({
        children: <Button variant="outlined">Learn about it</Button>,
      });

      await fireEvent.click(getByText('Learn about it'));

      expect(mockClick).not.toHaveBeenCalled();
      expect(mockChange).not.toHaveBeenCalled();
    });

    it('changes install everything button text', async () => {
      const { getByText } = setup({
        children: <Button variant="contained">Install everything</Button>,
      });

      await fireEvent.change(getByText('Install everything'), { target: { value: 'New Install Everything' } });

      expect(mockChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot Test', () => {
    it('renders correctly with snapshot test', async () => {
      const { asFragment, getByText } = setup({
        children: <Button variant="contained">Install everything</Button>,
      });

      await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
  });

  it('does not crash on click', async () => {
    const { container } = setup({});

    fireEvent.click(container.querySelector('button'));

    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});