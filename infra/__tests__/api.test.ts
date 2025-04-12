import { create } from 'vitest';
import React from 'react';
import { sst, DomainInfo } from './api';

describe('createApi', () => {
  const domainInfo = {
    domains: ['brianstoker.com'],
    dbName: 'myDatabase',
  };

  let api;

  beforeEach(() => {
    api = createApi(domainInfo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(api).not.toBe(null);
  });

  describe('prop validation', () => {
    const invalidDomainInfo: DomainInfo = {
      domains: [],
      dbName: '',
    };

    it('throws an error with invalid domain info', () => {
      expect(() => createApi(invalidDomainInfo)).toThrowError();
    });

    it('returns the api instance with valid domain info', () => {
      const result = createApi(domainInfo);
      expect(result).toBeInstanceOf(sst.aws.ApiGatewayV2);
    });
  });

  describe('conditional rendering', () => {
    it('renders the subscribe function route correctly', () => {
      const subscribeRoute = api.route('POST /subscribe');
      expect(subscribeRoute.arn).not.toBeUndefined();
    });

    it('renders the verify function route correctly', () => {
      const verifyRoute = api.route('GET /verify');
      expect(verifyRoute.arn).not.toBeUndefined();
    });

    it('renders the direct message route correctly', () => {
      const sendSmsRoute = api.route('POST /directMsg');
      expect(sendSmsRoute.arn).not.toBeUndefined();
    });
  });

  describe('user interactions', () => {
    let subscribeFunction;
    let verifyFunction;

    beforeEach(() => {
      subscribeFunction = new sst.aws.Function('Subscribe', {
        handler: 'api/subscribe.subscribe',
        permissions: [
          {
            actions: ['ses:SendEmail'],
            resources: ['arn:aws:ses:us-east-1:883859713095:identity/*'],
          },
        ],
        link: [mongoDbUri],
        environment: {
          ROOT_DOMAIN: domainInfo.domains[0],
          DB_NAME: domainInfo.dbName,
          EMAIL_MESSAGE: JSON.stringify({
            Subject: { Data: 'Subscribed to brianstoker.com' },
            Body: {
              Text: { Data: `Click the link to verify your email: ${verificationLink}` },
              Html: { Data: `<p>Click <a href='${verificationLink}'>here</a> to verify your email.</p>` },
            },
          }),
        },
      });

      verifyFunction = new sst.aws.Function('Verify', {
        handler: 'api/subscribe.verify',
        permissions: [
          {
            actions: ['ses:SendEmail'],
            resources: ['arn:aws:ses:us-east-1:883859713095:identity/!*'],
          },
        ],
        link: [mongoDbUri],
        environment: {
          ROOT_DOMAIN: domainInfo.domains[0],
          DB_NAME: domainInfo.dbName,
          EMAIL_MESSAGE: JSON.stringify({
            Subject: { Data: 'Subscribed to brianstoker.com' },
            Body: {
              Text: { Data: `Click the link to verify your email: ${verificationLink}` },
              Html: { Data: `<p>Click <a href='${verificationLink}'>here</a> to verify your email.</p>` },
            },
          }),
        },
      });
    });

    it('calls the subscribe function when the subscribe route is clicked', () => {
      // @ts-expect-error
      subscribeFunction.handler({ method: 'POST' });
    });

    it('calls the verify function when the verify route is clicked', () => {
      // @ts-expect-error
      verifyFunction.handler({ method: 'GET' });
    });

    it('does not call the send sms function when the direct message route is clicked', () => {
      // @ts-expect-error
      sendSms.handler({ method: 'POST' });
    });
  });

  describe('side effects and state changes', () => {
    const mockSendSms = jest.fn();

    beforeEach(() => {
      api.route('POST /directMsg', sst.aws.Function('SendSms', {
        handler: 'api/sms.handler',
        permissions: [
          {
            actions: ['sns:Publish'],
            resources: ['*'], // Allows sending SMS to any SNS topic
          },
        ],
        link: [mongoDbUri],
        environment: {
          ROOT_DOMAIN: domainInfo.domains[0],
        },
      }).arn);

      sendSms.handler = mockSendSms;
    });

    it('calls the send sms function when the direct message route is clicked', () => {
      // @ts-expect-error
      api.route('POST /directMsg')({ method: 'POST' });
      expect(mockSendSms).toHaveBeenCalledTimes(1);
    });
  });

  test('snapshots createApi component', async () => {
    const apiSnapshot = await create(
      <sst.aws.ApiGatewayV2 api={api} />,
      { shallow: true }
    );
    expect(apiSnapshot).toMatchSnapshot();
  });
});