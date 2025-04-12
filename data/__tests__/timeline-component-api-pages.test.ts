import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { TimelineComponent, timelinePagesApi } from './component';

describe('Timeline Component', () => {
  const component = render(<TimelineComponent />);
  let pageHistory;

  beforeEach(() => {
    component.rerender(<TimelineComponent />);
    pageHistory = [];
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(component).toBeTruthy();
  });

  it('renders timeline pages api', async () => {
    const { getByText } = render(<TimelineComponent />);
    await waitFor(() => expect(getByText('Timeline')).toBeInTheDocument());
    expect(pageHistory).toEqual(timelinePagesApi);
  });

  describe('Conditional Rendering', () => {
    it('renders navigation when API pages are passed', async () => {
      const { getByText, queryByRole } = render(<TimelineComponent />);
      await waitFor(() => expect(getByText('Navigation')).toBeInTheDocument());
      expect(queryByRole('nav')).not.toBeNull();
    });

    it('does not render navigation when API pages are not passed', async () => {
      const { queryByText, queryByRole } = render(<TimelineComponent />);
      await waitFor(() => expect(queryByText('Navigation')).not.toBeInTheDocument());
      expect(queryByRole('nav')).toBeNull();
    });
  });

  describe('Prop Validation', () => {
    it('accepts API pages prop', async () => {
      const { getByText } = render(<TimelineComponent apiPages={timelinePagesApi} />);
      await waitFor(() => expect(getByText('Timeline')).toBeInTheDocument());
      expect(pageHistory).toEqual(timelinePagesApi);
    });

    it('does not accept non-array prop for API pages', async () => {
      const { queryByText, queryByRole } = render(<TimelineComponent apiPages="not an array" />);
      await waitFor(() => expect(queryByText('Timeline')).not.toBeInTheDocument());
      expect(queryByRole('nav')).toBeNull();
    });

    it('does not accept undefined or null prop for API pages', async () => {
      const { queryByText, queryByRole } = render(<TimelineComponent apiPages={undefined} />);
      await waitFor(() => expect(queryByText('Timeline')).not.toBeInTheDocument());
      expect(queryByRole('nav')).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('opens navigation when clicking the button', async () => {
      const { getByText, queryByRole } = render(<TimelineComponent />);
      await waitFor(() => expect(getByText('Navigation')).toBeInTheDocument());
      const button = getByText('Open Navigation');
      fireEvent.click(button);
      await waitFor(() => expect(queryByRole('nav')).not.toBeNull());
    });

    it('closes navigation when clicking the close button', async () => {
      const { getByText, queryByRole } = render(<TimelineComponent />);
      await waitFor(() => expect(getByText('Navigation')).toBeInTheDocument());
      const closeButton = getByText('Close');
      fireEvent.click(closeButton);
      await waitFor(() => expect(queryByRole('nav')).toBeNull());
    });

    it('submits the form when clicking the submit button', async () => {
      const { getByText, queryByRole } = render(<TimelineComponent />);
      await waitFor(() => expect(getByText('Submit')).toBeInTheDocument());
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      await waitFor(() => expect(queryByRole('form')).not.toBeInTheDocument());
    });
  });

  describe('Side Effects', () => {
    it('fetches API pages when the component mounts', async () => {
      const fetchMock = jest.fn();
      global.fetch = jest.spyOn(fetch, 'default').mockImplementationOnce(() => Promise.resolve({ status: 200, json: () => timelinePagesApi }));
      render(<TimelineComponent />);
      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    });
  });

  describe('Snapshot Test', () => {
    it('renders with the correct structure', async () => {
      const { asFragment } = render(<TimelineComponent />);
      await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
  });
});