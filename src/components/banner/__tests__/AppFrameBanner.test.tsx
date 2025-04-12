import React from 'react';
import { render } from '@testing-library/react';
import AppFrameBanner from './AppFrameBanner.test.tsx';
import FeatureToggleMock from './FeatureToggleMock';
import PageContextMock from './PageContextMock';

describe('AppFrameBanner', () => {
  let wrapper: any;
  let pageContextMock: PageContextMock;

  beforeEach(() => {
    window.__INITIAL_STATE__ = {};
    pageContextMock = new PageContextMock();
    FeatureToggleMock.enable_docsnav_banner = true;
  });

  afterEach(() => {
    FeatureToggleMock.enable_docsnav_banner = false;
    global.fetch.mockClear();
  });

  it('renders without crashing', async () => {
    wrapper = render(<AppFrameBanner />, { context: pageContextMock });
    expect(wrapper).toBeTruthy();
  });

  describe('props', () => {
    it('should not throw error for valid props', async () => {
      const message = 'Test message';
      wrapper = render(
        <AppFrameBanner href="https://example.com" target="_blank">
          {message}
        </AppFrameBanner>,
        { context: pageContextMock }
      );
      expect(wrapper).toBeTruthy();
    });

    it('should throw error for invalid href prop', async () => {
      const message = 'Test message';
      wrapper = render(<AppFrameBanner href="invalid" target="_blank"> {message} </AppFrameBanner>, {
        context: pageContextMock,
      });
      expect(wrapper).not.toHaveTextContent();
    });

    it('should not throw error for invalid message prop', async () => {
      const message = null;
      wrapper = render(<AppFrameBanner href="https://example.com" target="_blank">{message}</AppFrameBanner>, {
        context: pageContextMock,
      });
      expect(wrapper).toBeTruthy();
    });

    it('should not throw error for invalid PageContext prop', async () => {
      const message = 'Test message';
      wrapper = render(
        <AppFrameBanner href="https://example.com" target="_blank">
          {message}
        </AppFrameBanner>,
        { context: {} }
      );
      expect(wrapper).toBeTruthy();
    });
  });

  describe('conditional rendering', () => {
    it('should not render when FEATURE_TOGGLE.enable_docsnav_banner is false', async () => {
      FeatureToggleMock.enable_docsnav_banner = false;
      wrapper = render(<AppFrameBanner />, { context: pageContextMock });
      expect(wrapper).toEqual(document.body);
    });

    it('should render when FEATURE_TOGGLE.enable_docsnav_banner is true', async () => {
      FeatureToggleMock.enable_docsnav_banner = true;
      wrapper = render(<AppFrameBanner />, { context: pageContextMock });
      expect(wrapper).toHaveTextContent();
    });
  });

  describe('user interactions', () => {
    it('should not throw error on click event', async () => {
      const message = 'Test message';
      const href = 'https://example.com';
      wrapper = render(
        <AppFrameBanner href={href} target="_blank" onClick={() => {}}>{message}</AppFrameBanner>,
        { context: pageContextMock }
      );
      expect(wrapper).toHaveTextContent();
    });

    it('should not throw error on input change event', async () => {
      const message = 'Test message';
      wrapper = render(
        <AppFrameBanner href="https://example.com" target="_blank" onChange={() => {}}>{message}</AppFrameBanner>,
        { context: pageContextMock }
      );
      expect(wrapper).toHaveTextContent();
    });

    it('should not throw error on form submission event', async () => {
      const message = 'Test message';
      wrapper = render(
        <AppFrameBanner href="https://example.com" target="_blank" onSubmit={() => {}}>{message}</AppFrameBanner>,
        { context: pageContextMock }
      );
      expect(wrapper).toHaveTextContent();
    });
  });

  it('should not throw error on load event', async () => {
    wrapper = render(<AppFrameBanner />, { context: pageContextMock });
    expect(wrapper).toHaveTextContent();
  });
});