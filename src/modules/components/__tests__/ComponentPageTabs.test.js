import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useTranslate } from 'src/modules/utils/i18n';
import { Link } from '@stoked-ui/docs/Link';
import ComponentPageTabs from './ComponentPageTabs.test.js';

describe('ComponentPageTabs', () => {
  const props = {
    activeTab: '',
    children: <div />,
    markdown: {
      headers: {
        components: [],
        hooks: [],
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(render(<ComponentPageTabs {...props} />). ContainerType)).toHaveTextContent('');
  });

  it('renders with correct active tab', () => {
    const router = { pathname: '/demos' };
    props.activeTab = 'demos';
    const { getByText } = render(<ComponentPageTabs {...props} router={router} />);
    expect(getByText(props.markdown.headers.components[0].label)).toBeInTheDocument();
  });

  it('renders tabs with correct labels', () => {
    const router = { pathname: '/demos' };
    props.activeTab = 'demos';
    render(<ComponentPageTabs {...props} router={router} />);
    expect(document.querySelector('.MuiTab-label')).toHaveTextContent(props.markdown.headers.components[0].label);
  });

  it('renders tabs with correct links', () => {
    const router = { pathname: '/demos' };
    props.activeTab = 'demos';
    render(<ComponentPageTabs {...props} router={router} />);
    expect(document.querySelector('.MuiTab-link')).toHaveAttribute('href', '/demos');
  });

  it('renders tabs with correct indicator', () => {
    const router = { pathname: '/demos' };
    props.activeTab = 'demos';
    render(<ComponentPageTabs {...props} router={router} />);
    expect(document.querySelector('.MuiIndicator')).toHaveClass('MuiIndicator-active');
  });

  it('handles invalid active tab', () => {
    const router = { pathname: '/invalid-tab' };
    props.activeTab = 'invalid';
    render(<ComponentPageTabs {...props} router={router} />);
    expect(document.querySelector('.MuiTab-indicator')).not.toHaveClass('MuiIndicator-active');
  });

  it('renders components with correct href', () => {
    const router = { pathname: '/components' };
    props.markdown.headers.components = ['component-1'];
    render(<ComponentPageTabs {...props} router={router} />);
    expect(document.querySelector('.MuiTab-link')).toHaveAttribute('href', '/components');
  });

  it('renders hooks with correct href', () => {
    const router = { pathname: '/hooks' };
    props.markdown.headers.hooks = ['hook-1'];
    render(<ComponentPageTabs {...props} router={router} />);
    expect(document.querySelector('.MuiTab-link')).toHaveAttribute('href', '/hooks');
  });

  it('renders children with correct context', () => {
    const children = <div />;
    props.children = children;
    render(<ComponentPageTabs {...props} />);
    expect(children).toBeInstanceOf(Function);
  });

  it('handles click event on tab', async () => {
    const router = { pathname: '/demos' };
    props.activeTab = 'demos';
    const onClickSpy = jest.fn();
    render(<ComponentPageTabs {...props} router={router} onClick={onClickSpy} />);
    const tabElement = document.querySelector('.MuiTab-link');
    fireEvent.click(tabElement);
    expect(onClickSpy).toHaveBeenCalledTimes(1);
  });

  it('handles input change event on tab', async () => {
    const router = { pathname: '/demos' };
    props.activeTab = 'demos';
    const onChangeSpy = jest.fn();
    render(<ComponentPageTabs {...props} router={router} onChange={onChangeSpy} />);
    const inputElement = document.querySelector('input');
    fireEvent.change(inputElement, { target: { value: 'new-value' } });
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  it('handles link click event', async () => {
    const router = { pathname: '/demos' };
    props.activeTab = 'demos';
    render(<ComponentPageTabs {...props} router={router} />);
    const linkElement = document.querySelector('.MuiTab-link');
    fireEvent.click(linkElement);
    expect(router.pathname).toBe('/demos');
  });
});