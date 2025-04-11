import React from 'react';
import RootSvg, { RootSvgProps } from 'src/icons/RootSvg';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import mockProps from './mocks/rootSvg.mock';
import { MockProvider } from './MockProvider';

describe('SvgMuiX component', () => {
  const root = mount(<MockProvider><SvgMuiX {...mockProps} /></MockProvider>);
  let props: RootSvgProps;

  beforeEach(() => {
    props = mockProps;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { getByTestId } = render(<MockProvider><SvgMuiX {...mockProps} /></MockProvider>);
      expect(getByTestId('SvgMuiX')).toBeInTheDocument();
    });
    it('renders with correct width and height', async () => {
      const { getByTestId, getByText } = render(<MockProvider><SvgMuiX {...mockProps} /></MockProvider>);
      expect(getByText('RootSvg')).toHaveStyle({ width: '16px', height: '16px' });
    });
  });

  describe('Conditional Rendering', () => {
    it('renders when no props are provided', async () => {
      const { getByTestId } = render(<MockProvider><SvgMuiX /></MockProvider>);
      expect(getByTestId('SvgMuiX')).toBeInTheDocument();
    });
    it('renders with correct fill color when fill prop is provided', async () => {
      props.fill = '#FF0000';
      const { getByTestId, getByText } = render(<MockProvider><SvgMuiX {...props} /></MockProvider>);
      expect(getByText('RootSvg')).toHaveStyle({ fill: '#FF0000' });
    });
  });

  describe('Prop Validation', () => {
    it('throws an error when invalid props are provided', async () => {
      jest.spyOn(RootSvg, 'default').mockImplementation(() => {
        throw new Error('Invalid prop');
      });
      expect(() => render(<MockProvider><SvgMuiX {...{ invalid: true }} /></MockProvider>)).toThrowError(
        'Invalid prop'
      );
    });
  });

  describe('User Interactions', () => {
    it('calls on-click callback when clicked', async () => {
      const onClick = jest.fn();
      props.onClick = onClick;
      render(<MockProvider><SvgMuiX {...props} /></MockProvider>);
      fireEvent.press(root);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshots', () => {
    it('matches snapshot', async () => {
      const { asFragment } = render(<MockProvider><SvgMuiX {...mockProps} /></MockProvider>);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});