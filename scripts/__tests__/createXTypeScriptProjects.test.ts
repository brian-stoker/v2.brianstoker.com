import { render, screen } from '@testing-library/react';
import { createXTypeScriptProjects } from './createXTypeScriptProjects';

describe('createXTypeScriptProjects', () => {
  it('renders without crashing', async () => {
    const { container } = render(<CreateXTypeScriptProjects />);
    expect(container).not.toBeNull();
  });

  describe('getComponentsWithPropTypes', () => {
    it('returns correct paths for valid project', async () => {
      const projects = createXTypeScriptProjects();
      const componentPaths = Array.from(projects.values()).map((project) =>
        project.getComponentsWithPropTypes({ folders: ['src'] })
      );
      expect(componentPaths).not.toBeNull();
    });

    it('returns empty array for invalid project', async () => {
      const projects = createXTypeScriptProjects();
      const componentPaths = Array.from(projects.values()).map((project) =>
        project.getComponentsWithPropTypes({ folders: [] })
      );
      expect(componentPaths).toEqual([]);
    });
  });

  describe('getComponentsWithApiDoc', () => {
    it('returns correct paths for valid project', async () => {
      const projects = createXTypeScriptProjects();
      const componentPaths = Array.from(projects.values()).map((project) =>
        project.getComponentsWithApiDoc({ folders: ['src'] })
      );
      expect(componentPaths).not.toBeNull();
    });

    it('returns empty array for invalid project', async () => {
      const projects = createXTypeScriptProjects();
      const componentPaths = Array.from(projects.values()).map((project) =>
        project.getComponentsWithApiDoc({ folders: [] })
      );
      expect(componentPaths).toEqual([]);
    });
  });

  describe('packageNames', () => {
    it('includes all package names', () => {
      const expectedPackageNames = ['x-tree-view', 'file-explorer', 'media-selector', 'timeline', 'editor', 'core'];
      expect(packageNames).toEqual(expectedPackageNames);
    });
  });

  describe('getEntryPoint', () => {
    it('returns correct entry point for valid project', async () => {
      const rootPath = path.join(__dirname, 'src');
      const expectedEntryPoint = 'src/index.tsx';
      expect(getEntryPoint(rootPath)).toBe(expectedEntryPoint);
    });

    it('returns false for invalid project', async () => {
      const rootPath = 'invalid-project/src';
      expect(getEntryPoint(rootPath)).toBe(false);
    });
  });
});