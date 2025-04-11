import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './march-2019-update.md?muiMarkdown';

describe('Page component', () => {
  const props = {
    docs: docs,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<TopLayoutBlog {...props} />);
    expect renders nothing but a text with some markdown and links
  })

  it('renders TopLayoutBlog component with valid props', async () => {
    const { getByText } = render(<TopLayoutBlog {...props} />);
    expect(getByText(docs.headings[0])).toBeInTheDocument();
  })

  it('renders TopLayoutBlog component with invalid props', async () => {
    const invalidProps = { docs: null };
    const { getByText } = render(<TopLayoutBlog {...invalidProps} />);
    expect(getByText(null)).not.toBeInTheDocument();
  })

  it('renders TopLayoutBlog component without any children', async () => {
    const { container } = render(<TopLayoutBlog {...props} />);
    expect(container).toHaveStyle({
      minWidth: '100%',
    });
  })

  it('calls props function when child tries to access docs prop', async () => {
    const mockGetDocs = jest.fn();
    props.docs = mockGetDocs;
    const { getByText } = render(<TopLayoutBlog {...props} />);
    expect(mockGetDocs).toHaveBeenCalledTimes(1);
  })

  it('doesn\'t call props function when child tries to access docs prop', async () => {
    const mockGetDocs = jest.fn();
    const invalidProps = { docs: null };
    const { getByText } = render(<TopLayoutBlog {...invalidProps} />);
    expect(mockGetDocs).not.toHaveBeenCalled();
  })

  it('renders TopLayoutBlog component when props change', async () => {
    const initialProps = { ...props, docs: 'new-docs' };
    const { rerender } = render(<TopLayoutBlog {...initialProps} />);
    expect(rerender).toHaveBeenCalledTimes(1);
  })

  it('doesn\'t re-render TopLayoutBlog component when props don\'t change', async () => {
    const initialProps = { ...props, docs: 'new-docs' };
    const { rerender } = render(<TopLayoutBlog {...initialProps} />);
    expect(rerender).not.toHaveBeenCalled();
  })

  it('calls prop function on keypress', async () => {
    props(docs).keypress = jest.fn();
    const { getByText } = render(<TopLayoutBlog {...props} />);
    fireEvent.keyPress(getByText(docs.headings[0]), '{');
    expect(props.docs.keypress).toHaveBeenCalledTimes(1);
  })

  it('calls prop function on click', async () => {
    props(docs).click = jest.fn();
    const { getByText } = render(<TopLayoutBlog {...props} />);
    fireEvent.click(getByText(docs.headings[0]));
    expect(props.docs.click).toHaveBeenCalledTimes(1);
  })

  it('calls prop function on change', async () => {
    props(docs).change = jest.fn();
    const { getByText } = render(<TopLayoutBlog {...props} />);
    fireEvent.change(getByText(docs.headings[0]), { target: { value: 'new-value' } });
    expect(props.docs.change).toHaveBeenCalledTimes(1);
  })

  it('calls prop function on submit', async () => {
    props.docs.submit = jest.fn();
    const { getByText } = render(<TopLayoutBlog {...props} />);
    fireEvent.change(getByText(docs.headings[0]), { target: { value: 'new-value' } });
    fireEvent.submit(document.querySelector('form'));
    expect(props.docs.submit).toHaveBeenCalledTimes(1);
  })

  it('calls prop function on focus', async () => {
    props(docs).focus = jest.fn();
    const { getByText } = render(<TopLayoutBlog {...props} />);
    fireEvent.focus(getByText(docs.headings[0]));
    expect(props.docs.focus).toHaveBeenCalledTimes(1);
  })
})