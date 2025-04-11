import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { getComponentFilesInFolder } from './utils';

describe('getComponentFilesInFolder', () => {
  const folderPath = './test-folder';
  const validComponents = ['valid-component1.tsx', 'valid-component2.tsx'];
  const invalidComponents = ['/invalid-component.ts', '.ts'];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Valid component files', () => {
    it('should return an array of valid component file paths', async () => {
      const files = await getComponentFilesInFolder(folderPath);
      expect(files).toEqual(validComponents.map(file => path.resolve(folderPath, file)));
    });

    it('should include subfolders with valid component files', async () => {
      fse.writeFileSync(path.join(folderPath, 'subfolder', 'valid-subfolder-component.tsx'), '');
      const files = await getComponentFilesInFolder(folderPath);
      expect(files).toContain(path.resolve(folderPath, 'subfolder/valid-subfolder-component.tsx'));
    });

    it('should exclude invalid component file paths', async () => {
      fse.writeFileSync(path.join(folderPath, 'invalid-component.ts'), '');
      const files = await getComponentFilesInFolder(folderPath);
      expect(files).not.toContain(path.resolve(folderPath, 'invalid-component.ts'));
    });
  });

  describe('Invalid component files', () => {
    it('should return an empty array for invalid component file paths', async () => {
      const files = await getComponentFilesInFolder(folderPath);
      expect(files).toEqual([]);
    });

    it('should exclude files with incorrect extension', async () => {
      fse.writeFileSync(path.join(folderPath, 'incorrect-file.ts'), '');
      const files = await getComponentFilesInFolder(folderPath);
      expect(files).not.toContain(path.resolve(folderPath, 'incorrect-file.ts'));
    });
  });

  describe('User interactions', () => {
    it('should not throw an error when clicking on a valid component file', async () => {
      const { getByText } = render(<div>{getComponentFilesInFolder(folderPath)}</div>);
      const linkElement = getByText(validComponents[0]);
      fireEvent.click(linkElement);
      expect(jest.runAllTests()).not.toThrow();
    });

    it('should not throw an error when clicking on an invalid component file', async () => {
      const { getByText } = render(<div>{getComponentFilesInFolder(folderPath)}</div>);
      const linkElement = getByText(invalidComponents[0]);
      fireEvent.click(linkElement);
      expect(jest.runAllTests()).not.toThrow();
    });

    it('should not throw an error when typing in the input field', async () => {
      const { getByPlaceholderText } = render(<input placeholder="Search component files" />);
      const inputField = getByPlaceholderText('Search component files');
      fireEvent.change(inputField, { target: { value: 'test' } });
      expect(jest.runAllTests()).not.toThrow();
    });

    it('should not throw an error when submitting the form', async () => {
      const { getByText } = render(<form><input placeholder="Search component files" /></form>);
      const inputField = getByText('Search component files');
      fireEvent.change(inputField, { target: { value: 'test' } });
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      expect(jest.runAllTests()).not.toThrow();
    });
  });

  it('should return the correct result when mocked fs module', async () => {
    jest.mock('fs-extra', () => ({
     .readdirSync: jest.fn(() => ['valid-component1.tsx']),
    }));
    const files = await getComponentFilesInFolder(folderPath);
    expect(files).toEqual(validComponents.map(file => path.resolve(folderPath, file)));
  });
});