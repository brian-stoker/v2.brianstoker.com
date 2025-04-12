import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaSelectorApiPages } from './MediaSelectorApiPages';

describe('MediaSelectorApiPages component', () => {
  let apiPages;
  let mockProps;

  beforeEach(() => {
    apiPages = require('./media-selector-component-api-pages').default;
    mockProps = {
      pages: apiPages,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<MediaSelectorApiPages {...mockProps} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders pages when pages prop is provided', () => {
      const { getByText, getAllByRole } = render(
        <MediaSelectorApiPages {...mockProps} />
      );
      expect(getByText(apiPages[0].title)).toBeInTheDocument();
      expect(getAllByRole('listitem')).toHaveLength(apiPages.length);
    });

    it('renders no pages when pages prop is not provided', () => {
      const { container } = render(<MediaSelectorApiPages />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws an error when pages prop is not provided', () => {
      expect(() => <MediaSelectorApiPages />).toThrowError();
    });

    it('renders correctly with valid pages prop', () => {
      const { getByText } = render(<MediaSelectorApiPages {...mockProps} />);
      expect(getByText(apiPages[0].title)).toBeInTheDocument();
    });

    it('throws an error when pages prop is invalid', () => {
      mockProps.pages = 'invalid';
      expect(() => render(<MediaSelectorApiPages {...mockProps} />)).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('renders pages correctly when clicking on a page', () => {
      const { getByText, getByRole } = render(<MediaSelectorApiPages {...mockProps} />);
      const pageLink = getByRole('link', { name: apiPages[0].title });
      userEvent.click(pageLink);
      expect(getByText(apiPages[1].title)).toBeInTheDocument();
    });

    it('submits the form correctly when clicking on a page', () => {
      mockProps.onPageSelect = jest.fn();
      const { getByText, getByRole } = render(<MediaSelectorApiPages {...mockProps} />);
      const pageLink = getByRole('link', { name: apiPages[0].title });
      userEvent.click(pageLink);
      expect(mockProps.onPageSelect).toHaveBeenCalledTimes(1);
    });

    it('updates the input correctly when clicking on a page', () => {
      mockProps.onPageUpdate = jest.fn();
      const { getByText, getByRole } = render(<MediaSelectorApiPages {...mockProps} />);
      const pageLink = getByRole('link', { name: apiPages[0].title });
      userEvent.click(pageLink);
      expect(mockProps.onPageUpdate).toHaveBeenCalledTimes(1);
    });

    it('submits the form correctly when clicking on an input field', () => {
      mockProps.onInputUpdate = jest.fn();
      const { getByRole, getByText } = render(<MediaSelectorApiPages {...mockProps} />);
      const inputField = getByRole('textbox');
      userEvent.type(inputField, 'test value');
      expect(mockProps.onInputUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('calls the onPageSelect prop when clicking on a page', async () => {
      mockProps.onPageSelect = jest.fn();
      const { getByText } = render(<MediaSelectorApiPages {...mockProps} />);
      const pageLink = getByRole('link', { name: apiPages[0].title });
      await userEvent.click(pageLink);
      expect(mockProps.onPageSelect).toHaveBeenCalledTimes(1);
    });

    it('calls the onPageUpdate prop when clicking on a page', async () => {
      mockProps.onPageUpdate = jest.fn();
      const { getByText } = render(<MediaSelectorApiPages {...mockProps} />);
      const pageLink = getByRole('link', { name: apiPages[0].title });
      await userEvent.click(pageLink);
      expect(mockProps.onPageUpdate).toHaveBeenCalledTimes(1);
    });

    it('calls the onInputUpdate prop when clicking on an input field', async () => {
      mockProps.onInputUpdate = jest.fn();
      const { getByRole, getByText } = render(<MediaSelectorApiPages {...mockProps} />);
      const inputField = getByRole('textbox');
      await userEvent.type(inputField, 'test value');
      expect(mockProps.onInputUpdate).toHaveBeenCalledTimes(1);
    });
  });

  it('renders correctly when using snapshots', () => {
    jest.spyOn(document, 'createHTMLDocument').mockImplementation(() => ({
      documentElement: { body: {} },
    }));
    const { container } = render(<MediaSelectorApiPages {...mockProps} />);
    expect(container).toMatchSnapshot();
  });
});