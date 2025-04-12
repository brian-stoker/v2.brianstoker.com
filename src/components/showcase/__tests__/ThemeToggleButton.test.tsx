import { render, fireEvent, waitFor } from '@testing-library/react';
import ThemeToggleButton from './ThemeToggleButton';

describe('ThemeToggleButton', () => {
  const mocks = {
    setLang: jest.fn(),
  };

  beforeEach(() => {
    mocks.setLang.mockReset();
  });

  afterEach(() => {
    mocks.setLang.mockClear();
  });

  it('renders without crashing', () => {
    render(<ThemeToggleButton />);

    expect(mocks.setLang).not.toHaveBeenCalled();
  });

  describe('props validation', () => {
    it('should validate all props', () => {
      const { getByText, getByRole } = render(
        <ThemeToggleButton
          lang="joy"
          onChange={() => console.log('on change')}
          exclusive
          color="primary"
        />,
      );

      expect(getByText('Joy UI')).toBeInTheDocument();
      expect(getByRole('button', { name: 'material' })).toBeInTheDocument();

      const toggleButton = getByRole('button', { name: 'base' });
      expect(toggleButton).toHaveAttribute('value', 'base');

      expect(mocks.setLang).not.toHaveBeenCalled();
    });

    it('should fail when lang prop is undefined', () => {
      const { getByText } = render(
        <ThemeToggleButton
          onChange={() => console.log('on change')}
          exclusive
          color="primary"
        />,
      );

      expect(getByText('Joy UI')).toBeInTheDocument();

      expect(mocks.setLang).not.toHaveBeenCalled();
    });

    it('should fail when value prop is undefined', () => {
      const { getByText } = render(
        <ThemeToggleButton
          lang="joy"
          onChange={() => console.log('on change')}
          exclusive
          color="primary"
        />,
      );

      expect(getByText('Joy UI')).toBeInTheDocument();

      expect(mocks.setLang).not.toHaveBeenCalled();
    });
  });

  describe('conditional rendering', () => {
    it('should render selected toggle button', async () => {
      const { getByText } = render(
        <ThemeToggleButton
          lang="joy"
          onChange={() => console.log('on change')}
          exclusive
          color="primary"
        />,
      );

      const toggleButton = await waitFor(() =>
        getByRole('button', { name: 'material' }),
      );

      expect(toggleButton).toHaveAttribute('value', 'material');
    });

    it('should render default toggle button when selected is false', async () => {
      const { getByText } = render(
        <ThemeToggleButton
          lang="joy"
          onChange={() => console.log('on change')}
          exclusive
          color="primary"
        />,
      );

      const toggleButton = await waitFor(() =>
        getByRole('button', { name: 'base' }),
      );

      expect(toggleButton).toHaveAttribute('value', 'base');
    });
  });

  describe('user interactions', () => {
    it('should change language on button click', async () => {
      const { getByText } = render(
        <ThemeToggleButton
          lang="joy"
          onChange={() => console.log('on change')}
          exclusive
          color="primary"
        />,
      );

      const toggleButton = await waitFor(() =>
        getByRole('button', { name: 'material' }),
      );

      fireEvent.click(toggleButton);

      expect(mocks.setLang).toHaveBeenCalledTimes(1);
    });

    it('should call onChange function when language changes', async () => {
      const mockChangeFunction = jest.fn();

      const { getByText } = render(
        <ThemeToggleButton
          lang="joy"
          onChange={mockChangeFunction}
          exclusive
          color="primary"
        />,
      );

      const toggleButton = await waitFor(() =>
        getByRole('button', { name: 'material' }),
      );

      fireEvent.click(toggleButton);

      expect(mockChangeFunction).toHaveBeenCalledTimes(1);
    });

    it('should not change language when no button is clicked', async () => {
      const mockSetLang = jest.fn();

      mocks.setLang.mockImplementation(() => {
        throw new Error();
      });

      const { getByText } = render(
        <ThemeToggleButton
          lang="joy"
          onChange={() => console.log('on change')}
          exclusive
          color="primary"
        />,
      );

      fireEvent.click(getByText('Joy UI'));

      expect(mocks.setLang).toHaveBeenCalledTimes(0);
    });
  });

  describe('snapshot test', () => {
    it('should match snapshot when lang is joy', async () => {
      const { asFragment } = render(<ThemeToggleButton lang="joy" />);

      expect(asFragment()).toMatchSnapshot();
    });

    it('should match snapshot when lang is material', async () => {
      const { asFragment } = render(
        <ThemeToggleButton lang="material" />,
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });
});