import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { vitest } from 'vitest';
import { XTypeScriptProjects, XTypeScriptProject } from '../createXTypeScriptProjects';
import type { buildExportsDocumentation } from './buildExportsDocumentation';

describe('buildExportsDocumentation', () => {
  const projects = [
    new XTypeScriptProject(),
    new XTypeScriptProject(),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    await render(<buildExportsDocumentation projects={projects} />);
    expect(vitest.dom.queryByText('scripts')).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('should render exports list for each project', async () => {
      const { getByText } = render(
        <buildExportsDocumentation projects={projects} />
      );
      await waitFor(() => getByText(projects[0].name));
      expect(getByText(projects[0].name)).toBeInTheDocument();
      expect(getByText(projects[1].name)).toBeInTheDocument();
    });

    it('should not render exports list for empty projects array', async () => {
      const { queryByText } = render(
        <buildExportsDocumentation projects={[]} />
      );
      await waitFor(() => !queryByText('scripts'));
      expect(queryByText('scripts')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('should reject invalid projects array prop type', async () => {
      const { error } = render(
        <buildExportsDocumentation projects={[] as never} />,
      );
      expect(error).toBeInstanceOf(Error);
    });

    it('should accept valid projects array prop type', async () => {
      await render(<buildExportsDocumentation projects={projects} />);
      expect(vitest.dom.queryByText('scripts')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should trigger exports writing for each project on click', async () => {
      const { getByText } = render(
        <buildExportsDocumentation projects={projects} />,
      );
      await waitFor(() => getByText(projects[0].name));
      fireEvent.click(getByText(projects[0].name));
      expect(jest.spyOn(writePrettifiedFile, 'writePrettifiedFile').mock.calls.length).toBe(1);
    });

    it('should not trigger exports writing for non-clickable projects', async () => {
      const { queryByText } = render(
        <buildExportsDocumentation projects={[]} />,
      );
      fireEvent.click(queryByText('scripts'));
      expect(jest.spyOn(writePrettifiedFile, 'writePrettifiedFile').mock.calls.length).toBe(0);
    });
  });

  describe('side effects', () => {
    it('should write exports to file for each project on build', async () => {
      const { getByText } = render(
        <buildExportsDocumentation projects={projects} />,
      );
      await waitFor(() => getByText(projects[0].name));
      expect(jest.spyOn(writePrettifiedFile, 'writePrettifiedFile').mock.calls.length).toBeGreaterThan(1);
    });
  });

  it('should return correct exports documentation', async () => {
    const { queryByText } = render(
      <buildExportsDocumentation projects={projects} />,
    );
    await waitFor(() => getByText(projects[0].name));
    const exports = [
      { name: projects[0].name, kind: 'identifier' },
      { name: projects[1].name, kind: 'identifier' },
    ];
    expect(queryByText(exports[0].name)).toBeInTheDocument();
    expect(queryByText(exports[1].name)).toBeInTheDocument();
  });
});

declare global {
  namespace jest {
    interface MockedFunction extends jest.Mock {}
  }
}

interface XTypeScriptProjects {
  [key: number]: XTypeScriptProject;
}