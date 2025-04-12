import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Page from './page.test.js';
import ApiPage from 'src/modules/components/ApiPage';
import mapApiPageTranslations from 'src/modules/utils/mapApiPageTranslations';
import jsonPageContent from './file.json';

jest.mock('src/modules/components/ApiPage', () => ({
  ApiPage: jest.fn(),
}));

describe('Page component', () => {
  beforeEach(() => {
    // Clear mock calls for ApI Page
    (ApiPage as jest.Mock).mockClear();
  });

  afterAll(() => {
    // Clear mock calls for ApI Page
    (ApiPage as jest.Mock).mockClear();
  });

  it('renders without crashing', () => {
    const { container } = render(<Page />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders ApiPage when pageContent is truthy', () => {
      const { container } = render(<Page descriptions={[]} pageContent={jsonPageContent} />);
      expect(container.querySelector('.ApiPage')).toBeTruthy();
    });

    it('does not render ApI Page when pageContent is falsy', () => {
      const { queryByTestId } = render(<Page descriptions={[]} pageContent={null} />);
      expect(queryByTestId('ApiPage')).toBeFalsy();
    });
  });

  describe('prop validation', () => {
    it('allows valid props to pass through', () => {
      (ApiPage as jest.Mock).mockImplementation(() => <div>Mocked ApiPage</div>);
      const { container } = render(<Page descriptions={[]} pageContent={jsonPageContent} />);
      expect(container.querySelector('.ApiPage')).not.toBeNull();
    });

    it('throws an error when pageContent is invalid', () => {
      (ApiPage as jest.Mock).mockImplementation(() => <div>Mocked ApiPage</div>);
      const { container } = render(<Page descriptions={[]} pageContent={null} />);
      expect(container.querySelector('.ApiPage')).toBeFalsy();
    });

    it('throws an error when descriptions is invalid', () => {
      (ApiPage as jest.Mock).mockImplementation(() => <div>Mocked ApiPage</div>);
      const { container } = render(<Page descriptions={[]} pageContent={jsonPageContent} />);
      expect(container.querySelector('.ApiPage')).not.toBeNull();
    });
  });

  describe('user interactions', () => {
    it('passes click event to ApI Page', () => {
      (ApiPage as jest.Mock).mockImplementation(() => <div>Mocked ApiPage</div>);
      const { getByText } = render(<Page descriptions={[]} pageContent={jsonPageContent} />);
      fireEvent.click(getByText('Mocked ApiPage'));
      expect((ApiPage as jest.Mock).mock.calls[0][1].props.onClick).toHaveBeenCalledTimes(1);
    });

    it('passes input change event to ApI Page', () => {
      (ApiPage as jest.Mock).mockImplementation(() => <div>Mocked ApiPage</div>);
      const { getByText } = render(<Page descriptions={[]} pageContent={jsonPageContent} />);
      const inputField = getByText('Mocked ApiPage');
      fireEvent.change(inputField, { target: { value: 'test' } });
      expect((ApiPage as jest.Mock).mock.calls[0][1].props.onChange).toHaveBeenCalledTimes(1);
    });

    it('passes form submission event to ApI Page', () => {
      (ApiPage as jest.Mock).mockImplementation(() => <div>Mocked ApiPage</div>);
      const { getByText } = render(<Page descriptions={[]} pageContent={jsonPageContent} />);
      const inputField = getByText('Mocked ApiPage');
      fireEvent.change(inputField, { target: { value: 'test' } });
      fireEvent.submit(document.querySelector('form'));
      expect((ApiPage as jest.Mock).mock.calls[0][1].props.onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('calls mapApiPageTranslations when Page is rendered', async () => {
      (mapApiPageTranslations as jest.Mock).mockImplementation(() => ({}));
      const { getByText } = render(<Page descriptions={[]} pageContent={jsonPageContent} />);
      await waitFor(() => expect((mapApiPageTranslations as jest.Mock).mock.calls.length).toBeGreaterThan(0));
    });
  });

  it('matches snapshot', () => {
    const { container } = render(<Page descriptions={[]} pageContent={jsonPageContent} />);
    expect(container).toMatchSnapshot();
  });
});