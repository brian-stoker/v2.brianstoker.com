/**
 * Overview.test.js
 *
 * Unit tests for the MarkdownDocs component.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import MarkdownDocs from 'src/modules/components/MarkdownDocs';
import * as pageProps from 'data/home/docs/overview/overview.md?muiMarkdown';

describe('MarkdownDocs component', () => {
  let propsMock;
  let wrapper;

  beforeEach(() => {
    propsMock = { ...pageProps };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    wrapper = render(<MarkdownDocs {...propsMock} />);
    expect(wrapper).toBeTruthy();
  });

  it('renders with valid props', () => {
    wrapper = render(<MarkdownDocs {...propsMock} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with invalid prop (missing prop)', () => {
    wrapper = render(<MarkdownDocs {...{ ...propsMock, missingProp: undefined }} />);
    expect(wrapper).toMatchSnapshot();
  });

  describe('conditional rendering', () => {
    it('renders children when markdown is present', () => {
      const childrenMock = 'Hello World!';
      propsMock.markdown = childrenMock;
      wrapper = render(<MarkdownDocs {...propsMock} />);
      expect(wrapper.getByText(childrenMock)).toBeInTheDocument();
    });

    it('does not render children when markdown is absent', () => {
      propsMock.markdown = undefined;
      wrapper = render(<MarkdownDocs {...propsMock} />);
      expect(wrapper.queryByText()).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('clicks the close button', async () => {
      const clickMock = jest.fn();
      propsMock.onClose = clickMock;
      wrapper = render(<MarkdownDocs {...propsMock} />);
      const closeButton = wrapper.getByRole('button');
      fireEvent.click(closeButton);
      expect(clickMock).toHaveBeenCalledTimes(1);
    });

    it('submits the form', async () => {
      const submitMock = jest.fn();
      propsMock.onSubmit = submitMock;
      wrapper = render(<MarkdownDocs {...propsMock} />);
      const formInput = wrapper.getByTestId('form-input');
      fireEvent.change(formInput, { target: { value: 'Hello World!' } });
      fireEvent.submit(wrapper getByRole('form'));
      expect(submitMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('calls the onClose prop when closed', async () => {
      const onCloseMock = jest.fn();
      propsMock.onClose = onCloseMock;
      wrapper = render(<MarkdownDocs {...propsMock} />);
      const closeButton = wrapper.getByRole('button');
      fireEvent.click(closeButton);
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('calls the onSubmit prop when submitted', async () => {
      const onSubmitMock = jest.fn();
      propsMock.onSubmit = onSubmitMock;
      wrapper = render(<MarkdownDocs {...propsMock} />);
      const formInput = wrapper.getByTestId('form-input');
      fireEvent.change(formInput, { target: { value: 'Hello World!' } });
      fireEvent.submit(wrapper.getByRole('form'));
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
  });
});