import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import LoadScript from './LoadScript.test.js';

describe('LoadScript component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render(<LoadScript src="test/src" position={document.body} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(wrapper).toBeTruthy();
  });

  it('appends script to the DOM correctly', async () => {
    const script = wrapper.findByTagName('script');
    expect(script.src).toBe('test/src');
    expect(document.body.children.length).toBe(1);
  });

  it('renders when position is not a child element', async () => {
    document.body.innerHTML = '';
    wrapper = render(<LoadScript src="test/src" position={null} />);
    expect(wrapper).toBeTruthy();
  });

  describe('invalid props', () => {
    it('throws an error if src prop is empty', async () => {
      expect(() => render(<LoadScript src="" position={document.body} />)).toThrowError();
    });

    it('throws an error if position prop is not a child element', async () => {
      document.body.innerHTML = '';
      expect(() => render(<LoadScript src="test/src" position={{}} />)).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('calls callback when clicked', async () => {
      const callbackMock = jest.fn();
      wrapper.findByTagName('script').onClick(callbackMock);
      fireEvent.click(wrapper.findByTagName('script'));
      expect(callbackMock).toHaveBeenCalledTimes(1);
    });

    it('does not trigger form submission on click', async () => {
      document.body.innerHTML = '<form><button>Test</button></form>';
      const button = wrapper.findByTagName('button');
      fireEvent.click(button);
      expect(document.querySelector('form')).toBeNull();
    });
  });

  describe('side effects', () => {
    it('does not trigger event listener when removed from DOM', async () => {
      const callbackMock = jest.fn();
      document.body.appendChild(wrapper.getByRole('script'));
      wrapper.findByTagName('script').onClick(callbackMock);
      document.body.removeChild(wrapper.findByTagName('script'));
      expect(callbackMock).not.toHaveBeenCalled();
    });
  });

  it('returns the script element', () => {
    const script = render(<LoadScript src="test/src" position={document.body} />);
    expect(script).toMatchSnapshot();
  });
});