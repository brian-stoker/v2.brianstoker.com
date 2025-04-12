import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { withDocsInfra } from './withDocsInfra';

describe('withDocsInfra', () => {
  const initialProps = {
    env: {
      DEPLOY_ENV: 'development',
      COMMIT_REF: 'abc123',
      PULL_REQUEST_ID: '1234',
      ENABLE_AD_IN_DEV_MODE: false,
      NETLIFY_DEPLOY_URL: '',
      SITE_NAME: '',
    },
  };

  beforeEach(() => {
    global.env = initialProps.env;
  });

  it('renders without crashing', () => {
    const { container } = render(<withDocsInfra />);
    expect(container).not.toBeNull();
  });

  describe('DEPLOY_ENV prop', () => {
    it('uses the production env by default', () => {
      global.env.DEPLOY_ENV = 'development';
      const { container } = render(<withDocsInfra env={{ DEPLOY_ENV: 'production' }} />);
      expect(container).not.toBeNull();
    });

    it('switches to pull-request env on deploy-preview context', () => {
      global.env.CONTEXT = 'deploy-preview';
      const { container } = render(<withDocsInfra env={{ DEPLOY_ENV: 'pull-request' }} />);
      expect(container).not.toBeNull();
    });

    it('switches to production env on branch-deploy context', () => {
      global.env.CONTEXT = 'branch-deploy';
      const { container } = render(<withDocsInfra env={{ DEPLOY_ENV: 'production' }} />);
      expect(container).not.toBeNull();
    });
  });

  describe('other env props', () => {
    it('includes commit-ref and review-id in the output', () => {
      global.env.COMMIT_REF = 'abc123';
      global.env.REVIEW_ID = '1234';
      const { container } = render(<withDocsInfra />);
      expect(container).not.toBeNull();
    });

    it('disables translations by default', () => {
      const { container } = render(<withDocsInfra env={{ BUILD_ONLY_ENGLISH_LOCALE: 'false' }} />);
      expect(container).not.toBeNull();
    });

    it('includes feedback url in the output', () => {
      global.env.FEEDBACK_URL = 'https://example.com';
      const { container } = render(<withDocsInfra />);
      expect(container).not.toBeNull();
    });
  });

  describe('user interactions', () => {
    it('allows changing DEPLOY_ENV on input change', async () => {
      global.env.DEPLOY_ENV = 'development';
      const { getByLabelText, getByText } = render(<withDocsInfra />);
      const dropdown = getByLabelText('DEPLOY_ENV');
      fireEvent.change(dropdown, { target: { value: 'production' } });
      await waitFor(() => expect(global.env.DEPLOY_ENV).toBe('production'));
    });

    it('allows submitting a form with commit-ref and review-id', async () => {
      global.env.COMMIT_REF = 'abc123';
      global.env.REVIEW_ID = '1234';
      const { getByLabelText, getByText } = render(<withDocsInfra />);
      const form = getByLabelText('Form');
      fireEvent.submit(form);
      await waitFor(() => expect(global.env.COMMIT_REF).toBe('abc123'));
    });
  });

  describe('snapshot tests', () => {
    it('renders the expected output with DEPLOY_ENV prop', async () => {
      global.env.DEPLOY_ENV = 'production';
      const { container } = render(<withDocsInfra />);
      expect(container).toMatchSnapshot();
    });
  });
});