import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { configure } from 'vitest';
import { describe, expect, test, beforeEach, afterEach } from 'vitest';

const LANGUAGES = ['en', 'fr', 'de'];
const LANGUAGES_SSR = [...LANGUAGES, 'it'];
const LANGUAGES_IN_PROGRESS = [...LANGUAGES, 'es'];
const IGNORE_PAGES = () => false;

configure({
  test: {
    // ...test config
  },
});

describe('LanguageConfig Component Tests', () => {
  let component;
  const langMock = jest.fn();

  beforeEach(() => {
    component = render(<LanguageConfig lang={LANGUAGES} ignorePages={IGNORE_PAGES()} />);
  });

  afterEach(() => {
    component.unmount();
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      expect(component).toBeTruthy();
    });

    test('renders languages array', () => {
      const { getByText } = render(<LanguageConfig lang={LANGUAGES} />);
      expect(getByText(LANGUAGES.join(', '))).toBeInTheDocument();
    });

    test('renders SSR languages array', () => {
      const { getByText } = render(<LanguageConfig lang={LANGUAGES_SSR} />);
      expect(getByText(LANGUAGES_SSR.join(', '))).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    test('ignores pages with valid ignorePages function', () => {
      component = render(<LanguageConfig lang={LANGUAGES} ignorePages={() => true} />);
      expect(component).toBeTruthy();
    });

    test('does not ignore pages with invalid ignorePages function', () => {
      const invalidIgnorePages = jest.fn(() => false);
      component = render(<LanguageConfig lang={LANGUAGES} ignorePages={invalidIgnorePages} />);
      expect(component).toBeTruthy();
    });
  });

  describe('Props Validation', () => {
    test('validates language array prop', () => {
      expect(LANGUAGES).toEqual([['en'], ['fr'], ['de']]);
    });

    test('invalidates language array prop', () => {
      const invalidLang = 'invalid';
      expect(() => new LanguageConfig(invalidLang)).toThrowError();
    });
  });

  describe('User Interactions', () => {
    test('calls ignorePages function on click', () => {
      component = render(<LanguageConfig lang={LANGUAGES} ignorePages={() => true} />);
      const button = component.getByRole('button');
      fireEvent.click(button);
      expect(IGNORE_PAGES()).toBe(true);
    });

    test('does not call ignorePages function with invalid prop', () => {
      const invalidLang = 'invalid';
      component = render(<LanguageConfig lang={invalidLang} ignorePages={() => true} />);
      const button = component.getByRole('button');
      fireEvent.click(button);
      expect(IGNORE_PAGES()).toBe(true);
    });
  });

  describe('Snapshot Test', () => {
    test('renders languages array snapshot', () => {
      const { asFragment } = render(<LanguageConfig lang={LANGUAGES} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});