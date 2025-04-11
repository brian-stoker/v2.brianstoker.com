import { render, fireEvent, waitFor } from '@testing-library/react';
import { Routes } from './routes';

describe('Routes', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    // setup any mocks or stubs here
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders without crashing', async () => {
      const { container } = render(<Routes />);
      expect(container).toBeTruthy();
    });
  });

  describe('conditional rendering', () => {
    it('renders art route when art prop is true', async () => {
      global.fetch.mockImplementation(() => Promise.resolve({ status: 200 }));
      const { getByText } = render(<Routes routes={{ ["/art"]: "/art" }} />);
      expect(getByText('/art')).toBeInTheDocument();
    });

    it('does not render art route when art prop is false', async () => {
      global.fetch.mockImplementation(() => Promise.resolve({ status: 200 }));
      const { queryByText } = render(<Routes routes={{ ["/art"]: "/art" }} />);
      expect(queryByText('/art')).not.toBeInTheDocument();
    });

    it('renders photography route when photography prop is true', async () => {
      global.fetch.mockImplementation(() => Promise.resolve({ status: 200 }));
      const { getByText } = render(<Routes routes={{ ["/photography"]: "/photography" }} />);
      expect(getByText('/photography')).toBeInTheDocument();
    });

    it('does not render photography route when photography prop is false', async () => {
      global.fetch.mockImplementation(() => Promise.resolve({ status: 200 }));
      const { queryByText } = render(<Routes routes={{ ["/photography"]: "/photography" }} />);
      expect(queryByText('/photography')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws error when invalid prop is passed', async () => {
      global.fetch.mockImplementation(() => Promise.resolve({ status: 200 }));
      await expect(render(<Routes routes={{ ["/invalid"] }: Routes })).rejects.toThrowError();
    });

    it('does not throw error when valid prop is passed', async () => {
      global.fetch.mockImplementation(() => Promise.resolve({ status: 200 }));
      render(<Routes routes={{ ["/valid"] }: Routes />);
    });
  });

  describe('user interactions', () => {
    it('navigates to art route when navigation link is clicked', async () => {
      global.fetch.mockImplementation(() => Promise.resolve({ status: 200 }));
      const { getByText } = render(<Routes routes={{ ["/art"]: "/art" }} />);
      const navLink = getByText('/art');
      fireEvent.click(navLink);
      expect(window.location.href).toBe('/art');
    });

    it('navigates to photography route when navigation link is clicked', async () => {
      global.fetch.mockImplementation(() => Promise.resolve({ status: 200 }));
      const { getByText } = render(<Routes routes={{ ["/photography"]: "/photography" }} />);
      const navLink = getByText('/photography');
      fireEvent.click(navLink);
      expect(window.location.href).toBe('/photography');
    });
  });

  describe('async rendering', () => {
    it('renders data grid overview route after async load', async () => {
      global.fetch.mockImplementation(() => Promise.resolve({ status: 200 }));
      render(<Routes routes={{ ["/x/react-data-grid"]: "/x/react-data-grid" }} />);
      await waitFor(() => expect(document.querySelector('.data-grid-overview')).toBeInTheDocument());
    });
  });

  describe('fetching data', () => {
    it('fetches data for each route when rendered', async () => {
      global.fetch.mockImplementation((url) => new Promise((resolve) => setTimeout(() => resolve({ status: 200 }), 100)));
      render(<Routes routes={Routes} />);
      expect(global.fetch).toHaveBeenCalledTimes(Routes.length);
    });
  });
});