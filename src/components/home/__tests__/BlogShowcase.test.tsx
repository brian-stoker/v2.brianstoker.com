import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MediaShowcase from './MediaShowcase';
import PostPreviewBox from '../../../pages/blog/PostPreviewBox';
import BlogPost from "../../../lib/sourcing";
import { act } from 'react-dom/test-utils';

describe('BlogShowcase', () => {
  const setup = ({ showcaseContent }) => {
    return render(<BlogShowcase showcaseContent={showcaseContent} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    expect(setup({})).-rendered;
  });

  it('renders PostPreviewBox correctly', async () => {
    const preview = <PostPreviewBox />;
    const result = setup({ showcaseContent: { title: 'Test Title', content: 'Test Content' } });
    await waitFor(() => {
      expect(result.container).toContainHTML('<PostPreviewBox>');
    });
  });

  it('renders MediaShowcase correctly with PostPreviewBox', async () => {
    const preview = <PostPreviewBox />;
    const result = setup({ showcaseContent: { title: 'Test Title', content: 'Test Content' } });
    await waitFor(() => {
      expect(result.container).toContainHTML('<MediaShowcase>');
    });
  });

  it('renders PostPreviewBox with props correctly', async () => {
    const previewProps = {
      title: 'Test Title',
      content: 'Test Content',
    };
    const result = setup({ showcaseContent: previewProps });
    await waitFor(() => {
      expect(result.container).toContainHTML('<PostPreviewBox title="Test Title" content="Test Content"></PostPreviewBox>');
    });
  });

  it('renders PostPreviewBox with invalid props correctly', async () => {
    try {
      const result = setup({ showcaseContent: { invalidProp: 'Invalid Value' } });
      expect().not.toThrow();
    } catch (e) {
      expect(e.message).toBe('Invalid prop \'invalidProp\' in object.');
    }
  });

  it('calls onShowcaseChange with new content', async () => {
    const onShowcaseChange = jest.fn();
    const showcaseContent = { title: 'Test Title' };
    const result = setup({ showcaseContent, onShowcaseChange });
    fireEvent.change(result.container.querySelector('input[type="text"]'), { target: { value: 'New Content' } });
    await waitFor(() => {
      expect(onShowcaseChange).toHaveBeenCalledTimes(1);
      expect(onShowcaseChange).toHaveBeenCalledWith(showcaseContent);
    });
  });

  it('renders PostPreviewBox when showcaseContent is null', async () => {
    const result = setup({ showcaseContent: null });
    expect(result.container).toContainHTML('<PostPreviewBox />');
  });

  it('renders empty PostPreviewBox when showcaseContent is undefined', async () => {
    const result = setup({ showcaseContent: undefined });
    expect(result.container).toContainHTML('<PostPreviewBox />');
  });
});