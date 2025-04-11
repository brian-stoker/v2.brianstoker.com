import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import GetStartedButtons from './GetStartedButtons';
import { Link as MockLink } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import { Link } from '@stoked-ui/docs/Link';
import NpmCopyButton from 'src/components/action/NpmCopyButton';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: MockLink,
}));

describe('GetStartedButtons component', () => {
  const defaultProps = {
    primaryLabel: 'Default Primary Label',
    primaryUrl: 'https://example.com',
    secondaryLabel: 'Secondary label',
    secondaryUrl: 'https://example2.com',
    installation: 'Installation link',
    altInstallation: 'Alt Installation link',
  };

  beforeEach(() => {
    global.console = { log: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = render(<GetStartedButtons {...defaultProps} />);
      expect(container).toBeTruthy();
    });

    it('renders primary label and button', async () => {
      const { getByRole, getByText } = render(<GetStartedButtons {...defaultProps} primaryLabel="Test" />);
      expect(getByText(defaultProps.primaryLabel)).toBeInTheDocument();
      expect(getByRole('button')).toBeInTheDocument();
    });

    it('renders secondary label and button', async () => {
      const { getByRole, getByText } = render(
        <GetStartedButtons {...defaultProps} secondaryLabel="Secondary Label" secondaryUrl="https://example2.com" />
      );
      expect(getByText(defaultProps.secondaryLabel)).toBeInTheDocument();
      expect(getByRole('button')).toBeInTheDocument();
    });

    it('renders installation link and alt installation button', async () => {
      const { getByRole, getByText } = render(<GetStartedButtons {...defaultProps} installation="Installation Link" altInstallation="Alt Installation Link" />);
      expect(getByText(defaultProps.installation)).toBeInTheDocument();
      expect(getByRole('button')).toBeInTheDocument();
    });

    it('renders snapshot correctly', async () => {
      const { asFragment, container } = render(<GetStartedButtons {...defaultProps} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Conditional rendering', () => {
    it('does not render installation link if no installation is provided', async () => {
      const { queryByRole, queryByText } = render(<GetStartedButtons {...defaultProps} installation={null} altInstallation="Alt Installation Link" />);
      expect(queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders alt installation button when alt installation is provided', async () => {
      const { getByRole, getByText } = render(<GetStartedButtons {...defaultProps} altInstallation="Alt Installation Link" />);
      expect(getByText(defaultProps.altInstallation)).toBeInTheDocument();
      expect(getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Prop validation', () => {
    it('throws an error when primary url is missing', () => {
      const { error } = render(<GetStartedButtons {...defaultProps} primaryLabel="Test" />);
      expect(error).toBeInstanceOf(ReactError);
    });

    it('does not throw an error when secondary label and url are provided', async () => {
      const { container } = render(
        <GetStartedButtons {...defaultProps} secondaryLabel="Secondary Label" secondaryUrl="https://example2.com" />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('User interactions', () => {
    it('calls handleCopy when primary button is clicked', async () => {
      const handleCopy = jest.fn();
      const { getByRole, getByText } = render(<GetStartedButtons {...defaultProps} primaryLabel="Test" handleCopy={handleCopy} />);
      fireEvent.click(getByRole('button'));
      expect(handleCopy).toHaveBeenCalledTimes(1);
    });

    it('copies installation link when copy button is clicked', async () => {
      const handleCopy = jest.fn();
      render(<GetStartedButtons {...defaultProps} installation="Installation Link" handleCopy={handleCopy} />);
      fireEvent.click(getByRole('button'));
      await waitFor(() => expect(handleCopy).toHaveBeenCalledTimes(1));
    });

    it('calls handleCopy when alt installation button is clicked', async () => {
      const handleCopy = jest.fn();
      render(<GetStartedButtons {...defaultProps} altInstallation="Alt Installation Link" handleCopy={handleCopy} />);
      fireEvent.click(getByRole('button'));
      expect(handleCopy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot testing', () => {
    it('renders snapshot correctly with props', async () => {
      const { asFragment, container } = render(<GetStartedButtons {...defaultProps} primaryLabel="Test" secondaryLabel="Secondary Label" />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});