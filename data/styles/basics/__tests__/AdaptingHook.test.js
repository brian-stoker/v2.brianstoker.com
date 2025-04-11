import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import AdaptingHook from './AdaptingHook.test.js';
import Button from '@mui/material/Button';

jest.mock('@mui/styles', () => ({
  makeStyles: (theme) => ({ root: {} }),
}));

describe('AdaptingHook', () => {
  beforeEach(() => {
    jest.clearMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<AdaptingHook />);
    expect(container).not.toBeNull();
  });

  describe('conditional rendering paths', () => {
    it('renders red button when color is red', () => {
      const { container } = render(
        <AdaptingHook>
          <MyButton color="red">Red</MyButton>
        </AdaptingHook>,
      );
      expect(container.querySelector('.MuiButton-root')).toHaveStyle(
        'background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      );
    });

    it('renders blue button when color is blue', () => {
      const { container } = render(
        <AdaptingHook>
          <MyButton color="blue">Blue</MyButton>
        </AdaptingHook>,
      );
      expect(container.querySelector('.MuiButton-root')).toHaveStyle(
        'background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      );
    });

    it('renders default style when color is not provided', () => {
      const { container } = render(<AdaptingHook />);
      expect(container.querySelector('.MuiButton-root')).toHaveStyle({
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      });
    });

    it('does not render when color is invalid', () => {
      const { container } = render(
        <AdaptingHook>
          <MyButton color="invalid">Invalid</MyButton>
        </AdaptingHook>,
      );
      expect(container.querySelector('.MuiButton-root')).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('validates color prop is oneOf(["blue", "red"])', () => {
      const { container } = render(
        <AdaptingHook>
          <MyButton color="green">Green</MyButton>
        </AdaptingHook>,
      );
      expect(container.querySelector('.MuiButton-root')).toBeNull();
    });

    it('validates color prop is not empty', () => {
      const { container } = render(
        <AdaptingHook>
          <MyButton color="">"></MyButton>
        </AdaptingHook>,
      );
      expect(container.querySelector('.MuiButton-root')).toBeNull();
    });
  });

  describe('user interactions', () => {
    it('calls onClick callback when button is clicked', async () => {
      const onClick = jest.fn();
      const { container } = render(
        <AdaptingHook>
          <MyButton color="red" onClick={onClick}>Click me!</MyButton>
        </AdaptingHook>,
      );
      fireEvent.click(container.querySelector('.MuiButton-root'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onChange callback when input changes', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <AdaptingHook>
          <MyButton color="red" onChange={onChange}>Type something!</MyButton>
        </AdaptingHook>,
      );
      fireEvent.change(container.querySelector('.MuiButton-root'), {
        target: { value: 'Hello, world!' },
      });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('submits form when button is clicked', async () => {
      const onSubmit = jest.fn();
      const { container } = render(
        <AdaptingHook>
          <MyButton color="red" onSubmit={onSubmit}>Submit!</MyButton>
        </AdaptingHook>,
      );
      fireEvent.click(container.querySelector('.MuiButton-root'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('renders new styles after state change', async () => {
      const { container } = render(
        <AdaptingHook>
          <MyButton color="red">Red</MyButton>
        </AdaptingHook>,
      );
      await waitFor(() => expect(container.querySelector('.MuiButton-root')).toHaveStyle({
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      }));
    });
  });

  describe('snapshot test', () => {
    it('renders as expected', async () => {
      const { container } = render(<AdaptingHook />);
      expect(container).toMatchSnapshot();
    });
  });
});