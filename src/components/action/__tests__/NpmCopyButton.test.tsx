import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import NpmCopyButton from './NpmCopyButton';

jest.mock('clipboard-copy');

describe('NpmCopyButton', () => {
  let wrapper: any;
  let installation: string;

  beforeEach(() => {
    installation = 'npm install @types/react';
    const props = {
      installation,
      sx: {},
    };
    wrapper = render(<NpmCopyButton {...props} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(wrapper).toBeTruthy();
    });

    it('renders correctly with installation string', () => {
      const button = wrapper.getByText(installation);
      expect(button).toBeInTheDocument();
    });

    it('renders correctly with sx prop', () => {
      wrapper rerender(<NpmCopyButton installation={installation} sx={{ backgroundColor: 'red' }} />);
      const button = wrapper.getByRole('button');
      expect(button).toHaveStyleRule('background-color', 'red');
    });
  });

  describe('Interactions', () => {
    it('calls onClick callback when clicked', async () => {
      const onClickMock = jest.fn();
      props.onClick = onClickMock;
      wrapper rerender(<NpmCopyButton installation={installation} onClick={onClickMock} />);
      const button = wrapper.getByRole('button');
      fireEvent.click(button);
      await waitFor(() => expect(onClickMock).toHaveBeenCalledTimes(1));
    });

    it('taps to copy text', async () => {
      jest.spyOn(window, 'alert').mockImplementation(() => {});
      wrapper rerender(<NpmCopyButton installation={installation} />);
      const button = wrapper.getByText(installation);
      fireEvent.click(button);
      await waitFor(() => expect(jest.spyOn(window, 'alert')).toHaveBeenCalledTimes(1));
    });

    it('doesn\'t tap to copy text on hover', async () => {
      jest.spyOn(window, 'alert').mockImplementation(() => {});
      wrapper rerender(<NpmCopyButton installation={installation} />);
      const button = wrapper.getByRole('button');
      fireEvent.hover(button);
      await waitFor(() => expect(jest.spyOn(window, 'alert')).not.toHaveBeenCalled());
    });
  });

  describe('Conditional rendering', () => {
    it('renders check icon when text is copied', async () => {
      jest.clearAllMocks();
      wrapper rerender(<NpmCopyButton installation={installation} />);
      const button = wrapper.getByRole('button');
      fireEvent.click(button);
      await waitFor(() => expect(wrapper.getByRole('img')).toHaveAttribute('src', 'check-rounded.png'));
    });

    it('renders copy icon by default', async () => {
      jest.clearAllMocks();
      wrapper rerender(<NpmCopyButton installation={installation} />);
      const button = wrapper.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Copy text');
    });
  });

  describe('Prop validation', () => {
    it('throws an error when installation prop is missing', () => {
      expect(() => render(<NpmCopyButton sx={{}} />)).toThrowError();
    });

    it('throws an error when sx prop is missing', () => {
      expect(() => render(<NpmCopyButton installation={installation} />)).toThrowError();
    });
  });
});