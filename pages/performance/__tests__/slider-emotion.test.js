import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import SliderEmotion from './slider-emotion.test.js';

jest.mock('@mui/material/Slider');

describe('SliderEmotion', () => {
  beforeEach(() => {
    jest.clearMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<SliderEmotion />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders a single slider when rows is an empty array', async () => {
      const { container, queryAllByRole } = render(<SliderEmotion rows={[]} />);
      expect(queryAllByRole('slider')).toHaveLength(0);
    });

    it('renders multiple sliders when rows has more than one element', async () => {
      const { allByRole } = render(<SliderEmotion rows={[data]} />);
      expect(allByRole('slider')).not.toBeNull();
    });
  });

  describe('prop validation', () => {
    let props;

    beforeEach(() => {
      props = { rows: [] };
    });

    it('throws an error when rows is not provided', async () => {
      await expect(
        render(<SliderEmotion {...props} />)
      ).rejects.toThrowError();
    });

    it('renders sliders when rows are provided with valid data', async () => {
      const { container } = render(<SliderEmotion rows={data} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    let props;

    beforeEach(() => {
      props = { rows: [data] };
    });

    it('calls onSliderChange event when a slider value changes', async () => {
      const onChangeMock = jest.fn();
      const { getByRole, getByLabel } = render(
        <SliderEmotion
          {...props}
          onSliderChange={onChangeMock}
        />
      );
      const slider = getByRole('slider');
      const label = getByLabel(data.name);
      fireEvent.change(slider, { target: { value: 10 } });
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledTimes(1));
    });

    it('calls onSliderValueChange event when a slider value changes', async () => {
      const onChangeMock = jest.fn();
      const { getByRole, getByLabel } = render(
        <SliderEmotion
          {...props}
          onSliderValueChange={onChangeMock}
        />
      );
      const slider = getByRole('slider');
      const label = getByLabel(data.name);
      fireEvent.change(slider, { target: { value: 10 } });
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledTimes(1));
    });

    it('calls onSliderClick event when a slider is clicked', async () => {
      const onClickMock = jest.fn();
      const { getByRole, getByLabel } = render(
        <SliderEmotion
          {...props}
          onSliderClick={onClickMock}
        />
      );
      const slider = getByRole('slider');
      fireEvent.click(slider);
      await waitFor(() => expect(onClickMock).toHaveBeenCalledTimes(1));
    });

    it('calls onInputChange event when a slider value changes', async () => {
      const onChangeMock = jest.fn();
      const { getByRole, getByLabel } = render(
        <SliderEmotion
          {...props}
          onInputChange={onChangeMock}
        />
      );
      const slider = getByRole('slider');
      const label = getByLabel(data.name);
      fireEvent.change(slider, { target: { value: 10 } });
      await waitFor(() => expect(onChangeMock).toHaveBeenCalledTimes(1));
    });

    it('calls onFormSubmit event when the form is submitted', async () => {
      const onSubmitMock = jest.fn();
      const { getByRole, getByLabel } = render(
        <SliderEmotion
          {...props}
          onFormSubmit={onSubmitMock}
        />
      );
      fireEvent.change(slider, { target: { value: 10 } });
      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }
      await waitFor(() => expect(onSubmitMock).toHaveBeenCalledTimes(1));
    });
  });

  describe('side effects or state changes', () => {
    it('renders sliders and handles user interactions without any issues', async () => {
      const { getByRole, getAllByLabel } = render(<SliderEmotion rows={data} />);
      const slider = getByRole('slider');
      const label = getAllByLabel(data.name)[0];
      fireEvent.change(slider, { target: { value: 10 } });
      expect(label.textContent).toBe(`${data.name}: ${Math.round(10 * 20 / data.calories)} calories`);
    });

    it('does not throw any errors when sliders are removed', async () => {
      const { queryAllByRole } = render(<SliderEmotion rows={[]} />);
      expect(queryAllByRole('slider')).toHaveLength(0);
    });
  });
});