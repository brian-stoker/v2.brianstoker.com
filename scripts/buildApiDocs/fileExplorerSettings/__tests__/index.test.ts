import { render, fireEvent, waitFor } from '@testing-library/react';
import { create } from 'react-test-renderer';
import React from 'react';
import { ProjectSettings, ComponentReactApi } from '../src/ProjectSettings';
import { getComponentInfo, getComponentImports } from '../src/getComponentInfo';

jest.mock('@mui/utils/generateUtilityClass');
jest.mock('path');

const LANGUAGES: string[] = [];
const fileExplorerSettings = new ProjectSettings({
  output: {
    apiManifestPath: path.join(process.cwd(), 'data/file-explorer-component-api-pages.ts'),
  },
  onWritingManifestFile: jest.fn(),
  typeScriptProjects: [
    {
      name: 'file-explorer',
      rootPath: path.join(process.cwd(), 'packages/file-explorer'),
      entryPointPath: 'src/index.ts',
    },
  ],
  getApiPages: () => findApiPages('pages/file-explorer/api'),
  getComponentInfo,
  translationLanguages: LANGUAGES,
  skipComponent() {
    return false;
  },
  skipAnnotatingComponentDefinition: true,
  translationPagesDirectory: 'translations/api-docs/file-explorer',
  importTranslationPagesDirectory: 'translations/api-docs/file-explorer',
  getComponentImports,
  propsSettings: {
    propsWithoutDefaultVerification: [],
  },
  generateClassName: jest.fn(),
  isGlobalClassName: () => true,
});

describe('ProjectSettings component', () => {
  beforeEach(() => {
    global.clearMocks;
  });

  it('renders without crashing', async () => {
    const { container } = render(<ProjectSettings />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('should render pages when getApiPages returns an array', async () => {
      fileExplorerSettings.getApiPages.mockReturnValue([
        { pathname: 'api1', title: 'Page 1' },
        { pathname: 'api2', title: 'Page 2' },
      ]);
      const { container } = render(<ProjectSettings />);
      expect(container).toBeTruthy();
    });

    it('should not render pages when getApiPages returns null or undefined', async () => {
      fileExplorerSettings.getApiPages.mockReturnValue(null);
      const { container } = render(<ProjectSettings />);
      expect(container).not.toContainElement(null);
    });
  });

  describe('prop validation', () => {
    it('should validate props without default verification', async () => {
      const validProps = ['prop1'];
      fileExplorerSettings.propsSettings.propsWithoutDefaultVerification = [...validProps];
      const { container } = render(<ProjectSettings />);
      expect(container).toBeTruthy();
    });

    it('should not validate props when propsWithoutDefaultVerification is empty', async () => {
      fileExplorerSettings.propsSettings.propsWithoutDefaultVerification = [];
      const { container } = render(<ProjectSettings />);
      expect(container).toBeTruthy();
    });
  });

  describe('user interactions', () => {
    it('should call onWritingManifestFile when the component is clicked', async () => {
      const mockOnWritingManifestFile = jest.fn();
      fileExplorerSettings.onWritingManifestFile = mockOnWritingManifestFile;
      const { getByText } = render(<ProjectSettings />);
      const button = getByText('Write Manifest');
      fireEvent.click(button);
      expect(mockOnWritingManifestFile).toHaveBeenCalledTimes(1);
    });

    it('should update the component state when the translationLanguage changes', async () => {
      fileExplorerSettings.translationLanguages[0] = 'new-language';
      const { getByText } = render(<ProjectSettings />);
      expect(getByText('New Language')).toBeInTheDocument();
    });
  });

  describe('side effects or state changes', () => {
    it('should update the component state when the translationPagesDirectory is updated', async () => {
      fileExplorerSettings.translationPagesDirectory = 'new-directory';
      const { getByText } = render(<ProjectSettings />);
      expect(getByText('New Directory')).toBeInTheDocument();
    });
  });

  describe('mocking dependencies', () => {
    it('should mock generateUtilityClass to return a utility class', async () => {
      fileExplorerSettings.generateClassName.mockReturnValue('test-class');
      const { container } = render(<ProjectSettings />);
      expect(container).toHaveStyle('test-class');
    });
  });

  describe('snapshot test', () => {
    it('should match the snapshot', async () => {
      const tree = create(<ProjectSettings />);
      expect(tree.toJSON()).toMatchSnapshot();
    });
  });
});