import { render, screen } from '@testing-library/react';
import React from 'react';
import buildGridSelectorsDocumentation from './buildGridSelectorsDocumentation';

describe('buildGridSelectorsDocumentation', () => {
  const project = {
    exports: {
      symbol1: {
        name: 'Selector',
        // other properties...
      },
      symbol2: {
        name: 'otherSelector',
        // other properties...
      },
    },
    checker: {
      getTypeOfSymbolAtLocation,
      getSignaturesOfType,
      typeToString,
    },
  };

  const apiPagesFolder = '/api/pages';
  const documentationFolderName = 'documentation';

  const options: BuildSelectorsDocumentationOptions = {
    project,
    apiPagesFolder,
    documentationFolderName,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<buildGridSelectorsDocumentation options={options} />);
    expect(screen).not.toHaveError();
  });

  it('calls project.checker.getTypeOfSymbolAtLocation with correct parameters', async () => {
    const mockGetTypeOfSymbolAtLocation = jest.fn(project.checker.getTypeOfSymbolAtLocation);
    options.project.checker.getTypeOfSymbolAtLocation = mockGetTypeOfSymbolAtLocation;

    await buildGridSelectorsDocumentation(options);

    expect(mockGetTypeOfSymbolAtLocation).toHaveBeenCalledTimes(6);
  });

  it('calls project.checker.getSignaturesOfType with correct parameters', async () => {
    const mockGetSignaturesOfType = jest.fn(project.checker.getSignaturesOfType);
    options.project.checker.getSignaturesOfType = mockGetSignaturesOfType;

    await buildGridSelectorsDocumentation(options);

    expect(mockGetSignaturesOfType).toHaveBeenCalledTimes(1);
  });

  it('calls project.checker.typeToString with correct parameters', async () => {
    const mockTypeToString = jest.fn(project.checker.typeToString);
    options.project.checker.typeToString = mockTypeToString;

    await buildGridSelectorsDocumentation(options);

    expect(mockTypeToString).toHaveBeenCalledTimes(2);
  });

  describe('Selector creation', () => {
    it('should create a selector for symbol1', async () => {
      const mockResolveExportSpecifier = jest.fn((symbol, project) => ({ name: 'Symbol1' }));
      options.project.exports[0] = { name: 'Selector', // other properties...

        resolveExportSpecifier = mockResolveExportSpecifier
      };

      await buildGridSelectorsDocumentation(options);

      expect(mockResolveExportSpecifier).toHaveBeenCalledTimes(1);
    });

    it('should not create a selector for symbol2', async () => {
      const mockResolveExportSpecifier = jest.fn((symbol, project) => ({ name: 'Symbol2' }));
      options.project.exports[0] = { name: 'otherSelector', // other properties...

        resolveExportSpecifier = mockResolveExportSpecifier
      };

      await buildGridSelectorsDocumentation(options);

      expect(mockResolveExportSpecifier).not.toHaveBeenCalled();
    });
  });

  describe('JSON data creation', () => {
    it('should create a selectors.json file', async () => {
      const writePrettifiedFileMock = jest.fn(() => Promise.resolve({}));
      options.writePrettifiedFile = writePrettifiedFileMock;

      await buildGridSelectorsDocumentation(options);

      expect(writePrettifiedFileMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should sort the selectors in ascending order', async () => {
    const mockResolveExportSpecifier = jest.fn((symbol, project) => ({ name: 'Symbol3' }));
    options.project.exports[0] = { name: 'Selector', // other properties...

        resolveExportSpecifier = mockResolveExportSpecifier
      };

    await buildGridSelectorsDocumentation(options);

    expect(mockResolveExportSpecifier).toHaveBeenCalledTimes(1);
  });

  it('should not create a selector if the symbol does not end with "Selector"', async () => {
    const mockResolveExportSpecifier = jest.fn((symbol, project) => ({ name: 'Symbol4' }));
    options.project.exports[0] = { name: 'otherSymbol', // other properties...

        resolveExportSpecifier = mockResolveExportSpecifier
      };

    await buildGridSelectorsDocumentation(options);

    expect(mockResolveExportSpecifier).not.toHaveBeenCalled();
  });
});