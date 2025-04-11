import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MarkdownElement from './MarkdownElement';

describe('MarkdownElement', () => {
  const props = {
    renderedMarkdown: '<p>Hello World!</p>',
    className: 'custom-class',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<MarkdownElement {...props} />);
    expect(document.body).toBeInTheDocument();
  });

  it('renders with rendered markdown', () => {
    const { getByText } = render(<MarkdownElement {...props} />);
    expect(getByText('Hello World!')).toBeInTheDocument();
  });

  it('renders without rendering html', () => {
    const { getByText } = render(<MarkdownElement {...props} renderedMarkdown="invalid" />);
    expect(getByText(props.renderedMarkdown)).toBeInTheDocument();
  });

  it('renders with default theme styles', async () => {
    const { getByText, getAllByRole } = render(<MarkdownElement {...props} />);
    const preElements = await waitFor(() => getAllByRole('pre'), {
      timeout: 2000,
    });
    expect(preElements[0]).toHaveStyleRule('background-color', '#f8f8f2');
  });

  it('renders with custom theme styles', async () => {
    const { getByText, getAllByRole } = render(<MarkdownElement {...props} className="custom-class" />);
    const preElements = await waitFor(() => getAllByRole('pre'), {
      timeout: 2000,
    });
    expect(preElements[0]).toHaveStyleRule('max-width', 'calc(100vw - 32px)');
  });

  it('handles invalid props', async () => {
    const { getByText } = render(<MarkdownElement {...props} invalidProp="Invalid" />);
    expect(getByText(props.renderedMarkdown)).toBeInTheDocument();
  });

  it('renders with ref prop', async () => {
    const ref = React.createRef<HTMLDivElement>();
    const { getByText, container } = render(
      <div>
        <MarkdownElement {...props} ref={ref} />
      </div>,
    );
    expect(container.querySelector('div')).toHaveAttribute('ref');
  });

  it('fires click event', async () => {
    const onClickMock = jest.fn();
    const { getByText, getByRole } = render(
      <div>
        <MarkdownElement {...props} onClick={onClickMock} />
      </div>,
    );
    expect(getByText(props.renderedMarkdown)).toBeInTheDocument();
    fireEvent.click(getByText(props.renderedMarkdown));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('fires input change event', async () => {
    const onChangeMock = jest.fn();
    const { getByText, getByRole } = render(
      <div>
        <MarkdownElement {...props} onChange={onChangeMock} />
      </div>,
    );
    expect(getByText(props.renderedMarkdown)).toBeInTheDocument();
    fireEvent.change(getByText(props.renderedMarkdown), { target: 'Hello World!' });
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  it('fires form submission event', async () => {
    const onSubmitMock = jest.fn();
    const { getByText, getByRole } = render(
      <div>
        <form onSubmit={onSubmitMock}>
          <MarkdownElement {...props} />
        </form>
      </div>,
    );
    expect(getByText(props.renderedMarkdown)).toBeInTheDocument();
    fireEvent.submit(document.querySelector('form'));
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });
});