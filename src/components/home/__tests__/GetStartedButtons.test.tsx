import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import GetStartedButtons from './GetStartedButtons';
import { mockLinkComponentProps } from '../__mocks__/Link.test';
import { NpmCopyButtonMock } from '../__mocks__/NpmCopyButton.test';

describe('GetStartedButtons component', () => {
  let links, npmCopyButton;

  beforeEach(() => {
    links = render(
      <GetStartedButtons
        primaryLabel="Primary Button"
        primaryUrl="https://example.com/primary-link"
        primaryUrlTarget="_self"
        secondaryLabel="Secondary Button"
        secondaryUrl="https://example.com/secondary-link"
        secondaryUrlTarget="_blank"
        installation="https://example.com/installation-link"
      />
    );

    npmCopyButton = render(
      <NpmCopyButton installation="https://example.com/npm-installation" sx={{ mt: 2 }} />
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(links.container).toBeInTheDocument();
  });

  describe('Conditional Rendering', () => {
    it('renders primary button when installation link is present', () => {
      const { getByRole } = links;
      expect(getByRole('button').textContent).toBe('Primary Button');
    });

    it('renders secondary button when installation link is not present', () => {
      render(<GetStartedButtons primaryUrl="https://example.com/primary-link" />);
      const { getByText } = links;
      expect(getByText('Secondary Button')).toBeInTheDocument();
    });

    it('renders npm copy button when alt installation link is present', () => {
      render(
        <GetStartedButtons
          primaryLabel="Primary Button"
          primaryUrl="https://example.com/primary-link"
          primaryUrlTarget="_self"
          secondaryLabel="Secondary Button"
          secondaryUrl="https://example.com/secondary-link"
          secondaryUrlTarget="_blank"
          altInstallation="https://example.com/npm-installation"
        />
      );
      expect(npmCopyButton.container).toBeInTheDocument();
    });
  });

  describe('Prop Validation', () => {
    it('throws error when primary url is empty', () => {
      const { getByText } = render(
        <GetStartedButtons
          primaryLabel="Primary Button"
          primaryUrl=""
          secondaryLabel="Secondary Button"
          secondaryUrl="https://example.com/secondary-link"
        />
      );
      expect(getByText('primaryUrl cannot be empty')).toBeInTheDocument();
    });

    it('throws error when installation link is empty', () => {
      const { getByText } = render(
        <GetStartedButtons
          primaryLabel="Primary Button"
          primaryUrl="https://example.com/primary-link"
          secondaryLabel="Secondary Button"
          secondaryUrl=""
        />
      );
      expect(getByText('installation cannot be empty')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls handleCopy when copy button is clicked', async () => {
      const handleCopyMock = jest.fn();
      render(
        <GetStartedButtons
          primaryLabel="Primary Button"
          primaryUrl="https://example.com/primary-link"
          installation="https://example.com/installation-link"
          onCopy={handleCopyMock}
        />
      );
      const copyButton = links.getByRole('button', { name: 'Copy' });
      fireEvent.click(copyButton);
      expect(handleCopyMock).toHaveBeenCalledTimes(1);
    });

    it('calls handleCopy when npm copy button is clicked', async () => {
      const handleCopyMock = jest.fn();
      render(<NpmCopyButton installation="https://example.com/npm-installation" sx={{ mt: 2 }} />);
      const npmCopyButton = npmCopyButton.getByRole('button');
      fireEvent.click(npmCopyButton);
      expect(handleCopyMock).toHaveBeenCalledTimes(1);
    });

    it('submits form when primary button is clicked', async () => {
      const handleFormSubmitMock = jest.fn();
      render(
        <form onSubmit={handleFormSubmitMock}>
          <GetStartedButtons
            primaryLabel="Primary Button"
            primaryUrl="https://example.com/primary-link"
            installation="https://example.com/installation-link"
          />
        </form>
      );
      const primaryButton = links.getByRole('button', { name: 'Primary Button' });
      fireEvent.click(primaryButton);
      expect(handleFormSubmitMock).toHaveBeenCalledTimes(1);
    });

    it('submits form when secondary button is clicked', async () => {
      const handleFormSubmitMock = jest.fn();
      render(
        <form onSubmit={handleFormSubmitMock}>
          <GetStartedButtons
            primaryLabel="Primary Button"
            primaryUrl=""
            secondaryLabel="Secondary Button"
            installation="https://example.com/installation-link"
          />
        </form>
      );
      const secondaryButton = links.getByRole('button', { name: 'Secondary Button' });
      fireEvent.click(secondaryButton);
      expect(handleFormSubmitMock).toHaveBeenCalledTimes(1);
    });

    it('submits form when npm copy button is clicked', async () => {
      const handleFormSubmitMock = jest.fn();
      render(
        <form onSubmit={handleFormSubmitMock}>
          <NpmCopyButton installation="https://example.com/npm-installation" sx={{ mt: 2 }} />
        </form>
      );
      const npmCopyButton = npmCopyButton.getByRole('button');
      fireEvent.click(npmCopyButton);
      expect(handleFormSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  it('renders correctly after navigation to link', async () => {
    render(
      <GetStartedButtons
        primaryLabel="Primary Button"
        primaryUrl="https://example.com/primary-link"
        primaryUrlTarget="_self"
        secondaryLabel="Secondary Button"
        secondaryUrl="https://example.com/secondary-link"
        secondaryUrlTarget="_blank"
      />
    );
    render(<a href={links.getByRole('button').getAttribute('href')}>Navigate</a>);
    await waitFor(() => expect(links).toMatchSnapshot());
  });
});