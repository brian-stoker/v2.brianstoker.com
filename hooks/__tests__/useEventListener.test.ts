import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import useEventListener from './useEventListener';

describe('useEventListener', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = render(<div />);
  });

  afterEach(() => {
    // cleanup test environment
  });

  it('renders without crashing', () => {
    expect(wrapper).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders with valid props', () => {
      const type = 'click';
      const listener = (event: React.MouseEvent<HTMLButtonElement>) => {
        expect(event.type).toBe('click');
      };
      useEventListener(null, type, listener);
      expect(wrapper.queryByText('Use Event Listener')).toBeInTheDocument();
    });

    it('does not render with invalid props', () => {
      const type = 'invalid';
      const listener = (event: React.MouseEvent<HTMLButtonElement>) => {
        expect(event.type).toBe('click');
      };
      useEventListener(null, type, listener);
      expect(wrapper.queryByText('Use Event Listener')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('validates event type prop', () => {
      const type = 'invalid-type';
      const listener = (event: React.MouseEvent<HTMLButtonElement>) => {
        expect(event.type).toBe('click');
      };
      useEventListener(null, type, listener);
      expect(wrapper.queryByText('Use Event Listener')).toBeInTheDocument();
    });

    it('validates event listener prop', () => {
      const type = 'click';
      const invalidListener = 123 as any; // invalid listener type
      useEventListener(null, type, invalidListener);
      expect(wrapper.queryByText('Use Event Listener')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('adds event listener on mount', () => {
      const element = document.createElement('div');
      const type = 'click';
      const listener = (event: React.MouseEvent<HTMLButtonElement>) => {
        expect(event.type).toBe('click');
      };
      useEventListener(element, type, listener);
      fireEvent.click(document.querySelector('button')!);
      expect(element.addEventListener).toHaveBeenCalledTimes(1);
    });

    it('removes event listener on unmount', () => {
      const element = document.createElement('div');
      const type = 'click';
      const listener = (event: React.MouseEvent<HTMLButtonElement>) => {
        expect(event.type).toBe('click');
      };
      useEventListener(element, type, listener);
      fireEvent.click(document.querySelector('button')!);
      wrapper.unmount();
      expect(element.removeEventListener).toHaveBeenCalledTimes(1);
    });

    it('adds event listener on input change', () => {
      const element = document.createElement('input');
      const type = 'change';
      const listener = (event: React.ChangeEvent<HTMLInputElement>) => {
        expect(event.type).toBe('change');
      };
      useEventListener(element, type, listener);
      fireEvent.change(element, { target: { value: '' } });
      expect(element.addEventListener).toHaveBeenCalledTimes(1);
    });

    it('removes event listener on input change', () => {
      const element = document.createElement('input');
      const type = 'change';
      const listener = (event: React.ChangeEvent<HTMLInputElement>) => {
        expect(event.type).toBe('change');
      };
      useEventListener(element, type, listener);
      fireEvent.change(element, { target: { value: '' } });
      wrapper.unmount();
      expect(element.removeEventListener).toHaveBeenCalledTimes(1);
    });

    it('adds event listener on form submission', () => {
      const element = document.createElement('form');
      const type = 'submit';
      const listener = (event: React.FormEvent<HTMLFormElement>) => {
        expect(event.type).toBe('submit');
      };
      useEventListener(element, type, listener);
      fireEvent.submit(element);
      expect(element.addEventListener).toHaveBeenCalledTimes(1);
    });

    it('removes event listener on form submission', () => {
      const element = document.createElement('form');
      const type = 'submit';
      const listener = (event: React.FormEvent<HTMLFormElement>) => {
        expect(event.type).toBe('submit');
      };
      useEventListener(element, type, listener);
      fireEvent.submit(element);
      wrapper.unmount();
      expect(element.removeEventListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('calls useEffect with correct dependencies', async () => {
      const element = document.createElement('div');
      const type = 'click';
      const listener = (event: React.MouseEvent<HTMLButtonElement>) => {
        expect(event.type).toBe('click');
      };
      useEventListener(element, type, listener);
      await waitFor(() => expect(wrapper.querySelector('button')).not.toBeNull());
    });

    it('calls useEffect with correct dependencies when element changes', async () => {
      const element = document.createElement('div');
      const type = 'click';
      const listener = (event: React.MouseEvent<HTMLButtonElement>) => {
        expect(event.type).toBe('click');
      };
      useEventListener(element, type, listener);
      element.innerHTML = '';
      await waitFor(() => expect(wrapper.querySelector('button')).not.toBeNull());
    });
  });

  it('renders correct number of buttons', async () => {
    const wrapper = render(<div><useEventListener null 'click' () => {} /></div>);
    expect(document.querySelectorAll('button').length).toBe(1);
  });
});