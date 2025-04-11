import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import withDocsInfra from './nextConfigDocsInfra.test.js';

describe('withDocsInfra component', () => {
  let nextConfig;
  let mockNetlifyEnvironmentVariables;

  beforeEach(() => {
    mockNetlifyEnvironmentVariables = {
      CONTEXT: 'deploy-preview',
      COMMIT_REF: '12345',
      REVIEW_ID: '67890',
      ENABLE_AD_IN_DEV_MODE: true,
      DEPLOY_URL: 'https://example.netlify.app',
      SITE_NAME: 'material-ui-docs',
      LIB_VERSION: '1.0.0',
      SOURCE_CODE_REPO: 'https://github.com/material-ui/docs',
      SOURCE_GITHUB_BRANCH: 'main',
      GITHUB_TEMPLATE_DOCS_FEEDBACK: 'https://example.com/docs',
    };

    nextConfig = {
      env: {},
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(withDocsInfra(nextConfig));
    expect(container).toBeTruthy();
  });

  describe('conditional rendering based on DEPLOY_ENV', () => {
    it('should set DEPLOY_ENV to "development" when CONTEXT is "deploy-preview"', () => {
      nextConfig.env.CONTEXT = 'deploy-preview';
      const { container } = render(withDocsInfra(nextConfig));
      expect(nextConfig.env.DEPLOY_ENV).toBe('development');
    });

    it('should set DEPLOY_ENV to "pull-request" when CONTEXT is "production" or "branch-deploy"', () => {
      nextConfig.env.CONTEXT = 'production';
      const { container } = render(withDocsInfra(nextConfig));
      expect(nextConfig.env.DEPLOY_ENV).toBe('pull-request');
    });

    it('should set DEPLOY_ENV to "production" when CONTEXT is "production" or "branch-deploy"', () => {
      nextConfig.env.CONTEXT = 'production';
      const { container } = render(withDocsInfra(nextConfig));
      expect(nextConfig.env.DEPLOY_ENV).toBe('production');
    });

    it('should set DEPLOY_ENV to "staging" when CONTEXT is "production" or "branch-deploy" and HEAD is "master" or "next"', () => {
      nextConfig.env.CONTEXT = 'production';
      nextConfig.env.HEAD = 'master';
      const { container } = render(withDocsInfra(nextConfig));
      expect(nextConfig.env.DEPLOY_ENV).toBe('staging');
    });
  });

  describe('prop validation', () => {
    it('should validate FEEDBACK_URL prop', () => {
      nextConfig.env.FEEDBACK_URL = 'https://example.com';
      const { container } = render(withDocsInfra(nextConfig));
      expect(container).toBeTruthy();
    });

    it('should not validate invalid FEEDBACK_URL prop', () => {
      nextConfig.env.FEEDBACK_URL = '';
      const { error } = render(withDocsInfra(nextConfig), { throwError: true });
      expect(error).toBeInstanceOf(Error);
    });

    it('should validate PULL_REQUEST_ID prop', () => {
      nextConfig.env.REVIEW_ID = '12345';
      const { container } = render(withDocsInfra(nextConfig));
      expect(container).toBeTruthy();
    });

    it('should not validate invalid PULL_REQUEST_ID prop', () => {
      nextConfig.env.REVIEW_ID = '';
      const { error } = render(withDocsInfra(nextConfig), { throwError: true });
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('user interactions', () => {
    it('should handle clicks on button element', async () => {
      const { getByText, fireEvent } = render(withDocsInfra(nextConfig));
      const buttonElement = getByText('Button Text');
      fireEvent.click(buttonElement);
      await waitFor(() => expect(nextConfig.env.DEPLOY_ENV).toBe('production'));
    });

    it('should handle clicks on dropdown element', async () => {
      const { getByText, fireEvent } = render(withDocsInfra(nextConfig));
      const dropdownElement = getByText('Dropdown Text');
      fireEvent.click(dropdownElement);
      await waitFor(() => expect(nextConfig.env.DEPLOY_ENV).toBe('pull-request'));
    });
  });
});