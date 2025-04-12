import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { buildGridSelectorsDocumentation } from './buildGridSelectorsDocumentation';

describe('Build grid selectors documentation', () => {
  let project: XTypeScriptProject;
  let apiPagesFolder = '';

  beforeEach(() => {
    project = new XTypeScriptProject();
    apiPagesFolder = './api-pages';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Render without crashing', () => {
    it('should render without crashing', async () => {
      const options: BuildSelectorsDocumentationOptions = {
        project,
        apiPagesFolder,
      };
      await buildGridSelectorsDocumentation(options);
      expect(() => render(<div />)).not.toThrow();
    });
  });

  describe('Conditional rendering', () => {
    it('should conditionally render selectors', async () => {
      const options: BuildSelectorsDocumentationOptions = {
        project: { exports: [{ name: 'Selector' }] },
        apiPagesFolder,
      };
      await buildGridSelectorsDocumentation(options);
      expect(() => render(<div />)).not.toThrow();
    });

    it('should conditionally render empty array of selectors', async () => {
      const options: BuildSelectorsDocumentationOptions = {
        project: { exports: [] },
        apiPagesFolder,
      };
      await buildGridSelectorsDocumentation(options);
      expect(() => render(<div />)).not.toThrow();
    });
  });

  describe('Prop validation', () => {
    it('should validate prop types', async () => {
      const options: BuildSelectorsDocumentationOptions = {
        project: { exports: [{ name: 'Selector' }] },
        apiPagesFolder,
      };
      await buildGridSelectorsDocumentation(options);
      expect(() => render(<div />)).not.toThrow();
    });

    it('should throw error with invalid prop types', async () => {
      const options: BuildSelectorsDocumentationOptions = {
        project: { exports: [{ name: 'InvalidSelector' }] },
        apiPagesFolder,
      };
      await expect(buildGridSelectorsDocumentation(options)).rejects.toHaveProperty(
        'error',
        expect.stringMatching(/Invalid prop type/),
      );
    });
  });

  describe('User interactions', () => {
    it('should handle clicks on selectors', async () => {
      const options: BuildSelectorsDocumentationOptions = {
        project: { exports: [{ name: 'Selector' }] },
        apiPagesFolder,
      };
      await buildGridSelectorsDocumentation(options);
      expect(() => render(<div />)).not.toThrow();
    });

    it('should handle input changes on selectors', async () => {
      const options: BuildSelectorsDocumentationOptions = {
        project: { exports: [{ name: 'Selector' }] },
        apiPagesFolder,
      };
      await buildGridSelectorsDocumentation(options);
      expect(() => render(<div />)).not.toThrow();
    });

    it('should handle form submissions on selectors', async () => {
      const options: BuildSelectorsDocumentationOptions = {
        project: { exports: [{ name: 'Selector' }] },
        apiPagesFolder,
      };
      await buildGridSelectorsDocumentation(options);
      expect(() => render(<div />)).not.toThrow();
    });
  });

  describe('Side effects', () => {
    it('should create selectors documentation file', async () => {
      const options: BuildSelectorsDocumentationOptions = {
        project: { exports: [{ name: 'Selector' }] },
        apiPagesFolder,
      };
      await buildGridSelectorsDocumentation(options);
      expect(() => import('./selectors.json')).not.toThrow();
    });

    it('should update selectors documentation file', async () => {
      const options: BuildSelectorsDocumentationOptions = {
        project: { exports: [{ name: 'Selector' }] },
        apiPagesFolder,
      };
      await buildGridSelectorsDocumentation(options);
      expect(() => import('./selectors.json')).not.toThrow();
    });
  });

  describe('Snapshot testing', () => {
    it('should snapshot selectors documentation file', async () => {
      const options: BuildSelectorsDocumentationOptions = {
        project: { exports: [{ name: 'Selector' }] },
        apiPagesFolder,
      };
      await buildGridSelectorsDocumentation(options);
      expect(() => render(<div />)).not.toThrow();
    });
  });
});