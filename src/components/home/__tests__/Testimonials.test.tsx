import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Testimonials from './Testimonials';

describe('Testimonials component', () => {
  const sectionHeadlineProps = {
    overline: 'Join the community',
    title: <Typography variant="h2" component="h2">Supported by thousands of <GradientText>developers and designers</GradientText>,
  };

  const userFeedbacksProps = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Testimonials />);
    expect(Testimonials).toBeTruthy();
  });

  describe('Conditional rendering', () => {
    it('renders SectionHeadline with default props', () => {
      const { getByText } = render(
        <Testimonials>
          <SectionHeadline {...sectionHeadlineProps} />
        </Testimonials>,
      );
      expect(getByText(sectionHeadlineProps.overline)).toBeInTheDocument();
      expect(getByText(sectionHeadlineProps.title)).toBeInTheDocument();
    });

    it('renders UserFeedbacks with default props', () => {
      const { getByText } = render(
        <Testimonials>
          <UserFeedbacks {...userFeedbacksProps} />
        </Testimonials>,
      );
      expect(getByText('')).toBeInTheDocument();
    });
  });

  describe('Prop validation', () => {
    it('throws an error when title is not a string', () => {
      const { getByText } = render(
        <Testimonials>
          <SectionHeadline overline="Join the community" title={123} />
        </Testimonials>,
      );
      expect(getByText('')).not.toBeInTheDocument();
    });

    it('throws an error when overline is not a string', () => {
      const { getByText } = render(
        <Testimonials>
          <SectionHeadline overline={123} title="Supported by thousands of developers and designers" />
        </Testimonials>,
      );
      expect(getByText('')).not.toBeInTheDocument();
    });

    it('throws an error when title is null', () => {
      const { getByText } = render(
        <Testimonials>
          <SectionHeadline overline="Join the community" title=null />
        </Testimonials>,
      );
      expect(getByText('')).not.toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('calls onClick on SectionHeadline', async () => {
      const onClickMock = jest.fn();
      render(
        <Testimonials>
          <SectionHeadline overline="Join the community" title={sectionHeadlineProps.title} onClick={onClickMock} />
        </Testimonials>,
      );
      fireEvent.click(getByText(sectionHeadlineProps.overline));
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('calls onChange on UserFeedbacks', async () => {
      const onChangeMock = jest.fn();
      render(
        <Testimonials>
          <UserFeedbacks {...userFeedbacksProps} onChange={onChangeMock} />
        </Testimonials>,
      );
      fireEvent.change(getByText(''), { target: { value: 'test' } });
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit on UserFeedbacks', async () => {
      const onSubmitMock = jest.fn();
      render(
        <Testimonials>
          <UserFeedbacks {...userFeedbacksProps} onSubmit={onSubmitMock} />
        </Testimonials>,
      );
      fireEvent.change(getByText(''), { target: { value: 'test' } });
      fireEvent.submit();
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Side effects', () => {
    it('renders SectionHeadline after initial render', async () => {
      const { getByText, rerender } = render(
        <Testimonials>
          <SectionHeadline overline="Join the community" title={sectionHeadlineProps.title} />
        </Testimonials>,
      );
      await waitFor(() => expect(getByText(sectionHeadlineProps.overline)).toBeInTheDocument());
      rerender(<Testimonials />);
      await waitFor(() => expect(getByText(sectionHeadlineProps.overline)).not.toBeInTheDocument());
    });

    it('renders UserFeedbacks after initial render', async () => {
      const { getByText, rerender } = render(
        <Testimonials>
          <UserFeedbacks {...userFeedbacksProps} />
        </Testimonials>,
      );
      await waitFor(() => expect(getByText('')).toBeInTheDocument());
      rerender(<Testimonials />);
      await waitFor(() => expect(getByText('')).not.toBeInTheDocument());
    });
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<Testimonials />);
    expect(asFragment()).toMatchSnapshot();
  });
});