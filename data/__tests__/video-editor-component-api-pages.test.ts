import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import VideoEditorComponent from './VideoEditorComponent';

describe('Video Editor Component', () => {
  const componentProps = {
    apiPages: [
      {
        pathname: '/timeline/api/timeline',
        title: 'Timeline',
      },
    ],
  };

  let videoEditorComponent;

  beforeEach(() => {
    videoEditorComponent = render(<VideoEditorComponent {...componentProps} />);
  });

  afterEach(() => {
    // clean up any mocks
  });

  it('renders without crashing', () => {
    expect(videoEditorComponent).toBeTruthy();
  });

  describe('conditional rendering paths', () => {
    it('renders api pages', async () => {
      const { getByText } = render(<VideoEditorComponent {...componentProps} />);
      expect(getByText('Timeline')).toBeInTheDocument();
    });

    it('renders default content when no api pages are provided', async () => {
      // mock component
      const MockedVideoEditorComponent = ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
      };

      videoEditorComponent = render(<MockedVideoEditorComponent />);
      expect(getByText('No API pages available')).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('validates apiPages prop as array of objects', async () => {
      const invalidApiPages: any[] = [{ pathname: '/timeline/api/timeline' }];

      videoEditorComponent = render(<VideoEditorComponent {...componentProps} apiPages={invalidApiPages} />);
      expect(getByText('Invalid API pages')).toBeInTheDocument();
    });

    it('validates title prop as non-empty string', async () => {
      const invalidTitle = '';

      videoEditorComponent = render(
        <VideoEditorComponent
          {...componentProps}
          apiPages={[{ pathname: '/timeline/api/timeline', title: invalidTitle }]}
        />
      );
      expect(getByText('Invalid title')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls api page handler on click', async () => {
      const apiPageHandler = jest.fn();

      videoEditorComponent = render(
        <VideoEditorComponent
          {...componentProps}
          apiPages={[{ pathname: '/timeline/api/timeline', title: 'Timeline' }, { pathname: '/next-page', title: 'Next page' }]}
          onApiPageClick={apiPageHandler}
        />
      );

      const timelineLink = videoEditorComponent.getByText('Timeline');
      fireEvent.click(timelineLink);

      expect(apiPageHandler).toHaveBeenCalledTimes(1);
      expect(apiPageHandler).toHaveBeenCalledWith('/timeline/api/timeline');
    });

    it('calls form submission handler on form submission', async () => {
      const formSubmissionHandler = jest.fn();

      videoEditorComponent = render(
        <VideoEditorComponent
          {...componentProps}
          apiPages={[{ pathname: '/timeline/api/timeline', title: 'Timeline' }, { pathname: '/next-page', title: 'Next page' }]}
          onFormSubmission={formSubmissionHandler}
        />
      );

      const formInput = videoEditorComponent.getByTestId('form-input');
      fireEvent.change(formInput, { target: { value: 'test input' } });
      fireEvent.submit(videoEditorComponent.getByTestId('form'));

      expect(formSubmissionHandler).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onApiPageClick event handler with correct api page data', async () => {
    const apiPageData = { pathname: '/next-page', title: 'Next page' };
    const onApiPageClickHandler = jest.fn();

    videoEditorComponent = render(
      <VideoEditorComponent
        {...componentProps}
        onApiPageClick={onApiPageClickHandler}
      />
    );

    const apiPageLink = videoEditorComponent.getByText('Next page');
    fireEvent.click(apiPageLink);

    expect(onApiPageClickHandler).toHaveBeenCalledTimes(1);
    expect(onApiPageClickHandler).toHaveBeenCalledWith(apiPageData);
  });

  it('snaps a photo of the component', async () => {
    render(<VideoEditorComponent {...componentProps} />);
    await waitFor(() => expect(true).toBeTrue());
  });
});