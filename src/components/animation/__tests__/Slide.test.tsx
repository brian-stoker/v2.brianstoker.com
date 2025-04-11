import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BoxProps } from '@mui/material/Box';
import Slide from './Slide.test.ts';

describe('Slide component', () => {
  it('renders without crashing', async () => {
    const props: BoxProps = {};
    await render(<Slide animationName="example" keyframes={{}} {...props} />);
  });

  describe('conditional rendering', () => {
    it('renders with correct styles when animation is enabled', async () => {
      const { getByStyle } = render(
        <Slide
          animationName="example"
          keyframes={{}}
          sx={{
            background: 'red',
          }}
        />,
      );
      expect(getByStyle('.MuiBox-animated')).toHaveStyle('background-color', 'red');
    });

    it('renders with no animation when preferred reduced motion is enabled', async () => {
      const { getByStyle } = render(
        <Slide
          animationName="example"
          keyframes={{}}
          sx={{
            background: 'blue',
          }}
          prefersReducedMotion,
        />,
      );
      expect(getByStyle('.MuiBox-animated')).toHaveStyle('background-color', 'blue');
    });

    it('renders with correct styles when animation is disabled for reduced motion', async () => {
      const { getByStyle } = render(
        <Slide
          animationName="example"
          keyframes={{}}
          sx={{
            background: 'green',
          }}
          prefersReducedMotion,
          sx={{ '@keyframes example': { background: 'green' } }},
        />,
      );
      expect(getByStyle('.MuiBox-animated')).toHaveStyle('background-color', 'green');
    });
  });

  describe('prop validation', () => {
    it('throws error for invalid animationName prop', async () => {
      const { getByText } = render(<Slide animationName="example" />);
      expect(getByText('Invalid value: Animation name must be a string')).toBeInTheDocument();
    });

    it('throws error for invalid keyframes prop', async () => {
      const { getByText } = render(<Slide animationName="example" keyframes={{}} />);
      expect(getByText('Invalid value: Keyframes object must not be null or undefined')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls onChange event when input changes', async () => {
      const onChangeMock = jest.fn();
      const { getByLabelText, getByRole } = render(
        <Slide animationName="example" keyframes={{}} onChange={onChangeMock} />,
      );
      fireEvent.change(getByLabelText('Animation Name'), 'newValue');
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit event when form is submitted', async () => {
      const onSubmitMock = jest.fn();
      const { getByLabelText, getByRole } = render(
        <Slide animationName="example" keyframes={{}} onSubmit={onSubmitMock} />,
      );
      fireEvent.change(getByLabelText('Animation Name'), 'newValue');
      await waitFor(() => expect(onSubmitMock).toHaveBeenCalledTimes(1));
    });

    it('does not call onChange event when animation is not enabled', async () => {
      const onChangeMock = jest.fn();
      const { getByLabelText, getByRole } = render(
        <Slide animationName="example" keyframes={{}} onChange={onChangeMock} prefersReducedMotion />,
      );
      fireEvent.change(getByLabelText('Animation Name'), 'newValue');
      expect(onChangeMock).not.toHaveBeenCalled();
    });
  });

  describe('side effects and state changes', () => {
    it('updates animationName state when new value is provided', async () => {
      const updateAnimationNameMock = jest.fn();
      const { getByLabelText, getByRole } = render(
        <Slide
          animationName="example"
          keyframes={{}}
          onChange={updateAnimationNameMock}
          prefersReducedMotion,
        />,
      );
      fireEvent.change(getByLabelText('Animation Name'), 'newValue');
      expect(updateAnimationNameMock).toHaveBeenCalledTimes(1);
    });

    it('updates keyframes state when new value is provided', async () => {
      const updateKeyframesMock = jest.fn();
      const { getByLabelText, getByRole } = render(
        <Slide
          animationName="example"
          keyframes={{}}
          onChange={updateKeyframesMock}
          prefersReducedMotion,
        />,
      );
      fireEvent.change(getByLabelText('Animation Name'), 'newValue');
      expect(updateKeyframesMock).toHaveBeenCalledTimes(1);
    });
  });

  it('matches the snapshot', async () => {
    const props: BoxProps = {};
    await render(<Slide animationName="example" keyframes={{}} {...props} />);
    expect(getByStyle('.MuiBox-animated')).toHaveStyle('display', 'grid');
  });
});