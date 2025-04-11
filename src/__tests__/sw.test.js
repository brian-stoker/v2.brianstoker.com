import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { createMockedServiceWorker } from '../mocks/service-worker.mock';
import ServiceWorkerComponent from './sw.component';

const serviceWorker = createMockedServiceWorker();

describe('ServiceWorkerComponent', () => {
  beforeEach(() => {
    // Clean up before each test
    serviceWorker.clients.clear();
    serviceWorker.skipWaiting();
  });

  afterEach(() => {
    // Reset state after each test
    serviceWorker.state = 'idle';
  });

  it('renders without crashing', async () => {
    const { getByText } = render(<ServiceWorkerComponent />);
    expect(getByText('Service Worker')).toBeInTheDocument();
  });

  describe('props validation', () => {
    it('displays error message when install is not supported', async () => {
      // Arrange
      serviceWorker.installSupport = false;

      // Act
      const { getByText } = render(<ServiceWorkerComponent />);
      expect(getByText('Error: Install API is not supported')).toBeInTheDocument();
    });

    it('displays warning message when skipWaiting is called too many times', async () => {
      // Arrange
      serviceWorker.skipWaitingSupport = true;
      serviceWorker.skipWaitingCount = 5;

      // Act
      const { getByText } = render(<ServiceWorkerComponent />);
      expect(getByText('Warning: Skip waiting too many times')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls install when install is supported and click is triggered', async () => {
      // Arrange
      serviceWorker.installSupport = true;
      const mockInstallSpy = jest.spyOn(serviceWorker, 'install');

      // Act
      const { getByText } = render(<ServiceWorkerComponent />);
      fireEvent.click(getByText('Install'));
      await waitFor(() => expect(mockInstallSpy).toHaveBeenCalledTimes(1));
    });

    it('calls message when skipWaiting is called too many times', async () => {
      // Arrange
      serviceWorker.skipWaitingSupport = true;
      const mockMessageSpy = jest.spyOn(serviceWorker, 'message');

      // Act
      const { getByText } = render(<ServiceWorkerComponent />);
      fireEvent.click(getByText('Skip Waiting'));
      await waitFor(() => expect(mockMessageSpy).toHaveBeenCalledTimes(1));
    });

    it('calls skipWaiting when is in waiting state', async () => {
      // Arrange
      serviceWorker.waitingState = 'waiting';

      // Act
      const { getByText } = render(<ServiceWorkerComponent />);
      fireEvent.click(getByText('Skip Waiting'));
      await waitFor(() => expect(serviceWorker.skipWaiting).toHaveBeenCalledTimes(1));
    });
  });

  describe('conditional rendering', () => {
    it('displays installing message when in installing state', async () => {
      // Arrange
      serviceWorker.installingState = true;

      // Act
      const { getByText } = render(<ServiceWorkerComponent />);
      expect(getByText('Installing...')).toBeInTheDocument();
    });

    it('displays ready message when in waiting state', async () => {
      // Arrange
      serviceWorker.waitingState = 'waiting';

      // Act
      const { getByText } = render(<ServiceWorkerComponent />);
      expect(getByText('Waiting...')).toBeInTheDocument();
    });

    it('displays active message when in installed state', async () => {
      // Arrange
      serviceWorker.installedState = true;

      // Act
      const { getByText } = render(<ServiceWorkerComponent />);
      expect(getByText('Active...')).toBeInTheDocument();
    });
  });
});