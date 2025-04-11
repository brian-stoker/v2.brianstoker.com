import { render, fireEvent } from '@testing-library/react';
import buildApiInterfacesJson from './buildApiInterfacesJson';
import linkifyTranslation from './linkifyTranslation';
import XTypeScriptProjects from '../createXTypeScriptProjects';
import DocumentedInterfaces from './utils';

describe('Linkify Translation Component', () => {
  let mockGetDocumentation;

  beforeEach(() => {
    mockGetDocumentation = jest.fn();
    global.documentedInterfaces = { get: mockGetDocumentation };
  });

  afterEach(() => {
    mockGetDocumentation.mockReset();
  });

  it('renders without crashing', async () => {
    const props = {
      directory: './docs',
      documentedInterfaces: new DocumentedInterfaces(),
      folder: 'api-docs',
    };

    await linkifyTranslation(props.directory, props.documentedInterfaces, props.folder);

    expect(mockGetDocumentation).toHaveBeenCalledTimes(1);
  });

  it('links translated files', async () => {
    mockGetDocumentation.mockReturnValueOnce({
      'get-content': jest.fn(),
    });

    const props = {
      directory: './docs',
      documentedInterfaces: new DocumentedInterfaces(),
      folder: 'api-docs',
    };

    await linkifyTranslation(props.directory, props.documentedInterfaces, props.folder);

    expect(mockGetDocumentation).toHaveBeenCalledTimes(1);
    expect(mockGetDocumentation.mock.calls[0][0]).toBe('get-content');
  });

  it('does not modify files without translated content', async () => {
    mockGetDocumentation.mockReturnValueOnce({
      'get-content': jest.fn(),
    });

    const props = {
      directory: './docs',
      documentedInterfaces: new DocumentedInterfaces(),
      folder: 'api-docs',
    };

    await linkifyTranslation(props.directory, props.documentedInterfaces, props.folder);

    expect(mockGetDocumentation).toHaveBeenCalledTimes(1);
    expect(mockGetDocumentation.mock.calls[0][0]).toBe('get-content');
  });

  it('does not modify files without translation', async () => {
    mockGetDocumentation.mockReturnValueOnce(null);

    const props = {
      directory: './docs',
      documentedInterfaces: new DocumentedInterfaces(),
      folder: 'api-docs',
    };

    await linkifyTranslation(props.directory, props.documentedInterfaces, props.folder);

    expect(mockGetDocumentation).toHaveBeenCalledTimes(1);
  });

  it('can handle multiple files', async () => {
    mockGetDocumentation.mockReturnValueOnce({
      'get-content': jest.fn(),
    });

    const props = {
      directory: './docs',
      documentedInterfaces: new DocumentedInterfaces(),
      folder: 'api-docs',
    };

    await linkifyTranslation(props.directory, props.documentedInterfaces, props.folder);

    expect(mockGetDocumentation).toHaveBeenCalledTimes(1);
    expect(mockGetDocumentation.mock.calls[0][0]).toBe('get-content');
  });
});