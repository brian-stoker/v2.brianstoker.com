import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import buildServiceWorker from './buildServiceWorker';

jest.mock('fs-extra', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

describe('Build Service Worker Component', () => {
  it('renders without crashing', async () => {
    const { container } = render(<buildServiceWorker />);
    expect(container).toBeInTheDocument();
  });

  describe('Conditional Rendering', () => {
    it('renders successfully if file exists', async () => {
      jest.spyOn(buildServiceWorker, 'run').mockImplementationOnce(() => Promise.resolve());
      const { container } = render(<buildServiceWorker />);
      await waitFor(() => expect(jest.spyOn(buildServiceWorker, 'run')).toBeCalled());
    });

    it('does not render if file does not exist', async () => {
      jest.spyOn(buildServiceWorker, 'run').mockImplementationOnce(() => Promise.reject(new Error()));
      const { container } = render(<buildServiceWorker />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('Prop Validation', () => {
    it('accepts valid file path', async () => {
      const { container } = render(
        <buildServiceWorker
          filePath={path.join(__dirname, '../export/sw.js')}
          // other props
        />,
      );
      await waitFor(() => expect(jest.spyOn(buildServiceWorker, 'run')).toBeCalled());
    });

    it('rejects invalid file path', async () => {
      const { container } = render(
        <buildServiceWorker
          filePath='invalid/path'
          // other props
        />,
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls run method on button click', async () => {
      const { getByText, getByRole } = render(<buildServiceWorker />);
      const button = await getByRole('button');
      fireEvent.click(button);
      expect(jest.spyOn(buildServiceWorker, 'run')).toBeCalled();
    });

    it('calls run method when file change event occurs', async () => {
      const { getByText, getByRole } = render(<buildServiceWorker />);
      const button = await getByRole('button');
      fireEvent.change(button, { target: { value: 'new file' } });
      expect(jest.spyOn(buildServiceWorker, 'run')).toBeCalled();
    });

    it('submits form on input change', async () => {
      const { getByText, getByRole } = render(<buildServiceWorker />);
      const input = await getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new file' } });
      expect(jest.spyOn(buildServiceWorker, 'run')).toBeCalled();
    });
  });

  describe('Side Effects', () => {
    it('writes to file with prepend function', async () => {
      jest.spyOn(fse, 'writeFile');
      await buildServiceWorker();
      expect(fse.writeFile).toHaveBeenCalledTimes(1);
    });

    it('reads from file with readFile function', async () => {
      jest.spyOn(fse, 'readFile').mockImplementation(() => '');
      await buildServiceWorker();
      expect(fse.readFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot Test', () => {
    it('matches the original component', async () => {
      const { container } = render(<buildServiceWorker />);
      expect(container).toMatchSnapshot();
    });
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});