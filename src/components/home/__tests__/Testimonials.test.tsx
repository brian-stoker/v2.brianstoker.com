import { render, fireEvent, waitFor } from '@testing-library/react';
import Testimonials from './Testimonials.test.tsx';
import React from 'react';

describe('Testimonials component', () => {
  beforeEach(() => {
    global.innerWidth = 1024; // Set the inner width to test responsive styles
  });

  it('renders without crashing', async () => {
    const { getByText } = render(<Testimonials />);
    expect(getByText('Supported by thousands of developers and designers')).toBeInTheDocument();
  });

  describe('Section component tests', () => {
    beforeEach(() => {
      global.innerWidth = 1024; // Set the inner width to test responsive styles
    });

    it('renders section with correct background color scheme', async () => {
      const { getByText } = render(<Testimonials />);
      const section = getByText('Section');
      expect(section).toHaveStyle('background: linear-gradient(180deg, #333 0%, #000 100%)');

      // Mock SectionHeadline prop
      const sectionHeadline = document.querySelector('.MuiTypography-root.MuiTypography-h2') as HTMLHeadingElement;
      expect(sectionHeadline.textContent).toBe('Join the community');
    });

    it('renders section with correct props', async () => {
      const { getByText } = render(<Testimonials />);
      const section = getByText('Section');
      expect(section).toHaveClass('cozy');

      // Mock SectionHeadline prop
      const sectionHeadline = document.querySelector('.MuiTypography-root.MuiTypography-h2') as HTMLHeadingElement;
      expect(sectionHeadline.textContent).toBe('Join the community');
    });

    it('renders section with correct background color scheme when bg prop is set', async () => {
      const { getByText } = render(<Testimonials />);
      const section = getByText('Section');
      expect(section).toHaveStyle('background: linear-gradient(180deg, #333 0%, #000 100%)');

      // Mock SectionHeadline prop
      const sectionHeadline = document.querySelector('.MuiTypography-root.MuiTypography-h2') as HTMLHeadingElement;
      expect(sectionHeadline.textContent).toBe('Join the community');
    });
  });

  describe('UserFeedbacks component tests', () => {
    beforeEach(() => {
      global.innerWidth = 1024; // Set the inner width to test responsive styles
    });

    it('renders UserFeedbacks component', async () => {
      const { getByText } = render(<Testimonials />);
      const userFeedbacks = getByText('User Feedbacks');
      expect(userFeedbacks).toBeInTheDocument();
    });
  });

  describe('prop validation tests', () => {
    let props: Partial<React.ComponentProps<typeof Testimonials>>;

    beforeEach(() => {
      global.innerWidth = 1024; // Set the inner width to test responsive styles
    });

    it('throws an error when bg prop is not a string', async () => {
      expect(() => render(<Testimonials {...{ props: { bg: <InvalidBG /> } }}/>)).toThrowError(
        'bg prop must be a string'
      );
    });
  });

  describe('user interactions tests', () => {
    let props: Partial<React.ComponentProps<typeof Testimonials>>;

    beforeEach(() => {
      global.innerWidth = 1024; // Set the inner width to test responsive styles
    });

    it('calls onClick event when section is clicked', async () => {
      const onClickMock = jest.fn();
      const { getByText } = render(<Testimonials {...{ props: { onClick: onClickMock } }} />);
      const section = getByText('Section');
      fireEvent.click(section);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('calls onChange event when input changes', async () => {
      const onChangeMock = jest.fn();
      const { getByText, getByPlaceholderText } = render(<Testimonials {...{ props: { onChange: onChangeMock } }} />);
      const input = getByPlaceholderText('Input');
      fireEvent.change(input, { target: { value: 'testValue' } });
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit event when form is submitted', async () => {
      const onSubmitMock = jest.fn();
      const { getByText, getByLabelText } = render(<Testimonials {...{ props: { onSubmit: onSubmitMock } }} />);
      const form = document.querySelector('form');
      fireEvent.submit(form);
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('snapshot tests', () => {
    let props: Partial<React.ComponentProps<typeof Testimonials>>;

    beforeEach(() => {
      global.innerWidth = 1024; // Set the inner width to test responsive styles
    });

    it('renders with correct snapshot', async () => {
      const { asFragment } = render(<Testimonials />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});