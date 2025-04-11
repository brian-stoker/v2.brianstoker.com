import React from 'react';
import { createSvgIcon } from '@mui/material/utils';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { SvgIcon, SvgIconProps } from './SvgIcon';

jest.mock('@mui/material/utils', () => ({
  createSvgIcon: jest.fn((icon, name) => ({ icon, name })),
}));

describe('SvgIcon component', () => {
  const props: SvgIconProps = {
    icon: <g fill="none" fillRule="evenodd">
      <circle fill="#737373" cx="12" cy="12" r="12" />
      <path fill="#BDBDBD" d="M4 4h16v16H4z" />
      <path fill="#FFF" d="M12 20l8-16H4z" />
    </g>,
    name: 'MaterialDesign',
  };

  beforeEach(() => {
    global.console = { log: jest.fn() };
  });

  afterEach(() => {
    global.console.log = jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    const svgIcon = render(<SvgIcon {...props} />);
    expect(svgIcon).toMatchSnapshot();
  });

  describe('conditional rendering', () => {
    it('should render icon correctly when icon prop is provided', () => {
      const svgIcon = render(<SvgIcon {...props} />);
      expect(svgIcon.getByRole('img')).not.toBeNull();
    });

    it('should not render icon when icon prop is not provided', () => {
      const svgIcon = render(<SvgIcon name="MaterialDesign" />);
      expect(svgIcon.getByRole('img')).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('should validate icon prop with valid SVG markup', () => {
      props.icon = <g fill="none" fillRule="evenodd">
        <circle fill="#737373" cx="12" cy="12" r="12" />
        <path fill="#BDBDBD" d="M4 4h16v16H4z" />
        <path fill="#FFF" d="M12 20l8-16H4z" />
      </g>;
      const svgIcon = render(<SvgIcon {...props} />);
      expect(svgIcon.getByRole('img')).not.toBeNull();
    });

    it('should not validate icon prop with invalid SVG markup', () => {
      props.icon = <div>invalid SVG</div>;
      const svgIcon = render(<SvgIcon {...props} />);
      expect(svgIcon.getByRole('img')).toBeNull();
    });
  });

  describe('user interactions', () => {
    it('should trigger click event on icon', () => {
      const svgIcon = render(<SvgIcon {...props} />);
      const iconElement = svgIcon.getByRole('img');
      fireEvent.click(iconElement);
      expect(props).not.toHaveBeenCalledWith(null, null);
    });

    it('should not trigger click event on non-existent icon', () => {
      props.icon = null;
      const svgIcon = render(<SvgIcon {...props} />);
      const iconElement = svgIcon.getByRole('img');
      fireEvent.click(iconElement);
      expect(props).not.toHaveBeenCalledWith(null, null);
    });
  });

  it('should update name prop on click', async () => {
    const svgIcon = render(<SvgIcon {...props} />);
    const iconElement = svgIcon.getByRole('img');
    fireEvent.click(iconElement);
    await waitFor(() => expect(props.name).not.toEqual('MaterialDesign'));
  });
});