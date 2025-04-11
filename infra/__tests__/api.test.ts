import { render, fireEvent, waitFor } from '@testing-library/react';
import { createApi } from './api.test';
import { sst } from 'aws-sdk';

jest.mock('aws-sdk');

describe('createApi', () => {
  let domainInfo: DomainInfo;
  let api: any;

  beforeEach(() => {
    domainInfo = {
      domains: ['example.com'],
      dbName: 'mydb',
    };

    api = createApi(domainInfo);
  });

  it('renders without crashing', () => {
    expect(api).not.toBeNull();
  });

  describe('conditional rendering paths', () => {
    it('should render subscribe link on POST /subscribe request', async () => {
      const { getByText } = render(<api domainInfo={domainInfo} />);
      await fireEvent.click(getByText('Subscribe'));
      expect(getByText('Verify')).toBeInTheDocument();
    });

    it('should render verify link on GET /verify request', async () => {
      const { getByText } = render(<api domainInfo={domainInfo} />);
      await fireEvent.click(getByText('Get Verify Link'));
      expect(getByText('Subscribe')).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('should validate prop types', async () => {
      expect.assertions(1);
      try {
        createApi(undefined as any);
        fail('Expected an error');
      } catch (error) {}
      expect(true).toBe(false);
    });

    it('should validate required props', async () => {
      expect.assertions(1);
      try {
        const result = createApi({
          domains: [],
          dbName: undefined,
        });
        fail('Expected an error');
      } catch (error) {}
      expect(result).toBeUndefined();
    });
  });

  describe('user interactions', () => {
    it('should handle form submission on POST /subscribe request', async () => {
      const { getByPlaceholderText, getByText } = render(<api domainInfo={domainInfo} />);
      await fireEvent.change(getByPlaceholderText('Email'), 'test@example.com');
      await fireEvent.click(getByText('Subscribe'));
      expect(getByText('Verify')).toBeInTheDocument();
    });

    it('should handle form submission on GET /verify request', async () => {
      const { getByPlaceholderText, getByText } = render(<api domainInfo={domainInfo} />);
      await fireEvent.change(getByPlaceholderText('Email'), 'test@example.com');
      await fireEvent.click(getByText('Get Verify Link'));
      expect(getByText('Subscribe')).toBeInTheDocument();
    });
  });

  describe('side effects', () => {
    it('should call subscribe function on POST /subscribe request', async () => {
      const mockSubscribe = jest.fn(() => Promise.resolve());
      sst.aws.Function.prototype.arn = mockSubscribe.arn;
      const { getByText } = render(<api domainInfo={domainInfo} />);
      await fireEvent.click(getByText('Subscribe'));
      expect(mockSubscribe).toHaveBeenCalledTimes(1);
    });

    it('should call verify function on GET /verify request', async () => {
      const mockVerify = jest.fn(() => Promise.resolve());
      sst.aws.Function.prototype.arn = mockVerify.arn;
      const { getByText } = render(<api domainInfo={domainInfo} />);
      await fireEvent.click(getByText('Get Verify Link'));
      expect(mockVerify).toHaveBeenCalledTimes(1);
    });
  });

  describe('snapshot tests', () => {
    it('should match the component', async () => {
      const tree = render(<api domainInfo={domainInfo} />);
      await waitFor(() => expect(tree).toMatchSnapshot());
    });
  });
});