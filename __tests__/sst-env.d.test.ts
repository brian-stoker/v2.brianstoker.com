import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from './App';

const mockApiGateway = {
  url: '/api',
};

const mockMongodbUri = {
  value: 'mongodb://localhost:27017/',
};

const mockSmsSendFunction = {
  invoke: jest.fn(),
};

const mockSubscribeFunction = {
  invoke: jest.fn(),
};

const mockVerifyFunction = {
  invoke: jest.fn(),
};

const mockStaticSiteUrl = '/static';

describe('App', () => {
  const [state, setState] = React.useState(null);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    document.body.innerHTML = '<div id="root"></div>';
    await render(<App />);
    expect(document.querySelector('.App')).toBeInTheDocument();
  });

  describe('prop validation', () => {
    it('should validate props correctly', async () => {
      const { getByText } = render(<App />);
      expect(getByText('Hello World!')).toBeInTheDocument();
      expect(getByText('Invalid prop')).not.toBeInTheDocument();
    });

    it('should throw an error for invalid props', async () => {
      try {
        render(<App invalidProp="test" />);
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe('Invalid prop: expected string, received test');
      }
    });
  });

  describe('conditional rendering', () => {
    it('renders apiGatewayV2 component when API is defined', async () => {
      render(<App api={mockApiGateway} />);
      const apiGateway = document.querySelector('.api-gateway-v2');
      expect(apiGateway).toBeInTheDocument();
    });

    it('does not render apiGatewayV2 component when API is undefined', async () => {
      render(<App />);
      const apiGateway = document.querySelector('.api-gateway-v2');
      expect(apiGateway).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls sendSms function on click', async () => {
      const { getByText } = render(<App />);
      const sendSmsButton = document.querySelector('button[type="submit"]');
      fireEvent.click(sendSmsButton);
      expect(mockSmsSendFunction.invoke).toHaveBeenCalledTimes(1);
    });

    it('calls subscribe function on input change', async () => {
      const { getByText, getByLabelText } = render(<App />);
      const subscribeInput = document.querySelector('input[type="text"]');
      fireEvent.change(subscribeInput, { target: { value: 'test' } });
      expect(mockSubscribeFunction.invoke).toHaveBeenCalledTimes(1);
    });

    it('calls verify function on form submission', async () => {
      const { getByText, getByLabelText } = render(<App />);
      const verifyButton = document.querySelector('button[type="submit"]');
      fireEvent.click(verifyButton);
      expect(mockVerifyFunction.invoke).toHaveBeenCalledTimes(1);
    });
  });

  describe('state changes', () => {
    it('updates state correctly', async () => {
      setState('new-state');
      await waitFor(() => expect(state).toBe('new-state'));
    });
  });

  // Snapshot test
  it('renders static site component', async () => {
    document.body.innerHTML = '<div id="root"></div>';
    await render(<App />);
    expect(document.querySelector('.static-site')).toMatchSnapshot();
  });
});