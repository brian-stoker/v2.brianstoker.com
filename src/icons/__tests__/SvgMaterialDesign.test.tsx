import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import RootSvg, { RootSvgProps } from 'src/icons/RootSvg';
import SvgMaterialDesign from './SvgMaterialDesign.test.tsx';

describe('SvgMaterialDesign component', () => {
  let props: RootSvgProps;
  let wrapper: React.ReactElement;

  beforeEach(() => {
    props = {
      foo: 'bar',
    };

    wrapper = render(<SvgMaterialDesign {...props} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(wrapper).toBeInTheDocument();
    });

    it('renders SVG element with correct attributes', () => {
      const svgElement = wrapper.querySelector('svg');
      expect(svgElement).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
      expect(svgElement).toHaveAttribute('width', '24');
      expect(svgElement).toHaveAttribute('height', '24');
      expect(svgElement).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('renders circle element with correct attributes', () => {
      const circleElement = wrapper.querySelector('circle');
      expect(circleElement).toHaveAttribute('cx', '12');
      expect(circleElement).toHaveAttribute('cy', '12');
      expect(circleElement).toHaveAttribute('r', '12');
      expect(circleElement).toHaveAttribute('fill', '#737373');
    });

    it('renders path element with correct attributes', () => {
      const pathElement = wrapper.querySelector('path');
      expect(pathElement).toHaveAttribute('fillRule', 'evenodd');
      expect(pathElement).toHaveAttribute('clipRule', 'evenodd');
      expect(pathElement).toHaveAttribute('fill', '#BDBDBD');
    });

    it('renders path element with correct d attribute', () => {
      const pathElement = wrapper.querySelector('path');
      expect(pathElement).toHaveAttribute('d', 'M4 4h16v16H4z');
    });
  });

  describe('Props validation', () => {
    it('accepts valid props', () => {
      const wrapper = render(<SvgMaterialDesign foo="bar" />);
      expect(wrapper.props).toEqual({ foo: 'bar' });
    });

    it('throws error when receiving invalid prop', () => {
      // @ts-ignore
      jest.spyOn(SvgMaterialDesign.prototype, '_validateProps');
      expect(() => render(<SvgMaterialDesign foo={null} />)).toThrowError();
      // @ts-ignore
      jest.restoreAllMocks();
    });
  });

  describe('User interactions', () => {
    it('renders when clicked', () => {
      const wrapper = render(<SvgMaterialDesign />);
      fireEvent.click(wrapper);
      expect(wrapper).toHaveClass('active');
    });

    it('renders when input changes', () => {
      const wrapper = render(<SvgMaterialDesign />);
      fireEvent.change(document.querySelector('#input') as HTMLInputElement, { target: 'foo' });
      expect(wrapper.props.foo).toBe('foo');
    });

    it('submits form when submitted', () => {
      // @ts-ignore
      jest.spyOn(SvgMaterialDesign.prototype, '_handleSubmitForm');
      const wrapper = render(<SvgMaterialDesign />);
      fireEvent.submit(document.querySelector('#form') as HTMLFormElement);
      expect(wrapper.props).toEqual({ foo: 'bar' });
      // @ts-ignore
      jest.restoreAllMocks();
    });
  });

  describe('Side effects', () => {
    it('renders when side effect function is called', async () => {
      const wrapper = render(<SvgMaterialDesign />);
      jest.spyOn(SvgMaterialDesign.prototype, '_sideEffectFunction');
      await waitFor(() => expect(wrapper.props).toEqual({ foo: 'bar' }));
      // @ts-ignore
      jest.restoreAllMocks();
    });
  });

  describe('Snapshots', () => {
    it('renders as expected', () => {
      const wrapper = render(<SvgMaterialDesign />);
      expect(wrapper).toMatchSnapshot();
    });
  });
});