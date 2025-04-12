import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { createXTypeScriptProject, XTypeScriptProjects, CreateXTypeScriptProjectOptions, XProjectNames } from './createXTypeScriptProjects';

describe('createXTypeScriptProject', () => {
  let projects: XTypeScriptProjects;

  beforeEach(() => {
    projects = createXTypeScriptProjects();
  });

  it('should return a project with the correct properties', () => {
    const options: CreateXTypeScriptProjectOptions = {
      name: 'test-project',
      rootPath: 'path/to/project',
      tsConfigPath: 'path/to/tsconfig.json',
      entryPointPath: 'src/index.ts',
      files: ['file1.tsx', 'file2.tsx'],
    };
    const project = createXTypeScriptProject(options);
    expect(project).toHaveProperty('name', options.name);
    expect(project).toHaveProperty('rootPath', options.rootPath);
  });

  it('should return a map of projects', () => {
    const mapOfProjects: XTypeScriptProjects = createXTypeScriptProjects();
    expect(mapOfProjects).toBeInstanceOf(Map);
    expect(mapOfProjects.size).toBeGreaterThan(0);
  });

  describe('getComponentsWithPropTypes', () => {
    it('should return an array of component files', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const componentFiles = await project.getComponentsWithPropTypes();
      expect(componentFiles).toBeInstanceOf(Array);
      expect(componentFiles.length).toBeGreaterThan(0);
    });

    it('should include unstable components if specified', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const componentFiles = await project.getComponentsWithPropTypes({
        includeUnstableComponents: true,
      });
      expect(componentFiles.includes('unstable-component')).toBe(true);
    });

    it('should exclude non-component files', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const componentFiles = await project.getComponentsWithPropTypes({
        includeUnstableComponents: true,
      });
      expect(componentFiles.includes('non-component-file')).toBe(false);
    });

    it('should return an empty array if no files are found', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const componentFiles = await project.getComponentsWithPropTypes({
        includeUnstableComponents: true,
        files: [],
      });
      expect(componentFiles).toBeInstanceOf(Array);
      expect(componentFiles.length).toBe(0);
    });

    it('should return an empty array if no folders are specified', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const componentFiles = await project.getComponentsWithPropTypes({
        includeUnstableComponents: true,
        folders: [],
      });
      expect(componentFiles).toBeInstanceOf(Array);
      expect(componentFiles.length).toBe(0);
    });

    it('should return an empty array if no files are found in the specified folder', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const componentFiles = await project.getComponentsWithPropTypes({
        includeUnstableComponents: true,
        folders: ['folder'],
      });
      expect(componentFiles).toBeInstanceOf(Array);
      expect(componentFiles.length).toBe(0);
    });

    it('should return an empty array if no files are found in the specified folder and no components', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const componentFiles = await project.getComponentsWithPropTypes({
        includeUnstableComponents: true,
        folders: ['folder'],
        files: [],
      });
      expect(componentFiles).toBeInstanceOf(Array);
      expect(componentFiles.length).toBe(0);
    });
  });

  describe('getComponentsWithApiDoc', () => {
    it('should return an array of component files', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const componentFiles = await project.getComponentsWithApiDoc();
      expect(componentFiles).toBeInstanceOf(Array);
      expect(componentFiles.length).toBeGreaterThan(0);
    });

    it('should include unstable components if specified', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const componentFiles = await project.getComponentsWithApiDoc({
        includeUnstableComponents: true,
      });
      expect(componentFiles.includes('unstable-component')).toBe(true);
    });

    it('should exclude non-component files', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const componentFiles = await project.getComponentsWithApiDoc({
        includeUnstableComponents: true,
      });
      expect(componentFiles.includes('non-component-file')).toBe(false);
    });

    it('should return an empty array if no files are found', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const componentFiles = await project.getComponentsWithApiDoc({
        includeUnstableComponents: true,
        files: [],
      });
      expect(componentFiles).toBeInstanceOf(Array);
      expect(componentFiles.length).toBe(0);
    });

    it('should return an empty array if no folders are specified', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const componentFiles = await project.getComponentsWithApiDoc({
        includeUnstableComponents: true,
        folders: [],
      });
      expect(componentFiles).toBeInstanceOf(Array);
      expect(componentFiles.length).toBe(0);
    });

    it('should return an empty array if no files are found in the specified folder', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const componentFiles = await project.getComponentsWithApiDoc({
        includeUnstableComponents: true,
        folders: ['folder'],
      });
      expect(componentFiles).toBeInstanceOf(Array);
      expect(componentFiles.length).toBe(0);
    });

    it('should return an empty array if no files are found in the specified folder and no components', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const componentFiles = await project.getComponentsWithApiDoc({
        includeUnstableComponents: true,
        folders: ['folder'],
        files: [],
      });
      expect(componentFiles).toBeInstanceOf(Array);
      expect(componentFiles.length).toBe(0);
    });
  });

  describe('createXTypeScriptProjects', () => {
    it('should return a map of projects', async () => {
      const mapOfProjects = createXTypeScriptProjects();
      expect(mapOfProjects).toBeInstanceOf(Map);
      expect(mapOfProjects.size).toBeGreaterThan(0);
    });

    it('should include all packages in the map', async () => {
      const mapOfProjects = createXTypeScriptProjects();
      const packageNames: XProjectNames[] = Array.from(mapOfProjects.keys());
      expect(packageNames).toEqual([
        'x-tree-view',
        'file-explorer',
        'media-selector',
        'timeline',
        'editor',
      ]);
    });

    it('should include all files in the map', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const packageNames: XProjectNames[] = Array.from(project.packages.keys());
      expect(packageNames).toEqual([
        'x-tree-view',
        'file-explorer',
        'media-selector',
        'timeline',
        'editor',
      ]);
    });

    it('should include all folders in the map', async () => {
      const project: XTypeScriptProject = projects.get('test-project')!;
      const packageNames: XProjectNames[] = Array.from(project.packages.keys());
      expect(packageNames).toEqual([
        'x-tree-view',
        'file-explorer',
        'media-selector',
        'timeline',
        'editor',
      ]);
    });

    it('should return an empty map if no projects are created', async () => {
      const mapOfProjects = createXTypeScriptProjects();
      expect(mapOfProjects).toBeInstanceOf(Map);
      expect(mapOfProjects.size).toBe(0);
    });
  });
});