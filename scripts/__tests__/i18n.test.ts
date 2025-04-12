import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import type { MuiPage } from 'src/MuiPage';
import path from 'path';
import fse from 'fs-extra';
import { pageToTitle } from 'src/modules/utils/helpers';
import stokedUiPages from 'data/pages';

const EXCLUDES = ['/api', '/blog', '/x/react-'];
type PageData = Record<String, string>;

describe('run function', () => {
  beforeEach(async () => {
    await fse.remove(path.join(__dirname, '../translations/translations.json'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('runs without crashing', async () => {
    const mockWriteFile = jest.spyOn(fse, 'writeFile');
    await run();
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
  });

  describe('traverse function', () => {
    let pages: MuiPage[];

    beforeEach(() => {
      pages = stokedUiPages.map((page) => ({ ...page }));
    });

    it('visits each page in the array', async () => {
      const mockTraverse = jest.spyOn(traverse, 'traverse');
      await run();
      expect(mockTraverse).toHaveBeenCalledTimes(pages.length);
    });

    it('filters out excluded paths', async () => {
      pages[0].pathname = '/api';
      await run();
      const outputPages = JSON.parse(await fse.readFile(path.join(__dirname, '../translations/translations.json'), 'utf8')).pages;
      expect(outputPages).toEqual({});
    });
  });

  describe('output function', () => {
    let output: PageData;

    beforeEach(() => {
      output = {};
    });

    it('populates the output object with page data', async () => {
      const mockParseJSON = jest.spyOn(JSON, 'parse');
      await run();
      expect(mockParseJSON).toHaveBeenCalledTimes(1);
      const parsedOutput = JSON.parse(output.pages);
      expect(parsedOutput).toEqual({});
    });

    it('filters out pages without a title', async () => {
      pages[0].title = '';
      await run();
      const outputPages = JSON.parse(await fse.readFile(path.join(__dirname, '../translations/translations.json'), 'utf8')).pages;
      expect(outputPages).toEqual({});
    });
  });

  describe('UI rendering', () => {
    it('renders the UI correctly', async () => {
      const { container } = render(<MuiPage />);
      expect(container).toBeInTheDocument();
    });

    describe('user interactions', () => {
      let input: HTMLInputElement;

      beforeEach(() => {
        ({ input } = render(<MuiPage />));
      });

      it('responds to user input changes', async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        await waitFor(() => expect(input.value).toBe('test'));
      });

      describe('form submissions', () => {
        let form: HTMLFormElement;

        beforeEach(() => {
          ({ form } = render(<MuiPage />));
        });

        it('responds to form submission', async () => {
          fireEvent.submit(form);
          await waitFor(() => expect(input.value).toBe('test'));
        });
      });
    });
  });
});

import type { MuiPage, traverse } from 'src/MuiPage';
import type { pageToTitle } from 'src/modules/utils/helpers';

const translatePages = async () => {
  const translationsFilename = path.join(__dirname, '../translations/translations.json');
  await fse.remove(translationsFilename);
  return {
    pages: {},
  };
};

export default translatePages;