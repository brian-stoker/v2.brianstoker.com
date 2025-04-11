import { createRender } from '@stoked-ui/docs-markdown';
import React from 'react';
import { describe, it, expect, waitFor } from 'vitest';
import { mapApiPageTranslations } from './mapApiPageTranslations';

const LANGUAGES_IGNORE_PAGES = ['en'];
const mockReq = (filename) => {
  return Promise.resolve({
    [filename]: '<markdown content}',
  });
};

describe('mapApiPageTranslations', () => {
  beforeEach(() => {
    global.fetchMock.mockClear();
  });

  afterEach(() => {
    global.fetchMock.mockReset();
  });

  it('renders without crashing', async () => {
    const translations = await mapApiPageTranslations(mockReq);
    expect(translations).not.toBeNull();
  });

  describe('conditional rendering paths', () => {
    it('renders markdown content for English translations', async () => {
      const reqMock = (filename) => {
        if (filename === 'en.json') {
          return Promise.resolve({
            [filename]: '<markdown content>',
          });
        }
        return null;
      };
      const translations = await mapApiPageTranslations(reqMock);
      expect(translations['en']).toHaveProperty('componentDescription');
    });

    it('does not render markdown content for non-English translations', async () => {
      const reqMock = (filename) => {
        if (filename.match(notEnglishJsonRegExp)) {
          return Promise.resolve({
            [filename]: null,
          });
        }
        return null;
      };
      const translations = await mapApiPageTranslations(reqMock);
      expect(translations['fr']).toBeNull();
    });

    it('renders markdown content for English translations with TOC', async () => {
      const reqMock = (filename) => {
        if (filename === 'en.json') {
          return Promise.resolve({
            [filename]: '<markdown content>',
          });
        }
        return null;
      };
      const translations = await mapApiPageTranslations(reqMock);
      expect(translations['en']).toHaveProperty('componentDescriptionToc');
    });

    it('does not render markdown content for non-English translations with TOC', async () => {
      const reqMock = (filename) => {
        if (filename.match(notEnglishJsonRegExp)) {
          return Promise.resolve({
            [filename]: null,
          });
        }
        return null;
      };
      const translations = await mapApiPageTranslations(reqMock);
      expect(translations['fr']).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('throws an error when req is not a function', () => {
      expect(() => mapApiPageTranslations(null)).toThrowError();
    });

    it('throws an error when req returns null for a filename', async () => {
      const reqMock = (filename) => Promise.resolve(null);
      expect(() => mapApiPageTranslations(reqMock)).toThrowError();
    });
  });

  describe('user interactions', () => {
    let translations;

    beforeEach(() => {
      translations = await mapApiPageTranslations(mockReq);
    });

    it('calls createRender when a translation is rendered', async () => {
      const renderSpy = jest.spyOn(translations, 'componentDescription');
      await mapApiPageTranslations(mockReq);
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    it('sets global fetch mock when req is provided', async () => {
      const reqMock = (filename) => Promise.resolve({ [filename]: '<markdown content>' });
      await mapApiPageTranslations(reqMock);
      expect(global.fetchMock).toHaveBeenCalledTimes(1);
    });

    it('clears global fetch mock after test completes', async () => {
      const reqMock = (filename) => Promise.resolve({ [filename]: '<markdown content>' });
      await mapApiPageTranslations(reqMock);
      await waitFor(() => {
        expect(global.fetchMock).toHaveBeenCalledTimes(1);
        global.fetchMock.mockClear();
      });
    });
  });

  describe('snapshot tests', () => {
    it('has the expected translations object for English translation', async () => {
      const reqMock = (filename) => Promise.resolve({
        [filename]: '<markdown content>',
      });
      const result = await mapApiPageTranslations(reqMock);
      expect(result).toMatchSnapshot();
    });

    it('does not have any translations for non-English translations', async () => {
      const reqMock = (filename) => Promise.resolve(null);
      const result = await mapApiPageTranslations(reqMock);
      expect(result).not.toHaveProperty('fr');
    });
  });
});