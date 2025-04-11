import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import DemoToolbarRoot from './DemoToolbarRoot';

describe('DemoToolbarRoot', () => {
  let wrapper: React.ReactElement;
  let propsMock: Partial<DemoToolbarRootProps>;
  const theme = {
    breakpoints: { sm: 600 },
    palette: {
      divider: '#ccc',
      grey: {
        50: '#f7f7f7',
        primaryDark: '#333',
      },
      transitions: {
        create: 'transition',
      },
    },
    direction: 'ltr',
  };

  beforeEach(() => {
    propsMock = {
      demoOptions: { bg: 'inline' },
      openDemoSource: true,
    };
  });

  afterEach(() => {
    wrapper = null;
  });

  describe('rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<DemoToolbarRoot {...propsMock} />);
      expect(container).toBeTruthy();
    });
  });

  describe('conditional rendering', () => {
    it('renders without crashing when openDemoSource is false', () => {
      propsMock.openDemoSource = false;
      const { container } = render(<DemoToolbarRoot {...propsMock} />);
      expect(container).toBeTruthy();
    });

    it('renders with correct styles when demoOptions.bg is "inline"', () => {
      propsMock.demoOptions = { bg: 'inline' };
      const { getByRole } = render(<DemoToolbarRoot {...propsMock} />);
      expect(getByRole('presentation')).toHaveStyle(
        `background-color: rgba(${theme.palette.grey[50]}, 0.2)`
      );
    });

    it('renders with correct styles when demoOptions.bg is not "inline"', () => {
      propsMock.demoOptions = { bg: 'default' };
      const { getByRole } = render(<DemoToolbarRoot {...propsMock} />);
      expect(getByRole('presentation')).toHaveStyle(
        `background-color: rgba(${theme.palette.grey[50]}, 0.2)`
      );
    });
  });

  describe('prop validation', () => {
    it('throws an error when demoOptions is invalid', () => {
      expect(() =>
        render(<DemoToolbarRoot {...propsMock} demoOptions={null} />)
      ).toThrowError();
    });

    it('throws an error when openDemoSource is invalid', () => {
      expect(() =>
        render(<DemoToolbarRoot {...propsMock} openDemoSource={false} />)
      ).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('calls click event handler when clicking the toolbar', () => {
      const onClickHandler = jest.fn();
      propsMock.onClick = onClickHandler;
      const { getByRole } = render(<DemoToolbarRoot {...propsMock} />);
      fireEvent.click(getByRole('presentation'));
      expect(onClickHandler).toHaveBeenCalledTimes(1);
    });

    it('calls onChange event handler when input changes', () => {
      const onChangeHandler = jest.fn();
      propsMock.onChange = onChangeHandler;
      const { getByLabel } = render(<DemoToolbarRoot {...propsMock} />);
      const inputField = getByLabel('demo-options');
      fireEvent.change(inputField, { target: { value: 'new-value' } });
      expect(onChangeHandler).toHaveBeenCalledTimes(1);
    });

    it('calls form submission event handler when submitting the form', () => {
      const onSubmitHandler = jest.fn();
      propsMock.onSubmit = onSubmitHandler;
      const { getByRole } = render(<DemoToolbarRoot {...propsMock} />);
      fireEvent.submit(getByRole('presentation'));
      expect(onSubmitHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('snapshot tests', () => {
    it('renders with the correct styles when demoOptions.bg is "inline"', () => {
      propsMock.demoOptions = { bg: 'inline' };
      const { asFragment } = render(<DemoToolbarRoot {...propsMock} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('renders with the correct styles when demoOptions.bg is not "inline"', () => {
      propsMock.demoOptions = { bg: 'default' };
      const { asFragment } = render(<DemoToolbarRoot {...propsMock} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});