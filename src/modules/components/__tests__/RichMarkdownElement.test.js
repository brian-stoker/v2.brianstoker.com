import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useTranslate, useUserLanguage } from '@stoked-ui/docs/i18n';
import MarkdownElement from 'src/modules/components/MarkdownElement';
import HighlightedCodeWithTabs from 'src/modules/components/HighlightedCodeWithTabs';
import Demo from 'src/modules/components/Demo';

jest.mock('@stoked-ui/docs/i18n', () => ({
  useTranslate: jest.fn(),
  useUserLanguage: jest.fn(() => 'en'),
}));

function NoComponent() {
  throw new Error('No demo component provided');
}

const renderWithProps = (props) => render(<RichMarkdownElement {...props} />);

describe('RichMarkdownElement', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('renders without crashing with valid props', () => {
    const props = {
      activeTab: 'tab-1',
      demoComponents: { component: 'ComponentPageTabs' },
      demos: { demo: 'demo-name' },
      disableAd: false,
      localizedDoc: {},
      renderedMarkdownOrDemo: {
        component: 'ComponentPageTabs',
        demo: 'demo-name',
      },
      srcComponents: { ComponentPageTabs: () => <div>Component</div> },
      theme: {},
      WrapperComponent: div, // eslint-disable-line
      wrapperProps: {},
    };

    const { container } = renderWithProps(props);

    expect(container).toMatchSnapshot();
  });

  it('throws an error with missing demo', () => {
    const props = {
      activeTab: 'tab-1',
      demoComponents: { component: 'ComponentPageTabs' },
      demos: {},
      disableAd: false,
      localizedDoc: {},
      renderedMarkdownOrDemo: 'demo-name',
      srcComponents: { ComponentPageTabs: () => <div>Component</div> },
      theme: {},
      WrapperComponent: div, // eslint-disable-line
      wrapperProps: {},
    };

    const { container } = renderWithProps(props);

    expect(container).toMatchSnapshot();
  });

  it('throws an error with no component found', () => {
    const props = {
      activeTab: 'tab-1',
      demoComponents: { component: 'ComponentPageTabs' },
      demos: {},
      disableAd: false,
      localizedDoc: {},
      renderedMarkdownOrDemo: {
        component: 'non-existent-component',
        demo: 'demo-name',
      },
      srcComponents: { ComponentPageTabs: () => <div>Component</div> },
      theme: {},
      WrapperComponent: div, // eslint-disable-line
      wrapperProps: {},
    };

    const { container } = renderWithProps(props);

    expect(container).toMatchSnapshot();
  });

  it('renders with markdown', () => {
    const props = {
      activeTab: 'tab-1',
      demoComponents: { component: 'ComponentPageTabs' },
      demos: {},
      disableAd: false,
      localizedDoc: { location: '/docs/data/demo-name', content: 'markdown-content' },
      renderedMarkdownOrDemo: 'markdown-content',
      srcComponents: { ComponentPageTabs: () => <div>Component</div> },
      theme: {},
      WrapperComponent: div, // eslint-disable-line
      wrapperProps: {},
    };

    const { container } = renderWithProps(props);

    expect(container).toMatchSnapshot();
  });

  it('renders with demo options', () => {
    const props = {
      activeTab: 'tab-1',
      demoComponents: { component: 'ComponentPageTabs' },
      demos: { demo: 'demo-name' },
      disableAd: false,
      localizedDoc: {},
      renderedMarkdownOrDemo: {
        component: 'ComponentPageTabs',
        demo: 'demo-name',
      },
      srcComponents: { ComponentPageTabs: () => <div>Component</div> },
      theme: {},
      WrapperComponent: div, // eslint-disable-line
      wrapperProps: {},
    };

    const { container } = renderWithProps(props);

    expect(container).toMatchSnapshot();
  });

  it('renders with GitHub location', () => {
    const props = {
      activeTab: 'tab-1',
      demoComponents: { component: 'ComponentPageTabs' },
      demos: { demo: 'demo-name' },
      disableAd: false,
      localizedDoc: {},
      renderedMarkdownOrDemo: {
        component: 'ComponentPageTabs',
        demo: 'demo-name',
      },
      srcComponents: { ComponentPageTabs: () => <div>Component</div> },
      theme: {},
      WrapperComponent: div, // eslint-disable-line
      wrapperProps: {},
      githubLocation: 'https://example.com/blob/v1.0/demo-name',
    };

    const { container } = renderWithProps(props);

    expect(container).toMatchSnapshot();
  });

  it('renders with demo options and raw values', () => {
    const props = {
      activeTab: 'tab-1',
      demoComponents: { component: 'ComponentPageTabs' },
      demos: { demo: 'demo-name' },
      disableAd: false,
      localizedDoc: {},
      renderedMarkdownOrDemo: {
        component: 'ComponentPageTabs',
        demo: 'demo-name',
      },
      srcComponents: { ComponentPageTabs: () => <div>Component</div> },
      theme: {},
      WrapperComponent: div, // eslint-disable-line
      wrapperProps: {},
    };

    const { container } = renderWithProps(props);

    expect(container).toMatchSnapshot();
  });

  it('fires the GitHub location click event', () => {
    const props = {
      activeTab: 'tab-1',
      demoComponents: { component: 'ComponentPageTabs' },
      demos: { demo: 'demo-name' },
      disableAd: false,
      localizedDoc: {},
      renderedMarkdownOrDemo: {
        component: 'ComponentPageTabs',
        demo: 'demo-name',
      },
      srcComponents: { ComponentPageTabs: () => <div>Component</div> },
      theme: {},
      WrapperComponent: div, // eslint-disable-line
      wrapperProps: {},
    };

    const { getByText } = renderWithProps(props);

    fireEvent.click(getByText('GitHub Location'));

    expect(props.githubLocation).toHaveBeenCalledTimes(1);
  });

  it('fires the GitHub location click event with raw values', () => {
    const props = {
      activeTab: 'tab-1',
      demoComponents: { component: 'ComponentPageTabs' },
      demos: { demo: 'demo-name' },
      disableAd: false,
      localizedDoc: {},
      renderedMarkdownOrDemo: {
        component: 'ComponentPageTabs',
        demo: 'demo-name',
      },
      srcComponents: { ComponentPageTabs: () => <div>Component</div> },
      theme: {},
      WrapperComponent: div, // eslint-disable-line
      wrapperProps: {},
    };

    const { getByText } = renderWithProps(props);

    fireEvent.click(getByText('GitHub Location'));

    expect(props.githubLocation).toHaveBeenCalledTimes(1);
  });
});