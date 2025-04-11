import { render } from '@testing-library/react';
import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';

const useStylesMock = (props) => {
  const classes = {};

  return props;
};

jest.mock('@mui/styles', () => ({
  makeStyles: () => (...args) => ({},
}));

describe('HybridGlobalCss component tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    await render(<HybridGlobalCss />);
  });

  describe('props validation', () => {
    const props = {};

    it('should receive all required props', async () => {
      const { getByText } = render(<HybridGlobalCss {...props} />);
      expect(getByText(/root/)).toBeInTheDocument();
    });

    it('should not receive invalid prop', async () => {
      const { getByText } = render(<HybridGlobalCss invalidProp='invalid' />);
      expect(() => getByText(/invalid/)).toThrowError(/Invalid prop/);
    });
  });

  describe('conditional rendering', () => {
    const props = {};

    it('should render child element', async () => {
      await render(<HybridGlobalCss {...props} />);
      const childElement = document.querySelector('.child');
      expect(childElement).toBeInTheDocument();
    });

    it('should not render child element on root class', async () => {
      await render(<HybridGlobalCss {...props} className={'root'} />);
      const childElement = document.querySelector('.child');
      expect(childElement).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    const props = {};

    it('should handle click on root element', async () => {
      const { getByText } = render(<HybridGlobalCss {...props} />);
      const rootElement = document.querySelector('.root');
      await simulate('click', rootElement);
      expect(rootElement).toHaveClass('clicked');
    });

    it('should not handle click on child element', async () => {
      await render(<HybridGlobalCss {...props} />);
      const childElement = document.querySelector('.child');
      await simulate('click', childElement);
      expect(childElement).not.toHaveClass('clicked');
    });
  });

  describe('snapshot test', () => {
    const props = {};

    it('should match snapshot', async () => {
      const { asFragment } = render(<HybridGlobalCss {...props} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});