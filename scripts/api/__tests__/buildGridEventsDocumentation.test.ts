import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import type { BuildEventsDocumentationProps, BuildEventsDocumentationOptions } from './buildGridEventsDocumentation';

describe('buildGridEventsDocumentation', () => {
  const options: BuildEventsDocumentationOptions = {
    projects: [],
    interfacesWithDedicatedPage: [],
  };

  let buildGridEventsDocumentationMock;

  beforeEach(() => {
    buildGridEventsDocumentationMock = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<BuildEventsDocumentation />, { options });
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('should display events when data is available', async () => {
      options.projects.push('test-project');
      options.interfacesWithDedicatedPage.push({
        name: 'TestInterface',
        description: 'This is a test interface.',
      });
      const { getByText } = render(<BuildEventsDocumentation />, { options });

      expect(getByText('Test Interface')).toBeInTheDocument();
    });

    it('should not display events when data is missing', async () => {
      const { queryByText } = render(<BuildEventsDocumentation />, { options });

      expect(queryByText('Test Interface')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    const invalidOptions: BuildEventsDocumentationOptions = {
      projects: [],
      interfacesWithDedicatedPage: null,
    };

    it('should throw an error when data is missing', async () => {
      expect(() => render(<BuildEventsDocumentation />, { options: invalidOptions })).toThrow();
    });
  });

  describe('user interactions', () => {
    const defaultProject = { workspaceRoot: '/' };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle click event correctly', async () => {
      act(() => {
        fireEvent.click(document.querySelector('.build-grid-events-documentation__link'));
      });
      await waitFor(() => expect(buildGridEventsDocumentationMock).toHaveBeenCalledTimes(1));
    });

    it('should handle input change event correctly', async () => {
      const { getByLabelText } = render(<BuildEventsDocumentation />, { options });
      const inputField = getByLabelText('Test Input');
      act(() => {
        fireEvent.change(inputField, { target: { value: 'test' } });
      });
      await waitFor(() => expect(buildGridEventsDocumentationMock).toHaveBeenCalledTimes(1));
    });

    it('should handle form submission correctly', async () => {
      act(() => {
        fireEvent.submit(document.querySelector('.build-grid-events-documentation__form'));
      });
      await waitFor(() => expect(buildGridEventsDocumentationMock).toHaveBeenCalledTimes(1));
    });
  });

  describe('side effects or state changes', () => {
    it('should write events file correctly', async () => {
      act(() => {
        render(<BuildEventsDocumentation />, { options });
      });
      await waitFor(() => expect(buildGridEventsDocumentationMock).toHaveBeenCalledTimes(1));
      expect(writePrettifiedFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('mocking external dependencies', () => {
    it('should mock writePrettifiedFile correctly', async () => {
      jest.spyOn(writePrettifiedFile, 'write').mockImplementation(() => Promise.resolve());
      act(() => {
        render(<BuildEventsDocumentation />, { options });
      });
      await waitFor(() => expect(buildGridEventsDocumentationMock).toHaveBeenCalledTimes(1));
      expect(writePrettifiedFile.write).toHaveBeenCalledTimes(1);
    });

    it('should mock console.log correctly', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => Promise.resolve());
      act(() => {
        render(<BuildEventsDocumentation />, { options });
      });
      await waitFor(() => expect(buildGridEventsDocumentationMock).toHaveBeenCalledTimes(1));
      expect(console.log).toHaveBeenCalledTimes(1);
    });
  });

  it('should sort events correctly', async () => {
    const events = [
      { name: 'Test Event 1' },
      { name: 'Test Event 2' },
      { name: 'Test Event 3' },
    ];

    expect(sortEvents(events)).toEqual([
      { name: 'Test Event 1' },
      { name: 'Test Event 2' },
      { name: 'Test Event 3' },
    ]);
  });

  function sortEvents(events) {
    return events.sort((a, b) => a.name.localeCompare(b.name));
  }
});

const BuildEventsDocumentation = ({ options }: BuildEventsDocumentationProps) => {
  const buildGridEventsDocumentations = async () => {
    // implementation
  };

  return (
    <div>
      <button onClick={buildGridEventsDocumentations}>Build Events File</button>
    </div>
  );
};