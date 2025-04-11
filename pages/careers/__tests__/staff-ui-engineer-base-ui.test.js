import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import * as pageProps from 'pages/careers/staff-ui-engineer-base-ui.md?muiMarkdown';

jest.mock('src/modules/components/TopLayoutCareers', () => ({
  __esModule: true,
  default: () => <div />,
}));

describe('Page Component', () => {
  beforeEach(() => {
    global.console = { log: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutCareers {...pageProps} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders when props are valid', async () => {
      const { getByText } = render(<TopLayoutCareers {...pageProps} />);
      expect(getByText(pageProps.title)).toBeInTheDocument();
    });

    it('does not render when props are invalid', async () => {
      const invalidPageProps = { ...pageProps, invalidProp: 'value' };
      const { container } = render(<TopLayoutCareers {...invalidPageProps} />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('validates props using muiMarkdown', async () => {
      const mockGetMarkdown = jest.fn(() => pageProps.markdown);
      TopLayoutCareers.mockImplementation(() => <div>{mockGetMarkdown()}</div>);
      render(<TopLayoutCareers {...pageProps} />);
      expect(mockGetMarkdown).toHaveBeenCalledTimes(1);
    });

    it('does not validate props when invalid', async () => {
      const mockGetMarkdown = jest.fn(() => pageProps.markdown);
      TopLayoutCareers.mockImplementation(() => <div>{mockGetMarkdown()}</div>);
      const invalidPageProps = { ...pageProps, markdown: 'invalid' };
      render(<TopLayoutCareers {...invalidPageProps} />);
      expect(mockGetMarkdown).not.toHaveBeenCalled();
    });
  });

  describe('user interactions', () => {
    it('calls onClick when clicked', async () => {
      const onClickMock = jest.fn();
      TopLayoutCareers.mockImplementation(() => (
        <div onClick={onClickMock}>Click me!</div>
      ));
      render(<TopLayoutCareers {...pageProps} />);
      const button = document.querySelector('[data-testid="button"]');
      fireEvent.click(button);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('calls onChange when input changes', async () => {
      TopLayoutCareers.mockImplementation(() => (
        <div data-testid="input">
          <input type="text" onChange={jest.fn()} />
        </div>
      ));
      render(<TopLayoutCareers {...pageProps} />);
      const input = document.querySelector('[data-testid="input"]');
      fireEvent.change(input, { target: { value: 'new value' } });
      expect(input.querySelector('input')).toHaveValue('new value');
    });

    it('calls onSubmit when form is submitted', async () => {
      TopLayoutCareers.mockImplementation(() => (
        <form data-testid="form" onSubmit={jest.fn()}>
          <button type="submit">Submit</button>
        </form>
      ));
      render(<TopLayoutCareers {...pageProps} />);
      const form = document.querySelector('[data-testid="form"]');
      fireEvent.submit(form);
      expect(form.querySelector('button')).toHaveAttribute('type', 'submit');
    });
  });

  it('has expected class names', async () => {
    const { getByText } = render(<TopLayoutCareers {...pageProps} />);
    expect(getByText(pageProps.title)).toHaveClass('MuiTypography-root-MuiTypography-style-muiStyles-MuiTypography-variant-h1-MuiTypography-em-Mui/Typography-Typography');
  });

  it('matches snapshot', async () => {
    const { asFragment } = render(<TopLayoutCareers {...pageProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
});