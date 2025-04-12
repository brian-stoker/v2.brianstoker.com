import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import * as pageProps from 'pages/careers/accessibility-engineer.md?muiMarkdown';

jest.mock('src/modules/components/TopLayoutCareers', () => {
  return {
    TopLayoutCareers: ({
      children,
      // ... other props
    }) => {
      return <div>{children}</div>;
    },
  };
});

describe('Page component', () => {
  const { pageProps: initialProps } = pageProps;

  beforeEach(() => {
    global.fetch.mockClear();
  });

  afterEach(() => {
    global.fetch.mockReset();
  });

  describe('rendering without crashing', () => {
    it('should render without crashing', async () => {
      const { container } = render(<Page />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('should render children when provided', async () => {
      const { container, getByText } = render(
        <Page pageProps={{ careers: ['engineer'] }}>
          <div>Careers title</div>
        </Page>,
      );
      expect(getByText('Careers title')).toBeInTheDocument();
    });

    it('should not render children when not provided', async () => {
      const { container } = render(<Page />);
      expect(container).not.toContainElement(/Careers title/);
    });
  });

  describe('prop validation', () => {
    it('should validate props correctly', async () => {
      const { getByText, getByRole } = render(
        <Page pageProps={{ careers: ['engineer'] }}>
          <div>Careers title</div>
        </Page>,
      );
      expect(getByText('Careers title')).toBeInTheDocument();
      expect(getByRole('listitem')).toBeInTheDocument();
    });

    it('should not validate props correctly', async () => {
      const { getByText } = render(<Page pageProps={{ invalid: 'prop' }} />);
      expect(getByText('invalid prop')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should handle clicks on children', async () => {
      const { container, getByRole } = render(
        <Page pageProps={{ careers: ['engineer'] }}>
          <div onClick={() => console.log('Click!')}>
            Careers title
          </div>
        </Page>,
      );
      const element = getByRole('listitem');
      fireEvent.click(element);
      expect(console.log).toHaveBeenCalledTimes(1);
    });

    it('should handle input changes', async () => {
      const { container, getByPlaceholderText } = render(
        <Page pageProps={{ careers: ['engineer'] }}>
          <input type="text" placeholder="Search..." />
        </Page>,
      );
      const element = getByPlaceholderText('');
      fireEvent.change(element, { target: { value: 'test' } });
      expect(getByRole('listitem')).toHaveValue('test');
    });

    it('should handle form submission', async () => {
      const { container, getByPlaceholderText } = render(
        <Page pageProps={{ careers: ['engineer'] }}>
          <form onSubmit={() => console.log('Form submitted!')}>
            <input type="text" placeholder="Search..." />
            <button type="submit">Search</button>
          </form>
        </Page>,
      );
      const element = getByPlaceholderText('');
      fireEvent.change(element, { target: { value: 'test' } });
      fireEvent.submit(element.parent);
      expect(console.log).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('should handle side effect when provided', async () => {
      const { getByRole } = render(
        <Page pageProps={{ careers: ['engineer'] }}>
          <div onClick={() => console.log('Side effect!')}>
            Careers title
          </div>
        </Page>,
      );
      const element = getByRole('listitem');
      fireEvent.click(element);
      await waitFor(() => expect(console.log).toHaveBeenCalledTimes(1));
    });
  });

  describe('snapshots', () => {
    it('should render with correct snapshot', async () => {
      const { asFragment } = render(<Page />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});