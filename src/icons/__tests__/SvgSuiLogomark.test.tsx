import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import SvgSuiLogomark from './SvgSuiLogomark';

describe('SvgSuiLogomark component', () => {
  it('renders without crashing', async () => {
    const props: RootSvgProps = {};
    const { container } = render(<SvgSuiLogomark {...props} />);
    expect(container).toBeTruthy();
  });

  it('renders with correct xmlns and viewBox attributes', async () => {
    const props: RootSvgProps = {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '-0.0000999984 0.000012666 13.16 17.7'
    };
    const { container } = render(<SvgSuiLogomark {...props} />);
    expect(container.querySelector('svg').getAttribute('xmlns')).toBe(props.xmlns);
    expect(container.querySelector('svg').getAttribute('viewBox')).toBe(props.viewBox);
  });

  it('renders with correct fill attribute', async () => {
    const props: RootSvgProps = { fill: 'red' };
    const { container } = render(<SvgSuiLogomark {...props} />);
    expect(container.querySelector('svg').getAttribute('fill')).toBe(props.fill);
  });

  it('passes props to svg element', async () => {
    const props: RootSvgProps = {
      width: 36,
      height: 32
    };
    const { container } = render(<SvgSuiLogomark {...props} />);
    expect(container.querySelector('svg')).toHaveAttribute('width', String(props.width));
    expect(container.querySelector('svg')).toHaveAttribute('height', String(props.height));
  });

  it('renders correctly when no props are passed', async () => {
    const { container } = render(<SvgSuiLogomark />);
    expect(container).toBeTruthy();
  });

  it('calls handleClick prop when svg is clicked', async () => {
    const handleClickMock = jest.fn();
    const props: RootSvgProps = {
      onClick: handleClickMock
    };
    const { getByRole } = render(<SvgSuiLogomark {...props} />);
    const svg = getByRole('img');
    fireEvent.click(svg);
    expect(handleClickMock).toHaveBeenCalledTimes(1);
  });

  it('calls handleMouseOver prop when svg is hovered', async () => {
    const onMouseOverMock = jest.fn();
    const props: RootSvgProps = {
      onMouseOver: onMouseOverMock
    };
    const { getByRole } = render(<SvgSuiLogomark {...props} />);
    const svg = getByRole('img');
    svg.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(onMouseOverMock).toHaveBeenCalledTimes(1);
  });

  it('calls handleMouseOut prop when svg is hovered out', async () => {
    const onMouseOutMock = jest.fn();
    const props: RootSvgProps = {
      onMouseOut: onMouseOutMock
    };
    const { getByRole } = render(<SvgSuiLogomark {...props} />);
    const svg = getByRole('img');
    svg.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
    expect(onMouseOutMock).toHaveBeenCalledTimes(1);
  });
});