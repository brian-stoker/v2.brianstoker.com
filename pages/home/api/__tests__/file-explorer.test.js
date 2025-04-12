import { render, fireEvent, waitFor } from '@testing-library/react';
import Page from './Page';
import { act } from 'react-dom/test-utils';
import * as React from 'react';
import ApiPage from 'src/modules/components/ApiPage';
import mapApiPageTranslations from 'src/modules/utils/mapApiPageTranslations';
import jsonPageContent from './file-explorer.json';

jest.mock('translations/api-docs/file-explorer/file-explorer', () => {
  return {
    default: () => ({ fileExplorer: {} }),
  };
});

describe('Page component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<Page />);
    expect(container).toBeTruthy();
  });

  describe('prop validation', () => {
    it('should validate descriptions prop correctly', async () => {
      await act(async () => {
        const { getByText } = render(<Page descriptions={[]} />);
        expect(getByText('Description')).toBeInTheDocument();
      });
    });

    it('should validate pageContent prop correctly', async () => {
      await act(async () => {
        const { getByText } = render(<Page pageContent={} />);
        expect(getByText('Page Content')).toBeInTheDocument();
      });
    });

    it('should not crash with invalid props', async () => {
      await act(async () => {
        const { getByText } = render(<Page descriptions={null} pageContent={null} />);
        expect(getByText('Error: Invalid prop')).toBeInTheDocument();
      });
    });
  });

  describe('conditional rendering', () => {
    it('should render ApiPage component with correct props', async () => {
      await act(async () => {
        const { getByText } = render(<Page descriptions={} pageContent={jsonPageContent} />);
        expect(getByText('File Explorer')).toBeInTheDocument();
      });
    });

    it('should not render anything with empty descriptions and page content', async () => {
      await act(async () => {
        const { queryByTitle } = render(<Page descriptions=[] pageContent={null} />);
        expect(queryByTitle).toBeNull();
      });
    });
  });

  describe('user interactions', () => {
    it('should trigger file explorer action on button click', async () => {
      await act(async () => {
        const { getByText } = render(<Page />);
        const button = getByText('File Explorer');
        fireEvent.click(button);
      });
      expect(getByText('File Explorer')).toBeInTheDocument();
    });

    it('should update page content with new text on input change', async () => {
      await act(async () => {
        const { getByPlaceholderText } = render(<Page />);
        const inputField = getByPlaceholderText('Enter new text');
        fireEvent.change(inputField, { target: { value: 'New Text' } });
      });
      expect(getByText('New Text')).toBeInTheDocument();
    });

    it('should trigger form submission on form submit', async () => {
      await act(async () => {
        const { getByTitle } = render(<Page />);
        const form = getByTitle('File Explorer Form');
        fireEvent.submit(form);
      });
      expect(getByText('File Explorer')).toBeInTheDocument();
    });
  });

  it('should snapshot the Page component with correct props', async () => {
    const wrapper = render(<Page descriptions={[]} pageContent={jsonPageContent} />);
    await act(async () => {
      expect(wrapper.asFragment()).toMatchSnapshot();
    });
  });
});