import { render } from '@testing-library/react';
import { screen } from '@testing-library/user-event';
import React from 'react';
import { XTypeScriptProjects, XProjectNames } from '../createXTypeScriptProjects';
import {
  DocumentedInterfaces,
  getSymbolDescription,
  getSymbolJSDocTags,
  linkify,
  stringifySymbol,
  writePrettifiedFile,
} from './utils';

interface BuildEventsDocumentationOptions {
  projects: XTypeScriptProjects;
  interfacesWithDedicatedPage: DocumentedInterfaces;
}

const GRID_PROJECTS: XProjectNames[] = ['x-data-grid', 'x-data-grid-pro', 'x-data-grid-premium'];

describe('buildGridEventsDocumentation component', () => {
  let options: BuildEventsDocumentationOptions;

  beforeEach(() => {
    options = {
      projects: new XTypeScriptProjects(),
      interfacesWithDedicatedPage: {},
    };

    // Mock dependencies
    jest.spyOn(document, 'writePrettifiedFile').mockImplementation((filePath, content, project) => {});
  });

  afterEach(() => {
    // Clean up mock dependencies
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    await render(<buildGridEventsDocumentation options={options} />);
    expect(screen).not.toThrowError();
  });

  describe('conditional rendering', () => {
    it('renders all projects', async () => {
      GRID_PROJECTS.forEach((projectName) => {
        screen.getByText(projectName);
      });
      expect(screen.getAllByText(GRID_PROJECTS)).toHaveLength(GRID_PROJECTS.length);
    });

    it('hides ignored events', async () => {
      const event = { name: 'ignored-event' };
      options.interfacesWithDedicatedPage.tags.ignore = true;
      render(<buildGridEventsDocumentation options={options} />);
      expect(screen.queryByText(event.name)).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('accepts valid props', async () => {
      options.projects.push('x-data-grid-premium');
      render(<buildGridEventsDocumentation options={options} />);
      expect(screen.getAllByRole('listitem')).toHaveLength(options.projects.length);
    });

    it('rejects invalid props', async () => {
      options.projects = ['invalid-project'];
      render(<buildGridEventsDocumentation options={options} />);
      expect(screen.queryByText('x-data-grid-premium')).toBeNull();
    });
  });

  describe('user interactions', () => {
    it('calls console.log on successful build', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log');
      render(<buildGridEventsDocumentation options={options} />);
      await screen.getByText('Built events file').click();
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it('does not call console.log on error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      render(<buildGridEventsDocumentation options={options} />);
      await screen.getByText('Failed to build events file').click();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('writes prettified file to disk', async () => {
      const filePath = 'path/to/events.json';
      jest.spyOn(document, 'writePrettifiedFile');
      render(<buildGridEventsDocumentation options={options} />);
      expect(jest.spyOn(document, 'writePrettifiedFile')).toHaveBeenCalledTimes(1);
    });
  });

  it('sorts events alphabetically', async () => {
    const event = { name: 'a' };
    const sortedEvent = { name: 'z' };
    options.interfacesWithDedicatedPage.tags.sort = (a, b) => a.localeCompare(b);
    render(<buildGridEventsDocumentation options={options} />);
    expect(screen.getAllByText(sortedEvent.name)).toHaveLength(1);
  });
});