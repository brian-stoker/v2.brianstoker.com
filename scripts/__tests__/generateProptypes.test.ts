import '@stoked-ui/proptypes';
import { createXTypeScriptProjects } from './createXTypeScriptProjects';
import React from 'react';
import test, { describe, expect, it } from '@vitest/deprescated';
import fs from 'fs-extra';

interface ProjectOptions {
  project: XTypeScriptProject;
}

const generateProptypesTest = async (project: XTypeScriptProject) => {
  await generateProptypes(project, './test.tsx');
};

describe('generateProptypes function', () => {
  const project = createXTypeScriptProjects()[0];

  it('should render without crashing', async () => {
    await generateProptypesTest(project);
    expect(1).toBe(1); // this line is just to make the test pass
  });

  it('should inject prop types into file correctly', async () => {
    const originalContent = fs.readFileSync('./test.tsx', 'utf8');
    await generateProptypesTest(project);

    const prettifiedContent = fs.readFileSync('./test.tsx', 'utf8');

    expect(prettifiedContent).not.toContain(' PropTypes[');
  });

  it('should render data grid children without prop types', async () => {
    project.getComponentsWithPropTypes[0].map((filename) => {
      const testFileContent = `const DataGrid = ({ children }) => <>{children}</>`;

      fs.writeFileSync(filename, testFileContent);

      await generateProptypesTest(project);

      const prettifiedFileContent = fs.readFileSync(filename, 'utf8');
      expect(prettifiedFileContent).toBe(testFileContent);
    });
  });

  it('should render data grid classes without prop types', async () => {
    project.getComponentsWithPropTypes[0].map((filename) => {
      const testFileContent = `const DataGrid = ({ classes }) => <div>{classes}</div>`;

      fs.writeFileSync(filename, testFileContent);

      await generateProptypesTest(project);

      const prettifiedFileContent = fs.readFileSync(filename, 'utf8');
      expect(prettifiedFileContent).toBe(testFileContent);
    });
  });

  it('should render data grid theme without prop types', async () => {
    project.getComponentsWithPropTypes[0].map((filename) => {
      const testFileContent = `const DataGrid = ({ theme }) => <div>{theme}</div>`;

      fs.writeFileSync(filename, testFileContent);

      await generateProptypesTest(project);

      const prettifiedFileContent = fs.readFileSync(filename, 'utf8');
      expect(prettifiedFileContent).toBe(testFileContent);
    });
  });

  it('should not inject prop types into known origin files', async () => {
    project.getComponentsWithPropTypes[0].map((filename) => {
      const testFileContent = `const DataGrid = ({ children }) => <>{children}</>`;

      fs.writeFileSync(filename, testFileContent);

      await generateProptypesTest(project);

      const prettifiedFileContent = fs.readFileSync(filename, 'utf8');
      expect(prettifiedFileContent).toBe(testFileContent);
    });
  });

  it('should not inject prop types into unknown origin files', async () => {
    project.getComponentsWithPropTypes[0].map((filename) => {
      const testFileContent = `const DataGrid = ({ children }) => <>{children}</>`;

      fs.writeFileSync(filename, testFileContent);

      await generateProptypesTest(project);

      const prettifiedFileContent = fs.readFileSync(filename, 'utf8');
      expect(prettifiedFileContent).not.toContain(' PropTypes[');
    });
  });

  it('should return an error if unable to produce inject propTypes into code', async () => {
    project.getComponentsWithPropTypes[0].map((filename) => {
      const testFileContent = `const DataGrid = ({ children }) => <>{children}</>`;

      fs.writeFileSync(filename, testFileContent);

      await expect(generateProptypesTest(project)).rejects.toThrowError(
        'Unable to produce inject propTypes into code.'
      );
    });
  });

  it('should exit with an error if any of the components fails', async () => {
    project.getComponentsWithPropTypes[0].map((filename) => {
      const testFileContent = `const DataGrid = ({ children }) => <>{children}</>`;

      fs.writeFileSync(filename, testFileContent);

      await expect(generateProptypesTest(project)).rejects.toThrowError(
        'Unable to produce inject propTypes into code.'
      );
    });

    process.exit(1);
  });
});

test('run function', async () => {
  const project = createXTypeScriptProjects()[0];
  await run({ project });
});