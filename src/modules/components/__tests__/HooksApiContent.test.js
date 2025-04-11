import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { useTranslate, useUserLanguage } from '@stoked-ui/docs/i18n';
import PropertiesSection from 'src/modules/components/ApiPage/sections/PropertiesSection';
import HighlightedCode from 'src/modules/components/HighlightedCode';
import MarkdownElement from 'src/modules/components/MarkdownElement';

const mockUseTranslate = jest.fn(() => ({
  t: jest.fn((key) => key),
}));

const mockUseUserLanguage = jest.fn(() => ({
  locale: 'en',
}));

function getTranslatedHeader(t, header, text) {
  const translations = {
    demos: t('api-docs.demos'),
    import: t('api-docs.import'),
    'hook-name': t('api-docs.hookName'),
    parameters: t('api-docs.parameters'),
    'return-value': t('api-docs.returnValue'),
  };

  return translations[header] || translations[text] || text || header;
}

function Heading(props) {
  const { hash, text, level: Level = 'h2' } = props;
  return (
    <Level id={hash}>
      {getTranslatedHeader(getTranslated(), hash, text)}
      <a aria-labelledby={hash} className="anchor-link" href={`#${hash}`} tabIndex={-1}>
        <svg>
          <use xlinkHref="#anchor-link-icon" />
        </svg>
      </a>
    </Level>
  );
}

function getProps(descriptions, pagesContents, defaultLayout = 'table', layoutStorageKey = DEFAULT_API_LAYOUT_STORAGE_KEYS) {
  return {
    descriptions,
    pagesContents,
    defaultLayout,
    layoutStorageKey,
  };
}

describe('HooksApiContent component', () => {
  const history = createMemoryHistory();
  const router = new Router(history);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const descriptions = [
      {
        en: {
          api-docs.hookName: 'hook-name',
          api-docs.parameters: 'parameters',
          api-docs.returnValue: 'return-value',
        },
      },
    ];

    const pagesContents = {
      hookName: {
        parameters: {
          type: 'object',
          properties: [
            { name: 'prop1', required: true },
            { name: 'prop2', required: false },
          ],
        },
        returnValue: {
          type: 'string',
        },
      },
    };

    const props = getProps(descriptions, pagesContents);
    const tree = render(
      <Router history={history}>
        <HooksApiContent {...props} />
      </Router>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('renders properties section for parameters', async () => {
    const descriptions = [
      {
        en: {
          api-docs.hookName: 'hook-name',
          api-docs.parameters: 'parameters',
          api-docs.returnValue: 'return-value',
        },
      },
    ];

    const pagesContents = {
      hookName: {
        parameters: {
          type: 'object',
          properties: [
            { name: 'prop1', required: true },
            { name: 'prop2', required: false },
          ],
        },
        returnValue: {
          type: 'string',
        },
      },
    };

    const props = getProps(descriptions, pagesContents);
    const tree = render(
      <Router history={history}>
        <HooksApiContent {...props} />
      </Router>,
    );

    await waitFor(() => {
      expect(tree.query('PropertiesSection')).toHaveLength(1);
    });

    const propertiesSection = tree.query('PropertiesSection');
    expect(propertiesSection).toHaveClass('api-docs-parameters');

    userEvent.click(propertiesSection.querySelector('.showOptionalAbbr'));
    expect(propertiesSection.querySelector('.hideOptionalAbbr').textContent).toBe('');
  });

  it('renders properties section for return value', async () => {
    const descriptions = [
      {
        en: {
          api-docs.hookName: 'hook-name',
          api-docs.parameters: 'parameters',
          api-docs.returnValue: 'return-value',
        },
      },
    ];

    const pagesContents = {
      hookName: {
        parameters: {
          type: 'object',
          properties: [
            { name: 'prop1', required: true },
            { name: 'prop2', required: false },
          ],
        },
        returnValue: {
          type: 'string',
        },
      },
    };

    const props = getProps(descriptions, pagesContents);
    const tree = render(
      <Router history={history}>
        <HooksApiContent {...props} />
      </Router>,
    );

    await waitFor(() => {
      expect(tree.query('PropertiesSection')).toHaveLength(1);
    });

    const propertiesSection = tree.query('PropertiesSection');
    expect(propertiesSection).toHaveClass('api-docs-returnValue');

    userEvent.click(propertiesSection.querySelector('.showOptionalAbbr'));
    expect(propertiesSection.querySelector('.hideOptionalAbbr').textContent).toBe('');
  });
});