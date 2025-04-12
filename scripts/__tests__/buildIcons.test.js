import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import buildIcons from './buildIcons';

describe('Build Icons Component', () => {
  const mocks = {
    gm: jest.fn(),
  };

  beforeEach(() => {
    Object.values(mocks).forEach((fn) => fn.mockClear());
  });

  afterEach(() => {
    Object.keys(mocks).forEach((key) => {
      if (mocks[key].mock) {
        mocks[key].mockRestore();
      }
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<buildIcons />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    const sizes = [48, 96, 180, 192, 256, 384, 512];

    it.each(sizes)('%dx%d size icon renders', async (size) => {
      mocks.gm.mockImplementation(() => Promise.resolve());
      const { getByText } = render(<buildIcons sizes={[size]} />);
      expect(getByText(`${size}x${size}`)).toBeInTheDocument();
    });

    it('no icon renders without size prop', () => {
      const { container } = render(<buildIcons />);
      expect(container).not.toHaveClassName('icon');
    });
  });

  describe('prop validation', () => {
    it('valid sizes prop is passed through', () => {
      const { getByText } = render(<buildIcons sizes={[48, 96]} />);
      expect(getByText('48x96')).toBeInTheDocument();
    });

    it('invalid size prop throws an error', async () => {
      mocks.gm.mockImplementation(() => Promise.reject(new Error()));
      const { getByText } = render(<buildIcons sizes={[1, 2]} />);
      await waitFor(() => expect(mocks.gm).toHaveBeenCalledTimes(3));
      expect(mocks.gm).toHaveBeenCalledWith('path/to/icon.png', 48, 48);
    });
  });

  describe('user interactions', () => {
    const sizes = [48, 96, 180, 192, 256, 384, 512];

    it.each(sizes)('%dx%d size icon click event is handled correctly', async (size) => {
      mocks.gm.mockImplementation(() => Promise.resolve());
      const { getByText } = render(<buildIcons sizes={[size]} />);
      const iconElement = getByText(`${size}x${size}`);
      fireEvent.click(iconElement);
      expect(mocks.gm).toHaveBeenCalledTimes(1);
    });

    it('no icon click event is handled without size prop', () => {
      const { getByText } = render(<buildIcons />);
      const iconElement = getByText('No Icon');
      fireEvent.click(iconElement);
      expect(mocks.gm).not.toHaveBeenCalled();
    });
  });

  describe('side effects or state changes', () => {
    it('icon generation starts without errors', async () => {
      mocks.gm.mockImplementation(() => Promise.resolve());
      const { getByText } = render(<buildIcons />);
      await waitFor(() => expect(mocks.gm).toHaveBeenCalledTimes(1));
    });

    it('no side effects or state changes occur when props are invalid', async () => {
      mocks.gm.mockImplementation(() => Promise.reject(new Error()));
      const { getByText } = render(<buildIcons sizes={[1, 2]} />);
      await waitFor(() => expect(mocks.gm).toHaveBeenCalledTimes(3));
    });
  });

  it('renders correctly when mock gm returns an error', async () => {
    mocks.gm.mockImplementationOnce(() => Promise.reject(new Error()));
    const { getByText } = render(<buildIcons />);
    await waitFor(() => expect(getByText('Error')).toBeInTheDocument());
  });

  it('snapshot test for icons generated without errors', async () => {
    mocks.gm.mockImplementation(() => Promise.resolve());
    const { container } = render(<buildIcons />);
    await waitFor(() => expect(container).toMatchSnapshot());
  });
});