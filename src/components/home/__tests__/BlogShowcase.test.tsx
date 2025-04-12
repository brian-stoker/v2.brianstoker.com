import { render, fireEvent, waitFor } from '@testing-library/react';
import MediaShowcase from './MediaShowcase';
import PostPreviewBox from '../../../pages/blog';
import BlogPost from "../../../lib/sourcing";

describe('BlogShowcase component', () => {
  const showcaseContent: BlogPost = {
    title: 'Test Title',
    content: 'Test Content',
    author: 'Test Author',
    date: '2022-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<MediaShowcase showcaseContent={showcaseContent} />);
    expect(container).toBeTruthy();
  });

  it('renders PostPreviewBox component when provided', () => {
    const { container, getByText } = render(<MediaShowcase showcaseContent={showcaseContent} />);
    expect(getByText(showcaseContent.title)).toBeInTheDocument();
  });

  it('does not render PostPreviewBox component when not provided', () => {
    const { container } = render(<MediaShowcase />);
    expect(container).not.toContainElement(text() => 'Test Title');
  });

  it('renders MediaShowcase component with showcaseContent', () => {
    const { container, getByText } = render(<MediaShowcase showcaseContent={showcaseContent} />);
    expect(getByText(showcaseContent.title)).toBeInTheDocument();
    expect(getByText(showcaseContent.content)).toBeInTheDocument();
  });

  it('does not render MediaShowcase component when showcaseContent is null or undefined', () => {
    const { container } = render(<MediaShowcase showcaseContent={null} />);
    expect(container).not.toContainElement(text() => 'Test Title');
    expect(container).not.toContainElement(text() => 'Test Content');
  });

  it('renders PostPreviewBox component with updated content', () => {
    const newContent: BlogPost = {
      title: 'Updated Title',
      content: 'Updated Content',
      author: 'Updated Author',
      date: '2022-01-02',
    };
    const { getByText } = render(<MediaShowcase showcaseContent={newContent} />);
    expect(getByText(newContent.title)).toBeInTheDocument();
  });

  it('handles user input changes', async () => {
    const onInputChangeMock = jest.fn();
    const { getByLabelText, getByTestId } = render(
      <MediaShowcase
        showcaseContent={showcaseContent}
        onInputChange={onInputChangeMock}
      />,
    );
    const inputField = getByLabelText('Test Label');
    fireEvent.change(inputField, { target: { value: 'Updated Input' } });
    expect(onInputChangeMock).toHaveBeenCalledTimes(1);
  });

  it('submits form when user submits', async () => {
    const onSubmitMock = jest.fn();
    const { getByLabelText, getByTestId } = render(
      <MediaShowcase
        showcaseContent={showcaseContent}
        onSubmit={onSubmitMock}
      />,
    );
    const submitButton = getByTestId('submit-button');
    fireEvent.click(submitButton);
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });

  it('renders snapshot', async () => {
    const { asFragment } = render(<MediaShowcase showcaseContent={showcaseContent} />);
    expect(asFragment()).toMatchSnapshot();
  });
});