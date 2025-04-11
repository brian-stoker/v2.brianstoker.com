import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import InstallDesktopRoundedIcon from '@mui/icons-material/InstallDesktopRounded';
import WebRoundedIcon from '@mui/icons-material/WebRounded';
import DrawRoundedIcon from '@mui/icons-material/DrawRounded';
import PlayCircleFilledWhiteRoundedIcon from '@mui/icons-material/PlayCircleFilledWhiteRounded';
import DesignServicesRoundedIcon from '@mui/icons-material/DesignServicesRounded';
import { InfoCard } from '@stoked-ui/docs/InfoCard';
import MaterialStartingLinksCollection from './MaterialStartingLinksCollection';

const content = [
  {
    title: 'Installation',
    description: 'Add Stoked UI to your project with a few commands.',
    link: '/stoked-ui/docs/getting-started/installation/',
    icon: <InstallDesktopRoundedIcon color="primary" />,
  },
  {
    title: 'Usage',
    description: 'Learn the basics about the File Explorer components.',
    link: '/stoked-ui/docs/getting-started/usage/',
    icon: <DrawRoundedIcon color="primary" />,
  },
  {
    title: 'Example projects',
    description: 'A collection of boilerplates to jumpstart your next project.',
    link: '/stoked-ui/docs/getting-started/example-projects/',
    icon: <PlayCircleFilledWhiteRoundedIcon color="primary" />,
  },
  {
    title: 'Customizing components',
    description: 'Learn about the available customization methods.',
    link: '/stoked-ui/docs/getting-started/file-explorer-customization/',
    icon: <DesignServicesRoundedIcon color="primary" />,
  },
];

describe('MaterialStartingLinksCollection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<MaterialStartingLinksCollection />);
    expect(container).toBeInTheDocument();
  });

  it('renders content card correctly', async () => {
    const { getByText, getByRole } = render(<MaterialStartingLinksCollection />);
    await waitFor(() => expect(getByText('Installation')).toBeInTheDocument());
    expect(getByRole('img')).toBeInTheDocument();
  });

  it('renders all content cards', () => {
    const { getAllByRole } = render(<MaterialStartingLinksCollection />);
    const cards = getAllByRole('card');
    expect(cards.length).toBe(content.length);
  });

  describe('prop validation', () => {
    it('should validate link prop', async () => {
      const { getByText, getByRole } = render(
        <MaterialStartingLinksCollection link="/invalid" />
      );
      await waitFor(() => expect(getByText('/stoked-ui/docs/getting-started/installation/')).toBeInTheDocument());
    });

    it('should not validate link prop (valid)', async () => {
      const { getAllByRole } = render(<MaterialStartingLinksCollection />);
      const cards = getAllByRole('card');
      expect(cards[0].getAttribute('href')).toBe('/stoked-ui/docs/getting-started/installation/');
    });

    it('should not validate icon prop', async () => {
      const { getByText, getByRole } = render(
        <MaterialStartingLinksCollection icon={<InvalidIcon />} />
      );
      await waitFor(() => expect(getByText('Installation')).toBeInTheDocument());
    });
  });

  describe('user interactions', () => {
    it('should link to content page', async () => {
      const { getAllByRole, getByText } = render(<MaterialStartingLinksCollection />);
      const card1 = getAllByRole('card')[0];
      fireEvent.click(card1);
      await waitFor(() => expect(getByText('/stoked-ui/docs/getting-started/installation/')).toBeInTheDocument());
    });

    it('should display icon', async () => {
      const { getByRole, getAllByRole } = render(<MaterialStartingLinksCollection />);
      const card2 = getAllByRole('card')[1];
      fireEvent.click(card2);
      await waitFor(() => expect(getByRole('img')).toBeInTheDocument());
    });
  });

  describe('side effects', () => {
    it('should update link prop on user interaction', async () => {
      let linkProp = '/stoked-ui/docs/getting-started/installation/';
      const { getAllByRole, getByText } = render(<MaterialStartingLinksCollection />);
      const card1 = getAllByRole('card')[0];
      fireEvent.click(card1);
      await waitFor(() => expect(linkProp).toBe('/stoked-ui/docs/getting-started/installation/'));
    });
  });

  it('renders snapshot correctly', () => {
    const { asFragment } = render(<MaterialStartingLinksCollection />);
    expect(asFragment()).toMatchSnapshot();
  });
});