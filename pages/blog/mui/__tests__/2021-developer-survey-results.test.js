import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2021-developer-survey-results.md?muiMarkdown';

describe('Page Component', () => {
  let page;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    page = render(<Page />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(page).toBeTruthy();
  });

  describe('props', () => {
    const docsMock = { /* mock data */ };

    it('passes docs prop to TopLayoutBlog', () => {
      const { container } = render(<Page docs={docsMock} />);
      expect(container.querySelector('#app')).not.toBeNull();
    });

    it('throws error when docs prop is missing', () => {
      expect(() => render(<Page />)).toThrowError();
    });
  });

  describe('conditional rendering', () => {
    const docsEmptyMock = { /* mock data */ };
    const docsFullMock = { /* mock data */ };

    it('renders TopLayoutBlog with docs prop when present', () => {
      const { getByText } = render(<Page docs={docsFullMock} />);
      expect(getByText('Mock doc')).toBeInTheDocument();
    });

    it('does not render TopLayoutBlog when docs prop is missing', () => {
      const { queryByText } = render(<Page docs={docsEmptyMock} />);
      expect(queryByText('Mock doc')).toBeNull();
    });
  });

  describe('user interactions', () => {
    const docsFullMock = { /* mock data */ };

    it('calls TopLayoutBlog changeTitle function on click', async () => {
      const changeTitleSpy = jest.spyOn(page, 'changeTitle');
      const { getByText } = render(<Page docs={docsFullMock} />);
      expect(changeTitleSpy).not.toHaveBeenCalled();
      fireEvent.click(getByText('Click me!'));
      await waitFor(() => expect(changeTitleSpy).toHaveBeenCalledTimes(1));
    });

    it('calls TopLayoutBlog changeTitle function on input change', async () => {
      const changeTitleSpy = jest.spyOn(page, 'changeTitle');
      const { getByText } = render(<Page docs={docsFullMock} />);
      expect(changeTitleSpy).not.toHaveBeenCalled();
      fireEvent.change(getByText('Input field'), { target: { value: 'New title' } });
      await waitFor(() => expect(changeTitleSpy).toHaveBeenCalledTimes(1));
    });

    it('calls TopLayoutBlog changeTitle function on form submission', async () => {
      const changeTitleSpy = jest.spyOn(page, 'changeTitle');
      const { getByText, getByRole } = render(<Page docs={docsFullMock} />);
      expect(changeTitleSpy).not.toHaveBeenCalled();
      fireEvent.change(getByText('Input field'), { target: { value: 'New title' } });
      fireEvent.submit(getByRole('form'));
      await waitFor(() => expect(changeTitleSpy).toHaveBeenCalledTimes(1));
    });
  });

  // Add more tests as needed
});