import React from 'react';
import '@stoked-ui/internal-api-docs-builder/api';
import '@stoked-ui/internal-api-docs-builder/utils/findPagesMarkdown';
import fs, { promisify } from 'fs/promises';
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

jest.mock('@mui/internal-markdown');

const readFileSync = promisify(fs.readFileSync);
const resolve = path.resolve;

describe('getComponentInfo', () => {
  let componentInfo: ComponentInfo;
  let filename: string;

  beforeEach(() => {
    const name = 'tree-view';
    const packageFile = `@stoked-ui/tree-view`;

    componentInfo = {
      filename,
      name,
      muiName: getMuiName(name),
      apiPathname: `/x/api/tree-view/${kebabCase(name)}`,
      apiPagesDirectory: path.join(process.cwd(), `docs/pages/x/api/tree-view`),
      readFile: jest.fn(() => ({} as any)),
    };

    filename = resolve(packageFile);
  });

  afterEach(() => {
    componentInfo = null;
  });

  it('renders without crashing', () => {
    expect(componentInfo).not.toBe(null);
  });

  it('returns correct filename when name is provided', async () => {
    const name = 'tree-view';
    const packageFile = `@stoked-ui/tree-view`;

    componentInfo = getComponentInfo(packageFile);

    expect(componentInfo.filename).toBe(packageFile);
  });

  describe('apiPathname', () => {
    it('returns correct apiPathname when name is provided', async () => {
      const name = 'tree-view';
      const packageFile = `@stoked-ui/tree-view`;

      componentInfo = getComponentInfo(packageFile);

      expect(componentInfo.apiPathname).toBe(`/x/api/tree-view/${kebabCase(name)}`);
    });

    it('returns correct apiPathname when filename is provided', async () => {
      const name = 'tree-view';
      const packageFile = `@stoked-ui/tree-view`;

      componentInfo = getComponentInfo(packageFile);

      expect(componentInfo.filename).toBe(packageFile);
    });
  });

  describe('apiPagesDirectory', () => {
    it('returns correct apiPagesDirectory when name is provided', async () => {
      const name = 'tree-view';
      const packageFile = `@stoked-ui/tree-view`;

      componentInfo = getComponentInfo(packageFile);

      expect(componentInfo.apiPagesDirectory).toBe(path.join(process.cwd(), `docs/pages/x/api/tree-view`));
    });

    it('returns correct apiPagesDirectory when filename is provided', async () => {
      const name = 'tree-view';
      const packageFile = `@stoked-ui/tree-view`;

      componentInfo = getComponentInfo(packageFile);

      expect(componentInfo.filename).toBe(packageFile);
    });
  });

  describe('readFile', () => {
    it('returns null when reading file fails', async () => {
      const filename = 'non-existent-file.txt';

      componentInfo = getComponentInfo(filename);

      expect(componentInfo.readFile()).toBe(null);
    });

    it('returns parsed data from file when reading file succeeds', async () => {
      const filename = resolve(__dirname, '..', 'data', 'tree-view.ts');
      const expectedData = {};

      fs.writeFileSync(filename, JSON.stringify(expectedData));

      componentInfo = getComponentInfo(filename);

      expect(componentInfo.readFile()).toBe(expectedData);
    });
  });

  describe('getDemos', () => {
    it('returns empty array when no demos found', async () => {
      const filename = resolve(__dirname, '..', 'data', 'non-existent-file.ts');
      componentInfo = getComponentInfo(filename);

      expect(componentInfo.getDemos()).toEqual([]);
    });

    it('returns correct demos when demos are present', async () => {
      const filename = resolve(__dirname, '..', 'data', 'tree-view.ts');

      const markdownContent = `# ${title}\n\n`;
      fs.writeFileSync(filename, markdownContent);
      const markdownHeaders = getHeaders(markdownContent) as any;
      const expectedDemos = [
        { demoPageTitle: '# tree-view', demoPathname: '/x/react-tree-view/' },
      ];

      componentInfo = getComponentInfo(filename);

      expect(componentInfo.getDemos()).toEqual(expectedDemos);
    });
  });

  describe('getMuiName', () => {
    it('returns correct muiName when name is provided', async () => {
      const name = 'tree-view';
      const packageFile = `@stoked-ui/tree-view`;

      componentInfo = getComponentInfo(packageFile);

      expect(componentInfo.muiName).toBe(getMuiName(name));
    });

    it('returns null when filename is not a valid mui filename', async () => {
      const name = 'tree-view';
      const packageFile = `@stoked-ui/non-existent`;

      componentInfo = getComponentInfo(packageFile);

      expect(componentInfo.muiName).toBe(null);
    });
  });

  describe('getComponentInfo with invalid filename', () => {
    it('returns null when reading file fails', async () => {
      const filename = 'non-existent-file.txt';

      componentInfo = getComponentInfo(filename);

      expect(componentInfo).toBeNull();
    });
  });

  describe('getComponentInfo with missing name or muiName', () => {
    it('returns null when no name is provided', async () => {
      const packageFile = `@stoked-ui/tree-view`;

      componentInfo = getComponentInfo(packageFile);

      expect(componentInfo).toBeNull();
    });

    it('returns null when no muiName is provided', async () => {
      const filename = resolve(__dirname, '..', 'data', 'tree-view.ts');

      componentInfo = getComponentInfo(filename);

      expect(componentInfo.muiName).toBeNull();
    });
  });
});