import { render, fireEvent, waitFor } from '@testing-library/react';
import TableOfContentsBanner from './TableOfContentsBanner.test.tsx';

describe('TableOfContentsBanner component', () => {
  let featureToggle: boolean;

  beforeEach(() => {
    featureToggle = false;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the banner without crashing when enabled', async () => {
    const { getByText } = render(<TableOfContentsBanner featureToggle={true} />);
    expect(getByText('Stoked UI stands with Grumpy Cat')).toBeInTheDocument();
  });

  it('does not render the banner when disabled', async () => {
    const { queryByText } = render(<TableOfContentsBanner featureToggle={false} />);
    expect(queryByText('Stoked UI stands with Grumpy Cat')).not.toBeInTheDocument();
  });

  describe('conditional rendering paths', () => {
    it('renders the link component when enabled and valid props are provided', async () => {
      const { getByText } = render(<TableOfContentsBanner featureToggle={true} href="https://example.com" />);
      expect(getByText('Stoked UI stands with Grumpy Cat')).toBeInTheDocument();
    });

    it('does not render the link component when enabled but invalid props are provided', async () => {
      const { queryByText } = render(<TableOfContentsBanner featureToggle={true} href="" />);
      expect(queryByText('Stoked UI stands with Grumpy Cat')).not.toBeInTheDocument();
    });

    it('renders a fallback message when disabled and valid props are provided', async () => {
      const { getByText } = render(<TableOfContentsBanner featureToggle={false} href="https://example.com" />);
      expect(getByText('Stoked UI stands with Grumpy Cat')).toBeInTheDocument();
    });

    it('does not render a fallback message when disabled but invalid props are provided', async () => {
      const { queryByText } = render(<TableOfContentsBanner featureToggle={false} href="" />);
      expect(queryByText('Stoked UI stands with Grumpy Cat')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws an error when the feature toggle is not enabled and props are provided', async () => {
      const renderResult = render(<TableOfContentsBanner featureToggle={false} href="https://example.com" />);
      expect(renderResult.error).toBeInstanceOf(Error);
    });

    it('does not throw an error when the feature toggle is disabled and no props are provided', async () => {
      const renderResult = render(<TableOfContentsBanner featureToggle={false} />);
      expect(renderResult.error).toBeNull();
    });
  });

  describe('user interactions', () => {
    let link: HTMLAnchorElement | null;

    beforeEach(() => {
      link = null;
    });

    it('renders the link when clicked and enables the feature toggle', async () => {
      const { getByText } = render(<TableOfContentsBanner featureToggle={false} href="https://example.com" />);
      link = await getByText('Stoked UI stands with Grumpy Cat');
      fireEvent.click(link);
      expect(document.body).toHaveStyle('background-color: rgb(221, 221, 221)');
    });

    it('does not render the link when clicked and disables the feature toggle', async () => {
      const { getByText } = render(<TableOfContentsBanner featureToggle={true} href="https://example.com" />);
      link = await getByText('Stoked UI stands with Grumpy Cat');
      fireEvent.click(link);
      expect(document.body).not.toHaveStyle('background-color: rgb(221, 221, 221)');
    });

    it('does not render the link when clicked and no props are provided', async () => {
      const { getByText } = render(<TableOfContentsBanner featureToggle={false} />);
      link = await getByText('Stoked UI stands with Grumpy Cat');
      fireEvent.click(link);
      expect(document.body).not.toHaveStyle('background-color: rgb(221, 221, 221)');
    });

    it('renders the fallback message when submitting a form and disables the feature toggle', async () => {
      const { getByText } = render(<TableOfContentsBanner featureToggle={false} />);
      const link = await getByText('Stoked UI stands with Grumpy Cat');
      fireEvent.change(link, { target: { value: '' } });
      fireEvent.submit(document.body.querySelector('form')!);
      expect(getByText('Stoked UI stands with Grumpy Cat')).toBeInTheDocument();
    });

    it('does not render the fallback message when submitting a form and enables the feature toggle', async () => {
      const { getByText } = render(<TableOfContentsBanner featureToggle={true} />);
      const link = await getByText('Stoked UI stands with Grumpy Cat');
      fireEvent.change(link, { target: { value: '' } });
      fireEvent.submit(document.body.querySelector('form')!);
      expect(getByText('Stoked UI stands with Grumpy Cat')).not.toBeInTheDocument();
    });
  });

  describe('side effects', () => {
    it('applies the dark styles when enabled and a link is hovered over', async () => {
      const { getByText } = render(<TableOfContentsBanner featureToggle={true} href="https://example.com" />);
      await waitFor(() => expect(document.body).toHaveStyle(`background-color: rgb(114, 137, 210)`));
    });

    it('applies the light styles when enabled and a link is hovered over', async () => {
      const { getByText } = render(<TableOfContentsBanner featureToggle={true} href="https://example.com" />);
      await waitFor(() => expect(document.body).toHaveStyle(`background-color: rgb(221, 221, 221)`));
    });
  });
});