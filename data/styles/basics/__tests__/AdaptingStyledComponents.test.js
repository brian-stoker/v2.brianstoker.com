import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MyButton from './AdaptingStyledComponents';
import { create } from 'jest-styled-components';

const styled = create();

describe('MyButton', () => {
  const myButtonStyles = styled(({ color }) => ({
    background: (props) =>
      props.color === 'red'
        ? 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)'
        : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    border: 0,
    borderRadius: 3,
    boxShadow: (props) =>
      props.color === 'red'
        ? '0 3px 5px 2px rgba(255, 105, 135, .3)'
        : '0 3px 5px 2px rgba(33, 203, 243, .3)',
    color: 'white',
    height: 48,
    padding: '0 30px',
    margin: 8,
  }));

  const Button = ({ children, color }) => (
    <MyButton styles={myButtonStyles({ color })}>
      {children}
    </MyButton>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Button>Click me!</Button>);
  });

  it('renders with red color', async () => {
    const { getByText } = render(
      <Button color="red">Red</Button>
    );

    await waitFor(() => expect(getByText('Red')).toBeInTheDocument());
  });

  it('renders with blue color', async () => {
    const { getByText } = render(<Button color="blue">Blue</Button]);

    await waitFor(() => expect(getByText('Blue')).toBeInTheDocument());
  });

  it('changes background on click', async () => {
    const { getByText, getByRole } = render(
      <Button>Click me!</Button>
    );

    const button = getByRole('button');
    fireEvent.click(button);

    await waitFor(() => expect(getByRole('button')).toHaveStyle('background: linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)'));
  });

  it('changes text color on click', async () => {
    const { getByText, getByRole } = render(
      <Button>Click me!</Button>
    );

    const button = getByRole('button');
    fireEvent.click(button);

    await waitFor(() => expect(getByText('Click me!')).toHaveStyle('color: white'));
  });

  it('renders with invalid color prop', () => {
    expect(() => render(<Button color="invalid">Invalid</Button>)).toThrowError(
      'style background must be a function',
    );
  });

  it('renders with missing color prop', () => {
    expect(() => render(<Button>Click me!</Button>)).toThrowError(
      'style background must be a function',
    );
  });
});