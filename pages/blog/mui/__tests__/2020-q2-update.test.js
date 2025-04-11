// 2023-06-17
import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2020-q2-update.md?muiMarkdown';

describe('Page Component', () => {
  let page;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    page = render(<Page />, document.getElementById('root'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(page.container).not.toBeNull();
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog component with docs prop', async () => {
      const { getByText } = page;
      await waitFor(() => expect(getByText('2020-q2-update.md')).toBeInTheDocument());
    });

    it('does not render anything without docs prop', async () => {
      document.body.innerHTML = '';
      page = render(<Page />, document.getElementById('root'));
      await waitFor(() => expect(page.container).toBeEmptyDOMElement());
    });
  });

  describe('prop validation', () => {
    it('accepts valid docs prop', async () => {
      const { getByText } = page;
      await waitFor(() => expect(getByText('2020-q2-update.md')).toBeInTheDocument());
    });

    it('does not accept invalid docs prop', async () => {
      page.props.docs = null;
      await waitFor(() => expect(page.container).toBeEmptyDOMElement());
    });
  });

  describe('user interactions', () => {
    it('calls props.onLoad when the component is mounted', async () => {
      const onLoadMock = jest.fn();
      page.props.onLoad = onLoadMock;
      fireEvent.mount(page);
      await waitFor(() => expect(onLoadMock).toHaveBeenCalledTimes(1));
    });

    it('does not call onLoad prop when the component is unmounted', async () => {
      const onLoadMock = jest.fn();
      page.props.onLoad = onLoadMock;
      fireEvent.unmountAllComponentsAtOnce(page);
      await waitFor(() => expect(onLoadMock).not.toHaveBeenCalled());
    });
  });

  it('renders correctly with props', () => {
    expect(page.queryByText('2020-q2-update.md')).not.toBeNull();
  });

  it('renders an empty container without props', () => {
    page = render(<Page />, document.getElementById('root'));
    await waitFor(() => expect(page.container).toBeEmptyDOMElement());
  });
});