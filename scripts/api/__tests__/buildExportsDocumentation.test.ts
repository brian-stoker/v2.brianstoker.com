import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import type { XTypeScriptProject, XTypeScriptProjects } from '../createXTypeScriptProjects';
import type { BuildPackageExportsProps } from './buildExportsDocumentation';

interface MockTSContext {
  ts: typeof ts;
}

const createMockTSContext = (ts: typeof ts) => ({
  ts,
});

describe('buildExportsDocumentation', () => {
  let mockTSContext: MockTSContext;
  let projects: XTypeScriptProjects;

  beforeEach(() => {
    mockTSContext = createMockTSContext(ts);
    projects = { projects: [{}] as XTypeScriptProject[] };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<BuildPackageExportsDocumentation projects={projects} />);
    expect(container).toBeTruthy();
  });

  describe('prop validation', () => {
    it('valid project should not throw an error', () => {
      expect(() => buildExportsDocumentation(projects)).not.toThrow();
    });

    it('invalid project should throw an error', () => {
      projects = { projects: [] };
      expect(() => buildExportsDocumentation(projects)).toThrowError(
        'Expected projects to be an array of at least one XTypeScriptProject',
      );
    });
  });

  describe('conditional rendering', () => {
    it('should render package exports for a valid project', async () => {
      const { getByText } = render(<BuildPackageExportsDocumentation projects={projects} />);
      await waitFor(() => expect(getByText('package.exports')).toBeInTheDocument());
    });

    it('should not render package exports for an invalid project', async () => {
      projects = { projects: [] };
      const { queryByText } = render(<BuildPackageExportsDocumentation projects={projects} />);
      await waitFor(() => expect(queryByText('package.exports')).not.toBeInTheDocument());
    });
  });

  describe('user interactions', () => {
    it('should trigger build package exports on click', async () => {
      const { getByText, getByRole } = render(<BuildPackageExportsDocumentation projects={projects} />);
      await waitFor(() => expect(getByText('package.exports')).toBeInTheDocument());
      const button = getByRole('button');
      fireEvent.click(button);
      await waitFor(() => expect(getByText('buildPackageExports')).toBeInTheDocument());
    });
  });

  describe('side effects and state changes', () => {
    it('should write prettified file with package exports to disk', async () => {
      const { getByText } = render(<BuildPackageExportsDocumentation projects={projects} />);
      await waitFor(() => expect(getByText('package.exports')).toBeInTheDocument());
      const button = document.querySelector('.build-button');
      fireEvent.click(button);
      await waitFor(() => {
        const fileSystemMock = mockTSContext.ts.createSourceFile;
        expect(fileSystemMock).toHaveBeenCalledTimes(1);
        return fileSystemMock.mock.calls[0][0].createTextSnapshot;
      });
    });
  });

  it('snapshot test: build package exports for a valid project', () => {
    const mockTSContext = createMockTSContext(ts);
    projects = { projects: [{}] as XTypeScriptProject[] };
    const { container } = render(<BuildPackageExportsDocumentation projects={projects} />);
    expect(container).toMatchSnapshot();
  });
});

import type { XTypeScriptProject, XTypeScriptProjects } from '../createXTypeScriptProjects';
import type { BuildPackageExportsProps } from './buildExportsDocumentation';

const buildPackageExports = (project: XTypeScriptProject) => {
  // implementation
};

export default function buildExportsDocumentation(projects: XTypeScriptProjects) {
  // implementation
};