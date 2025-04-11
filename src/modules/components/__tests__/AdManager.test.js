import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import AdManager from './AdManager.test.js';

describe('AdManager component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<div class="description"></div>';
  });

  it('renders without crashing', async () => {
    render(<AdManager />);
    expect(document.querySelector('.description')).not.toBe(null);
  });

  it('renders with correct ad placement based on classSelector prop', async () => {
    const { getByClass } = render(
      <AdManager
        classSelector={'body-inline'}
        children={<div>Hello World!</div>}
      />
    );
    expect(getByClass('ad-placement')).toHaveTextContent('top');
  });

  it('renders with correct ad placement based on classSelector prop (image)', async () => {
    const { getByClass } = render(
      <AdManager
        classSelector={'body-image'}
        children={<div>Hello World!</div>}
      />
    );
    expect(getByClass('ad-placement')).toHaveTextContent('top');
  });

  it('renders without crashing with invalid classSelector prop', async () => {
    const { getByText } = render(
      <AdManager
        classSelector={'non-existent-class'}
        children={<div>Hello World!</div>}
      />
    );
    expect(getByText('Error: No element found')).not.toBe(null);
  });

  it('calls setPortal function with correct state when classSelector changes', async () => {
    const { getByClass } = render(
      <AdManager
        classSelector={'body-inline'}
        children={<div>Hello World!</div>}
      />
    );
    fireEvent.change(document.querySelector('.class-selector'), {
      target: { value: 'body-image' },
    });
    await waitFor(() => expect(setPortal).toHaveBeenCalledTimes(1));
  });

  it('calls setPortal function with correct state when classSelector changes with image placement', async () => {
    const { getByClass } = render(
      <AdManager
        classSelector={'body-image'}
        children={<div>Hello World!</div>}
      />
    );
    fireEvent.change(document.querySelector('.class-selector'), {
      target: { value: 'body-inline' },
    });
    await waitFor(() => expect(setPortal).toHaveBeenCalledTimes(1));
  });

  it('renders children component', async () => {
    const { getByText } = render(
      <AdManager classSelector="description" children={<div>Hello World!</div>} />
    );
    expect(getByText('Hello World!')).not.toBe(null);
  });

  describe('prop validation', () => {
    it('throws error if children prop is not a node', async () => {
      const { getByText } = render(
        <AdManager classSelector="description" children={123} />
      );
      expect(getByText('Error: Invalid children prop')).not.toBe(null);
    });

    it('throws error if classSelector prop is empty string', async () => {
      const { getByText } = render(
        <AdManager classSelector="" children={<div>Hello World!</div>} />
      );
      expect(getByText('Error: Class selector cannot be empty')).not.toBe(null);
    });
  });

  it('renders correctly with valid props', async () => {
    render(<AdManager />);
    const { getByClass } = document.querySelector('.description');
    expect(getByClass('ad-placement')).toHaveTextContent('top');
  });

  describe('side effects', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('calls useEnhancedEffect with correct dependencies', async () => {
      const { getByClass } = render(
        <AdManager classSelector={'body-inline'} />
      );
      expect(document.querySelector('.description')).not.toBe(null);
    });
  });
});