import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent, waitFor } from '@testing-library/react';
import SliderJss from './slider-jss';

const data = {
  name: 'Frozen yoghurt',
  calories: 159,
  fat: 6.0,
  carbs: 24,
  protein: 4.0,
};

const rows = Array.from(new Array(500)).map(() => data);

jest.mock('@mui/material/Slider', () => ({
  Slider: ({ value }) => value === '20' && <div>Slider</div>,
}));

describe('SliderJss component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<SliderJss />);
    expect(container).toBeTruthy();
  });

  it('renders sliders in a grid layout', async () => {
    const { getByRole, getByText } = render(<SliderJss />);
    await waitFor(() => getByRole('slider'));
    expect(getByRole('slider')).toHaveLength(500);
    expect(getByText(data.name)).toBeInTheDocument();
  });

  it('renders the correct slider value', async () => {
    const { getByRole, getByText } = render(<SliderJss />);
    await waitFor(() => getByRole('slider'));
    const slider = getByRole('slider');
    expect(slider).toHaveValue('20');
  });

  it('renders a no-SSR component', async () => {
    jest.spyOn(NoSsr, 'defer').mockImplementation(() => <div>No SSR</div>);
    const { container } = render(<SliderJss />);
    expect(container).toHaveTextContent('No SSR');
  });

  it('prop validation - renders without crashing with valid props', async () => {
    const { container } = render(<SliderJss rows={rows} />);
    expect(container).toBeTruthy();
  });

  it('prop validation - crashes with invalid prop types', async () => {
    expect(() =>
      render(
        <SliderJss
          rows={{
            name: 'Frozen yoghurt',
            calories: 159,
            fat: 6.0,
            carbs: 24,
            protein: 4.0,
          }}
        />
      )
    ).toThrowError();
  });

  it('prop validation - crashes with invalid prop values', async () => {
    expect(() =>
      render(
        <SliderJss
          rows={Array.from(new Array(500)).map(() => 'Invalid value')}
        />
      )
    ).toThrowError();
  });

  it('user interaction - clicks a slider', async () => {
    const { getByRole, getByText } = render(<SliderJss />);
    await waitFor(() => getByRole('slider'));
    const slider = getByRole('slider');
    fireEvent.click(slider);
    expect(slider).toHaveValue('20');
  });

  it('user interaction - changes a slider value', async () => {
    const { getByRole, getByText } = render(<SliderJss />);
    await waitFor(() => getByRole('slider'));
    const slider = getByRole('slider');
    fireEvent.change(slider, { target: { value: '30' } });
    expect(slider).toHaveValue('30');
  });

  it('user interaction - forms submission', async () => {
    jest.spyOn(SliderJss.prototype, 'handleSubmit').mockImplementation(() => {});
    const { getByRole, getByText } = render(<SliderJss />);
    await waitFor(() => getByRole('slider'));
    const slider = getByRole('slider');
    fireEvent.change(slider, { target: { value: '40' } });
    expect(slider).toHaveValue('40');
  });

  it('side effect - logs a message to the console', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    const { getByRole, getByText } = render(<SliderJss />);
    await waitFor(() => getByRole('slider'));
    const slider = getByRole('slider');
    fireEvent.click(slider);
    expect(console.log).toHaveBeenCalledTimes(1);
  });
});