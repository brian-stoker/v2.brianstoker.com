import fs from 'fs';
import path from 'path';
import kebabCase from 'lodash/kebabCase';
import { getHeaders, getTitle, renderMarkdown } from '@mui/internal-markdown';
import {
  ComponentInfo,
  extractPackageFile,
  getMuiName,
  parseFile,
  toGitHubPath,
} from '@stoked-ui/internal-api-docs-builder/buildApiUtils';
import findPagesMarkdown from '@stoked-ui/internal-api-docs-builder/utils/findPagesMarkdown';
import { render } from '@testing-library/react';
import '@mui/material/styles.css';

interface GetComponentInfoOptions {
  filename: string;
}

describe('getComponentInfo', () => {
  let componentInfo: ComponentInfo | null = null;

  beforeEach(() => {
    componentInfo = null;
  });

  it('should throw an error if no name is found in the filename', async () => {
    const filename = 'non-existent-file.js';
    await expect(getComponentInfo(filename)).rejects.toThrowError(
      'Could not find the component name from: ' + filename,
    );
  });

  it('should return valid component info for a valid filename', async () => {
    const filename = 'example-component.js';
    const validFilenameOptions: GetComponentInfoOptions = { filename };
    await expect(getComponentInfo(validFilenameOptions.filename)).resolves.toHaveAllProperties([
      'filename',
      'name',
      'muiName',
      'apiPathname',
      'apiPagesDirectory',
      'readFile',
    ]);
  });

  it('should return null for invalid component info', async () => {
    const filename = 'invalid-component.js';
    const invalidFilenameOptions: GetComponentInfoOptions = { filename };
    await expect(getComponentInfo(invalidFilenameOptions.filename)).toBeNull();
  });

  describe('readFile', () => {
    beforeEach(() => {
      componentInfo = null;
    });

    it('should call readFile and return the result when valid filename is provided', async () => {
      const filename = 'example-component.js';
      const validFilenameOptions: GetComponentInfoOptions = { filename };

      jest.spyOn(componentInfo, 'readFile').mockImplementation(() => {
        componentInfo.srcInfo = {
          name: 'test',
          value: null,
        };
        return Promise.resolve(componentInfo.srcInfo);
      });

      await getComponentInfo(validFilenameOptions.filename);

      expect(componentInfo).toHaveProperty('srcInfo');
    });

    it('should not call readFile and return null when invalid filename is provided', async () => {
      const filename = 'invalid-component.js';
      const invalidFilenameOptions: GetComponentInfoOptions = { filename };

      await getComponentInfo(invalidFilenameOptions.filename);

      expect(componentInfo).toBeNull();
    });
  });

  it('should return valid demo data for a component with demos', async () => {
    const filename = 'example-component.js';
    const validFilenameOptions: GetComponentInfoOptions = { filename };

    const mocks = jest.mocked(componentInfo, 'getDemos');

    await getComponentInfo(validFilenameOptions.filename);

    expect(mocks).toHaveBeenCalledTimes(1);
    expect(mocks).toHaveBeenCalledWith(jest.fn());
  });

  describe('readFile side effects', () => {
    beforeEach(() => {
      componentInfo = null;
    });

    it('should call parseFile with a valid filename when readFile is called with a valid result', async () => {
      const filename = 'example-component.js';
      const validFilenameOptions: GetComponentInfoOptions = { filename };

      jest.spyOn(componentInfo, 'readFile').mockImplementation(() => Promise.resolve(null));
      componentInfo.srcInfo = null;

      await getComponentInfo(validFilenameOptions.filename);

      expect(parseFile).toHaveBeenCalledTimes(1);
      expect(parseFile).toHaveBeenCalledWith(filename);
    });
  });

  it('should throw an error if readFile returns a non-object result', async () => {
    const filename = 'example-component.js';
    const validFilenameOptions: GetComponentInfoOptions = { filename };

    jest.spyOn(componentInfo, 'readFile').mockImplementation(() => null);

    await expect(getComponentInfo(validFilenameOptions.filename)).rejects.toThrowError(
      'readFile result is not an object',
    );
  });

  it('should throw an error if readFile returns a non-null result', async () => {
    const filename = 'example-component.js';
    const validFilenameOptions: GetComponentInfoOptions = { filename };

    jest.spyOn(componentInfo, 'readFile').mockImplementation(() => Promise.resolve({});

    await expect(getComponentInfo(validFilenameOptions.filename)).rejects.toThrowError(
      'readFile result is not an object',
    );
  });
});