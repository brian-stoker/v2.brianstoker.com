import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import AdGuest from './AdGuest.test.js';
import AdContext from 'src/modules/components/AdManager';

describe('AdGuest component', () => {
  const ad = {
    element: document.createElement('div'),
  };

  beforeEach(() => {
    document.body.innerHTML = '<div class="description"></div>';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AdGuest ad={ad} />);
    expect(screen.queryByRole('presentation')).toBeInTheDocument();
  });

  it('renders children when ad is present', () => {
    const children = <div>Hello, world!</div>;
    render(
      <AdContext.Provider value={{ element: ad.element }}>
        <AdGuest classSelector=".description" children={children} />
      </AdContext.Provider>
    );
    expect(screen.getByRole('presentation')).toHaveTextContent('Hello, world!');
  });

  it('hides children when no ad is present', () => {
    const children = <div>Hello, world!</div>;
    render(<AdGuest classSelector=".description" children={children} />);
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
  });

  it('adds or removes ad class correctly', () => {
    const element = document.querySelector('.description');
    render(
      <AdContext.Provider value={{ element, addClass: () => {} }}>
        <AdGuest classSelector=".description" />
      </AdContext.Provider>
    );
    expect(element.classList.contains('ad')).toBe(true);

    // cleanup and recreate element
    jest.clearAllMocks();
    document.body.innerHTML = '<div class="description"></div>';
    render(
      <AdContext.Provider value={{ element, addClass: () => {} }}>
        <AdGuest classSelector=".description" />
      </AdContext.Provider>
    );
    expect(element.classList.contains('ad')).toBe(false);
  });

  it('handles invalid props', () => {
    expect(() => (
      <AdGuest classSelector=".description" children={null} />
    )).toThrowError(TypeError);

    // additional tests for other prop types
    const invalidProps = {
      children: null,
      classSelector: 'invalid',
    };
    render(<AdGuest {...invalidProps} />);
  });

  it('handles classSelector with no selector', () => {
    const children = <div>Hello, world!</div>;
    const result = render(
      <AdContext.Provider value={{ element: document.createElement('div') }}>
        <AdGuest children={children} />
      </AdContext.Provider>
    );
    expect(result.container).toBeNull();
  });

  it('fires addClass event when ad is present', () => {
    const onAddClass = jest.fn();
    render(
      <AdContext.Provider value={{ element: document.createElement('div'), addClass: onAddClass }}>
        <AdGuest classSelector=".description" />
      </AdContext.Provider>
    );
    fireEvent.click(screen.getByRole('presentation'));
    expect(onAddClass).toHaveBeenCalledTimes(1);
  });

  it('fires removeClass event when ad is removed', () => {
    const onRemoveClass = jest.fn();
    render(
      <AdContext.Provider value={{ element: document.createElement('div'), removeClass: onRemoveClass }}>
        <AdGuest classSelector=".description" />
      </AdContext.Provider>
    );
    fireEvent.click(screen.getByRole('presentation'));
    expect(onRemoveClass).toHaveBeenCalledTimes(1);
  });
});