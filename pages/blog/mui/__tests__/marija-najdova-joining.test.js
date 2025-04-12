import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './marija-najdova-joining.md?muiMarkdown';

const Page = () => {
  return <TopLayoutBlog docs={docs} />;
};

describe('Page component', () => {
  beforeEach(() => {
    global.mocks = [];
  });

  afterEach(() => {
    global.mocks = [];
  });

  it('renders without crashing', () => {
    const { container } = render(<Page />);
    expect(container).toBeTruthy();
  });

  it('renders the top layout blog component with valid props', () => {
    const { container } = render(<Page />);
    expect(container.querySelector('TopLayoutBlog')).toBeTruthy();
    expect(container.querySelector('TopLayoutBlog')).toHaveAttribute('docs', docs);
  });

  it('does not throw an error when passed invalid props', () => {
    const { container } = render(<Page docs={null} />);
    expect(container).toBeTruthy();
  });

  it('calls the docs prop with the correct value', async () => {
    const mockGetDocsSpy = jest.spyOn(Page.prototype, 'getDocs');
    const { getByText } = render(<Page />);
    await waitFor(() => getByText('Docs'));
    expect(mockGetDocsSpy).toHaveBeenCalledTimes(1);
  });

  it('renders the docs section when passed valid props', () => {
    const { container } = render(<Page />);
    expect(container.querySelector('section.docs')).toBeTruthy();
  });

  it('does not throw an error when passed an empty array of docs', () => {
    const { container } = render(<Page docs={[]} />);
    expect(container).toBeTruthy();
  });

  it('calls the getDocs prop with the correct value when an array of docs is provided', async () => {
    const mockGetDocsSpy = jest.spyOn(Page.prototype, 'getDocs');
    const { getByText } = render(<Page docs={['doc1', 'doc2']} />);
    await waitFor(() => getByText('doc1'));
    expect(mockGetDocsSpy).toHaveBeenCalledTimes(1);
  });

  it('renders the doc titles when passed an array of docs', () => {
    const { container } = render(<Page docs={['doc1', 'doc2']} />);
    expect(container.querySelector('.docs-title')).toHaveTextContent('doc1');
    expect(container.querySelector('.docs-title')).toHaveTextContent('doc2');
  });

  it('does not throw an error when passed a single doc object', () => {
    const { container } = render(<Page docs={{ title: 'doc1' }} />);
    expect(container).toBeTruthy();
  });

  it('calls the getDocs prop with the correct value when a single doc object is provided', async () => {
    const mockGetDocsSpy = jest.spyOn(Page.prototype, 'getDocs');
    const { getByText } = render(<Page docs={{ title: 'doc1' }} />);
    await waitFor(() => getByText('doc1'));
    expect(mockGetDocsSpy).toHaveBeenCalledTimes(1);
  });

  it('renders the doc titles when passed a single doc object', () => {
    const { container } = render(<Page docs={{ title: 'doc1' }} />);
    expect(container.querySelector('.docs-title')).toHaveTextContent('doc1');
  });
});