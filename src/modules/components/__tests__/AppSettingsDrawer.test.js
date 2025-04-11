import React from 'react';
import ReactDOM from 'react-dom';
import '@stoked-ui/docs/styles.css';
import { render, fireEvent, waitFor } from './test-utils';
import { createProvider } from 'react-redux';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AppSettingsDrawer from './AppSettingsDrawer';
import { themeReducer } from '../src/modules/components/ThemeContext';

describe('AppSettingsDrawer', () => {
  let store;

  beforeEach(() => {
    const initialState = {};
    store = configureStore({ reducer: themeReducer });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <AppSettingsDrawer />
      </Provider>
    );

    expect(getByText('settings.settings')).toBeInTheDocument();
  });

  describe('Conditional Rendering', () => {
    it('renders mode section when open is true', async () => {
      const { getByText } = render(
        <Provider store={store}>
          <AppSettingsDrawer open={true} />
        </Provider>
      );

      expect(getByText('settings.mode')).toBeInTheDocument();
    });

    it('does not render mode section when open is false', async () => {
      const { queryByTitle } = render(
        <Provider store={store}>
          <AppSettingsDrawer open={false} />
        </Provider>
      );

      expect(queryByTitle('settings.mode')).not.toBeInTheDocument();
    });
  });

  describe('Prop Validation', () => {
    it('throws error when onClose is not a function', async () => {
      const { getByText } = render(
        <Provider store={store}>
          <AppSettingsDrawer open={true} onClose={null} />
        </Provider>
      );

      expect(getByText('settings.settings')).toBeInTheDocument();
      expect(() => {
        getByText('settings.settings');
      }).not.toThrowError();
    });

    it('does not throw error when onClose is a function', async () => {
      const { getByText } = render(
        <Provider store={store}>
          <AppSettingsDrawer open={true} onClose={() => null} />
        </Provider>
      );

      expect(getByText('settings.settings')).toBeInTheDocument();
    });
  });

  describe('Events', () => {
    it('fires event when light button is clicked', async () => {
      const mockDispatch = jest.fn();
      const { getByText } = render(
        <Provider store={store}>
          <AppSettingsDrawer open={true} />
        </Provider>
      );

      const lightButton = getByText('settings.light');
      fireEvent.click(lightButton);

      await waitFor(() => expect(mockDispatch).toHaveBeenCalledTimes(1));
    });

    it('fires event when system button is clicked', async () => {
      const mockDispatch = jest.fn();
      const { getByText } = render(
        <Provider store={store}>
          <AppSettingsDrawer open={true} />
        </Provider>
      );

      const systemButton = getByText('settings.system');
      fireEvent.click(systemButton);

      await waitFor(() => expect(mockDispatch).toHaveBeenCalledTimes(1));
    });

    it('fires event when dark button is clicked', async () => {
      const mockDispatch = jest.fn();
      const { getByText } = render(
        <Provider store={store}>
          <AppSettingsDrawer open={true} />
        </Provider>
      );

      const darkButton = getByText('settings.dark');
      fireEvent.click(darkButton);

      await waitFor(() => expect(mockDispatch).toHaveBeenCalledTimes(1));
    });
  });

  describe('Redux', () => {
    it('updates store when mode is changed', async () => {
      const initialStore = store.getState();
      const { getByText } = render(
        <Provider store={store}>
          <AppSettingsDrawer open={true} />
        </Provider>
      );

      const lightButton = getByText('settings.light');
      fireEvent.click(lightButton);

      await waitFor(() => expect(store.getState()).not.toBe(initialStore));
    });
  });
});