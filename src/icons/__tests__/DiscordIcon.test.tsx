import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import SvgDiscord from './SvgDiscord';

describe('SvgDiscord component', () => {
  const props: SvgIconProps = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(render(<SvgDiscord {...props} />).byDefaultTextContent()).not.toBeNull();
  });

  describe('props validation', () => {
    it('renders with valid props', () => {
      const wrapper = render(<SvgDiscord {...props} />);
      expect(wrapper.getByRole('img')).toHaveAttribute('aria-hidden', 'true');
    });

    it('throws an error when no props are provided', () => {
      expect(() => render(<SvgDiscord />)).toThrowError();
    });
  });

  describe('conditional rendering', () => {
    it('renders the path element', () => {
      const wrapper = render(<SvgDiscord {...props} />);
      expect(wrapper.getByRole('img')).toHaveAttribute('aria-hidden', 'true');
    });

    it('does not render the path element when disabled', () => {
      props.disabled = true;
      const wrapper = render(<SvgDiscord {...props} />);
      expect(wrapper.queryByRole('img')).toBeNull();
    });
  });

  describe('user interactions', () => {
    it('renders correctly after clicking on it', () => {
      props.onClick && props.onClick();
      const wrapper = render(<SvgDiscord {...props} />);
      expect(wrapper.getByRole('img')).toHaveAttribute('aria-hidden', 'true');
    });

    it('calls the onClick prop when clicked', () => {
      let called = false;
      props.onClick = () => { called = true; };
      const wrapper = render(<SvgDiscord {...props} />);
      fireEvent.click(wrapper.getByRole('img'));
      expect(called).toBe(true);
    });
  });

  describe('side effects', () => {
    it('does not render correctly when loading', () => {
      // @ts-ignore
      jest.spyOn(SvgIcon, 'componentDidMount');
      props.loading = true;
      const wrapper = render(<SvgDiscord {...props} />);
      expect(wrapper.getByRole('img')).toBeNull();
    });

    it('renders correctly after loading', () => {
      // @ts-ignore
      jest.restoreAllMocks();
      props.loading = false;
      const wrapper = render(<SvgDiscord {...props} />);
      expect(wrapper.getByRole('img')).toHaveAttribute('aria-hidden', 'true');
    });
  });
});