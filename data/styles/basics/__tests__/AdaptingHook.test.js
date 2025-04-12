import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import AdaptingHook from './AdaptingHook.test.js';
import { makeStyles } from '@mui/styles';
import Button from '@mui/material/Button';

const useStylesMock = (props) => {
  return {
    root: {
      background: props.color === 'red' ? 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      border: 0,
      borderRadius: 3,
      boxShadow: props.color === 'red' ? '0 3px 5px 2px rgba(255, 105, 135, .3)' : '0 3px 5px 2px rgba(33, 203, 243, .3)',
      color: 'white',
      height: 48,
      padding: '0 30px',
      margin: 8,
    },
  };
};

describe('AdaptingHook', () => {
  beforeEach(() => {
    global.innerWidth = 800;
    document.body.style.backgroundColor = '#f0f0f0';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<AdaptingHook />);
    expect(container).toBeInTheDocument();
  });

  it('renders MyButton with correct styles and props', async () => {
    const { getByText, getAllByRole } = render(<AdaptingHook />);
    const redButton = getByText('Red');
    const blueButton = getAllByRole('button')[1];

    expect(redButton).toHaveStyle({
      background: '#FE6B8B',
    });
    expect(blueButton).toHaveStyle({
      background: '#2196F3',
    });

    expect(getByText('Red')).toBeInstanceOf(Button);
    expect(getByText('Blue')).toBeInstanceOf(Button);
  });

  it('renders MyButton with invalid color prop', async () => {
    const { getByText, getAllByRole } = render(<AdaptingHook />);
    const wrongColorButton = getAllByRole('button')[2];

    expect(wrongColorButton).not.toBeInTheDocument();
  });

  it('calls useStyles with correct props when component is mounted', async () => {
    const useStylesMockSpy = jest.spyOn(makeStyles, 'useStyles');
    const { getByText, getAllByRole } = render(<AdaptingHook />);
    const redButton = getByText('Red');

    expect(useStylesMockSpy).toHaveBeenCalledWith({ color: 'red' });
  });

  it('calls MyButton\'s className property with correct value when component is mounted', async () => {
    const { getByText, getAllByRole } = render(<AdaptingHook />);
    const redButton = getByText('Red');

    expect(redButton).toHaveClass('MuiButton-root');
  });

  it('calls fireEvent.click on MyButton when clicked', async () => {
    const { getByText, getAllByRole } = render(<AdaptingHook />);
    const redButton = getByText('Red');

    await waitFor(() => {
      fireEvent.click(redButton);
    });

    expect(greenButton).toBeInTheDocument();
  });

  it('calls MyButton\'s className property with updated value when clicked', async () => {
    const { getByText, getAllByRole } = render(<AdaptingHook />);
    const redButton = getByText('Red');

    await waitFor(() => {
      fireEvent.click(redButton);
    });

    expect(greenButton).toHaveClass('MuiButton-root');
  });
});