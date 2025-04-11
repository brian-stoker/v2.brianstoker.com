import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ThemeButton from './ThemeButton';

jest.mock('@mui/material/Button', () => ({
  Button: ({ children }) => <div>{children}</div>,
}));

describe('ThemeButton component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<ThemeButton />);
    expect(container).toBeInTheDocument();
  });

  it('renders all buttons', () => {
    const { getAllByRole } = render(<ThemeButton />);
    const buttons = getAllByRole('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0]).toHaveTextContent('Install everything');
    expect(buttons[1]).toHaveTextContent('Learn about it');
  });

  it('displays different variants', () => {
    const { getByRole } = render(<ThemeButton />);
    const button = getByRole('button', { name: 'Install everything' });
    expect(button).toHaveStyle('background-color: #4caf50; color: white;');
    const outlinedButton = getByRole('button', { name: 'Learn about it' });
    expect(outlinedButton).toHaveStyle('background-color: transparent; border: 1px solid #4CAF50;');
  });

  it('does not crash with invalid props', () => {
    expect(() =>
      render(<ThemeButton invalidProp="test" />)
    ).not.toThrow();
  });

  it('does not crash with invalid variant prop', () => {
    expect(() =>
      render(<ThemeButton variant="invalid" />)
    ).not.toThrow();
  });

  it('calls the onClick handler when clicked', () => {
    const handleButtonClick = jest.fn();
    const { getByText } = render(
      <ThemeButton onClick={handleButtonClick} />
    );
    const button = getByText('Install everything');
    fireEvent.click(button);
    expect(handleButtonClick).toHaveBeenCalledTimes(1);
  });

  it('calls the onInput handler when input changes', () => {
    const handleInputChange = jest.fn();
    const { getByText } = render(
      <ThemeButton onInput={handleInputChange} />
    );
    const button = getByText('Install everything');
    fireEvent.change(button, { target: { value: 'new input' } });
    expect(handleInputChange).toHaveBeenCalledTimes(1);
  });

  it('calls the onSubmit handler when form is submitted', () => {
    const handleSubmit = jest.fn();
    const { getByText } = render(
      <form>
        <ThemeButton onSubmit={handleSubmit} />
      </form>
    );
    const button = getByText('Install everything');
    fireEvent.submit(button);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders a snapshot of the component', () => {
    const { asFragment } = render(<ThemeButton />);
    expect(asFragment()).toMatchSnapshot();
  });
});