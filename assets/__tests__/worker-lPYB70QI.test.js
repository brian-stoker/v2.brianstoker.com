import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import worker from './worker-lPYB70QI';

const getFFmpegCore = (mock) => {
  return jest.fn(() => mock);
};

describe('Worker Component', () => {
  beforeEach(() => {
    // Create a mock for the ffmpeg-core script
    const ffmpegMock = getFFmpegCore({ createFFmpegCore: jest.fn() });
    worker.ffmpegCore = ffmpegMock;
  });

  afterEach(() => {
    worker.ffmpegCore = null;
  });

  it('renders without crashing', () => {
    // @ts-ignore
    render(<worker />);

    expect(worker.ffmpegCore).toBeNull();
  });

  describe('Loading FFmpeg', () => {
    const loadFFmpegMock = jest.fn();

    beforeEach(() => {
      worker.loadFFmpeg = loadFFmpegMock;
    });

    afterEach(() => {
      worker.loadFFmpeg = null;
    });

    it('should load ffmpeg when call `await worker.loadFFmpeg()`', async () => {
      // @ts-ignore
      render(<worker />);

      expect(loadFFmpegMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Executing Commands', () => {
    const executeCommandMock = jest.fn();

    beforeEach(() => {
      worker.executeCommand = executeCommandMock;
    });

    afterEach(() => {
      worker.executeCommand = null;
    });

    it('should execute ffmpeg when call `worker.execute()`', async () => {
      // @ts-ignore
      render(<worker />);

      fireEvent.executeCommand(worker, 'ffmpeg');

      expect(executeCommandMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Writing Files', () => {
    const writeFileMock = jest.fn();

    beforeEach(() => {
      worker.writeFile = writeFileMock;
    });

    afterEach(() => {
      worker.writeFile = null;
    });

    it('should write file when call `worker.writeFile()`', async () => {
      // @ts-ignore
      render(<worker />);

      fireEvent.writeFile(worker, 'test.txt', 'Hello World');

      expect(writeFileMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Reading Files', () => {
    const readFileMock = jest.fn();

    beforeEach(() => {
      worker.readFile = readFileMock;
    });

    afterEach(() => {
      worker.readFile = null;
    });

    it('should read file when call `worker.readFile()`', async () => {
      // @ts-ignore
      render(<worker />);

      fireEvent.readFile(worker, 'test.txt');

      expect(readFileMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Deleting Files', () => {
    const deleteFileMock = jest.fn();

    beforeEach(() => {
      worker.deleteFile = deleteFileMock;
    });

    afterEach(() => {
      worker.deleteFile = null;
    });

    it('should delete file when call `worker.delete()`', async () => {
      // @ts-ignore
      render(<worker />);

      fireEvent.deleteFile(worker, 'test.txt');

      expect(deleteFileMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Renaming Files', () => {
    const renameFileMock = jest.fn();

    beforeEach(() => {
      worker.renameFile = renameFileMock;
    });

    afterEach(() => {
      worker.renameFile = null;
    });

    it('should rename file when call `worker.rename()`', async () => {
      // @ts-ignore
      render(<worker />);

      fireEvent.renameFile(worker, 'test.txt', 'newFile.txt');

      expect(renameFileMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Creating Directories', () => {
    const createDirectoryMock = jest.fn();

    beforeEach(() => {
      worker.createDirectory = createDirectoryMock;
    });

    afterEach(() => {
      worker.createDirectory = null;
    });

    it('should create directory when call `worker.create()`', async () => {
      // @ts-ignore
      render(<worker />);

      fireEvent.createDirectory(worker, 'testDir');

      expect(createDirectoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Listing Files', () => {
    const listFilesMock = jest.fn();

    beforeEach(() => {
      worker.listFiles = listFilesMock;
    });

    afterEach(() => {
      worker.listFiles = null;
    });

    it('should list files when call `worker.listFiles()`', async () => {
      // @ts-ignore
      render(<worker />);

      fireEvent.listFiles(worker, 'testDir');

      expect(listFilesMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Deleting Directories', () => {
    const deleteDirectoryMock = jest.fn();

    beforeEach(() => {
      worker.deleteDirectory = deleteDirectoryMock;
    });

    afterEach(() => {
      worker.deleteDirectory = null;
    });

    it('should delete directory when call `worker.delete()`', async () => {
      // @ts-ignore
      render(<worker />);

      fireEvent.deleteDirectory(worker, 'testDir');

      expect(deleteDirectoryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mounting Files', () => {
    const mountFileMock = jest.fn();

    beforeEach(() => {
      worker.mountFile = mountFileMock;
    });

    afterEach(() => {
      worker.mountFile = null;
    });

    it('should mount file when call `worker.mount()`', async () => {
      // @ts-ignore
      render(<worker />);

      fireEvent.mountFile(worker, 'test.txt');

      expect(mountFileMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Unmounting Files', () => {
    const unmountFileMock = jest.fn();

    beforeEach(() => {
      worker.unmountFile = unmountFileMock;
    });

    afterEach(() => {
      worker.unmountFile = null;
    });

    it('should unmount file when call `worker.unmount()`', async () => {
      // @ts-ignore
      render(<worker />);

      fireEvent.unmountFile(worker, 'test.txt');

      expect(unmountFileMock).toHaveBeenCalledTimes(1);
    });
  });
});