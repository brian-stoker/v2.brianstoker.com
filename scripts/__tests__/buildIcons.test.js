import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import buildIcons from './buildIcons';

jest.mock('gm', () => ({
  resize: jest.fn(),
}));

describe('Build Icons Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<buildIcons />);
    expect(container).toBeInTheDocument();
  });

  it('renders with valid props', () => {
    const { getByText } = render(<buildIcons />);
    expect(getByText('Generating Icons')).toBeInTheDocument();
  });

  it('renders with invalid size prop', () => {
    const { container, getByText } = render(
      <buildIcons sizes={[48]} />
    );
    expect(getByText('Invalid size prop')).toBeInTheDocument();
  });

  describe('User Interactions', () => {
    it('calls resize function on click', async () => {
      const resizeMock = jest.fn();
      const { getByText, getByRole } = render(
        <buildIcons sizes={[48]} resize={resizeMock} />
      );
      const button = getByRole('button');
      fireEvent.click(button);
      expect(resizeMock).toHaveBeenCalledTimes(1);
    });

    it('calls resize function on input change', async () => {
      const resizeMock = jest.fn();
      const { getByText, getByRole } = render(
        <buildIcons sizes={[48]} resize={resizeMock} />
      );
      const input = getByRole('textbox');
      fireEvent.change(input, { target: { value: '100' } });
      expect(resizeMock).toHaveBeenCalledTimes(1);
    });

    it('submits form on submit', async () => {
      const resizeMock = jest.fn();
      const { getByText, getByRole } = render(
        <buildIcons sizes={[48]} resize={resizeMock} />
      );
      const button = getByRole('button');
      fireEvent.change(button, { type: 'submit' });
      expect(resizeMock).toHaveBeenCalledTimes(1);
    });
  });

  it('renders icon for each size', async () => {
    await waitFor(() => {
      const icons = render(<buildIcons />);
      expect(icons).toHaveStyle('background-image: url("output/48x48.png")');
      expect(icons).toHaveStyle('background-image: url("output/96x96.png")');
      expect(icons).toHaveStyle('background-image: url("output/180x180.png")');
    });
  });

  it('generates icons with mock resize function', async () => {
    const resizeMock = jest.fn();
    await waitFor(() => {
      render(<buildIcons sizes={[48]} resize={resizeMock} />);
      expect(resizeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('throws error for invalid size prop', async () => {
      expect.assertions(2);
      await waitFor(() => {
        render(<buildIcons sizes={[48, 'invalid']} />);
        expect(jest.console.log).toHaveBeenCalledTimes(1);
        expect(jest.console.log).toHaveBeenCalledWith('Invalid size prop');
      });
    });

    it('throws error for invalid output dir', async () => {
      jest.spyOn(process, 'cwd').mockImplementation(() => '../public/static/icons/invalid');
      await waitFor(() => {
        render(<buildIcons />);
        expect(jest.console.log).toHaveBeenCalledTimes(1);
        expect(jest.console.log).toHaveBeenCalledWith('Invalid output directory');
      });
    });

    it('generates icons with mock resize function and invalid size', async () => {
      jest.spyOn(process, 'cwd').mockImplementation(() => '../public/static/icons/invalid');
      const resizeMock = jest.fn();
      await waitFor(() => {
        render(<buildIcons sizes={[48]} resize={resizeMock} />);
        expect(resizeMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('matches snapshot', async () => {
    const icons = render(<buildIcons />);
    await waitFor(() => {
      expect(icons).toMatchSnapshot();
    });
  });
});