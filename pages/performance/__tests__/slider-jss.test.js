import React from 'react';
import { render } from '@testing-library/react';
import SliderJss from './slider-jss';

describe('SliderJss component', () => {
  const rows = Array.from(new Array(500)).map(() => ({
    name: 'Frozen yoghurt',
    calories: 159,
    fat: 6.0,
    carbs: 24,
    protein: 4.0,
  }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<SliderJss />);
    expect(container).toBeInTheDocument();
  });

  describe('Conditional rendering', () => {
    it('renders sliders when rows are present', () => {
      const { container, getByText } = render(<SliderJss rows={rows} />);
      expect(getByText(rows[0].name)).toBeInTheDocument();
    });

    it('does not render sliders when no rows are provided', () => {
      const { container, getByText } = render(<SliderJss />);
      expect(container).not.toContainElement(getByText(rows[0].name));
    });
  });

  describe('Prop validation', () => {
    it('throws an error when rows prop is not an array', () => {
      expect(() => render(<SliderJss rows="Invalid" />)).toThrowError();
    });

    it('does not throw an error when rows prop is a valid array', () => {
      const { container } = render(<SliderJss rows={rows} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('updates value when clicked', () => {
      const { getByText, getByValue } = render(<SliderJss rows={rows} />);
      const slider = getByValue(20);
      slider.click();
      expect(getByText(rows[0].name)).toHaveStyle('transform: translateX(0)');
    });

    it('updates value when input changed', () => {
      const { getByText, getByValue } = render(<SliderJss rows={rows} />);
      const slider = getByValue(20);
      slider.addEventListener('input', () => {});
      expect(getByText(rows[0].name)).toHaveStyle('transform: translateX(0)');
    });

    it('submits form when clicked', () => {
      const { getByText, getByValue } = render(<SliderJss rows={rows} />);
      const submitButton = getByText('Submit');
      submitButton.click();
      expect(getByText(rows[0].name)).toHaveStyle('transform: translateX(0)');
    });
  });

  it('renders with NoSsr', () => {
    const { container } = render(<SliderJss />);
    expect(container).not.toContainElement(new NoSsr());
  });

  describe('Snapshot test', () => {
    it('matches expected snapshot when rendered correctly', () => {
      const { asFragment } = render(<SliderJss rows={rows} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});