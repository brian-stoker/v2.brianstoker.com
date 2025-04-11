import * as React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent, waitFor } from '@testing-library/react';
import SliderEmotion from './slider-emotion';

jest.mock('@mui/material/Slider', () => ({
  __esModule: true,
}));

const data = {
  name: 'Frozen yoghurt',
  calories: 159,
  fat: 6.0,
  carbs: 24,
  protein: 4.0,
};

const rows = Array.from(new Array(500)).map(() => data);

describe('SliderEmotion component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<SliderEmotion />);
    expect(container).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it('renders all sliders', async () => {
      const { getAllByRole } = render(<SliderEmotion />);
      const sliderElements = await getAllByRole('slider');
      expect(sliderElements.length).toBe(500);
    });

    it('does not render any sliders when NoSsr is false', async () => {
      const mockNoSsr = jest.fn();
      global.NoSsr = mockNoSsr;
      const { container } = render(<SliderEmotion />);
      expect(container).not.toHaveClass('MuiNoSsr');
    });
  });

  describe('Props Validation', () => {
    it('renders with valid props', async () => {
      const { container } = render(<SliderEmotion data={data} />);
      expect(container).toBeTruthy();
    });

    it('does not render when NoSsr prop is false', async () => {
      const { container } = render(<SliderEmotion data={data} noSsr={false} />);
      expect(container).not.toHaveClass('MuiNoSsr');
    });

    it('throws an error when NoSsr prop is not a boolean', async () => {
      expect(() => render(<SliderEmotion data={data} noSsr='test' />)).toThrowError();
    });
  });

  describe('User Interactions', () => {
    const value = 20;

    it('calls onChange callback with correct value when slider is clicked', async () => {
      const onChangeMock = jest.fn();
      const { getByRole } = render(<SliderEmotion data={data} onChange={onChangeMock} />);
      const sliderElements = await getAllByRole('slider');
      fireEvent.change(sliderElements[0], { target: { value } });
      expect(onChangeMock).toHaveBeenCalledTimes(1);
      expect(onChangeMock).toHaveBeenCalledWith(value);
    });

    it('does not call onChange callback when NoSsr is true', async () => {
      const onChangeMock = jest.fn();
      global.NoSsr = true;
      const { getByRole } = render(<SliderEmotion data={data} onChange={onChangeMock} />);
      const sliderElements = await getAllByRole('slider');
      fireEvent.change(sliderElements[0], { target: { value } });
      expect(onChangeMock).not.toHaveBeenCalled();
    });

    it('calls form submission event when form is submitted', async () => {
      const onSubmitMock = jest.fn();
      const { getByRole, byId } = render(<SliderEmotion data={data} onSubmit={onSubmitMock} />);
      const formElement = byId('form');
      fireEvent.submit(formElement);
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  it('has a snapshot test', async () => {
    const { asFragment } = render(<SliderEmotion data={data} />);
    await waitFor(() => {
      const snapshot = asFragment();
      expect(snapshot).toMatchSnapshot();
    });
  });
});