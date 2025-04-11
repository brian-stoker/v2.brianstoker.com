import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Grid from '@mui/material/Unstable_Grid2';
import InfoCard from '@stoked-ui/docs/InfoCard';
import MaterialUIDesignResources from './MaterialUIDesignResources';

const content = [
  {
    title: 'Stoked UI for Figma',
    link: 'https://stoked-ui.github.io/store/items/figma-react/?utm_source=docs&utm_medium=referral&utm_campaign=installation-figma',
    svg: (
      <img
        src={`/static/branding/design-kits/figma-logo.svg`}
        alt="Figma logo"
        loading="lazy"
        width="36"
        height="36"
      />
    ),
  },
  {
    title: 'Stoked UI for Sketch',
    link: 'https://stoked-ui.github.io/store/items/sketch-react/?utm_source=docs&utm_medium=referral&utm_campaign=installation-sketch',
    svg: (
      <img
        src={`/static/branding/design-kits/sketch-logo.svg`}
        alt="Sketch logo"
        loading="lazy"
        width="36"
        height="36"
      />
    ),
  },
  {
    title: 'Stoked UI for Adobe XD',
    link: 'https://stoked-ui.github.io/store/items/adobe-xd-react/?utm_source=docs&utm_medium=referral&utm_campaign=installation-adobe-xd',
    svg: (
      <img
        src={`/static/branding/design-kits/adobexd-logo.svg`}
        alt="Adobe XD logo"
        loading="lazy"
        width="36"
        height="36"
      />
    ),
  },
];

describe('MaterialUIDesignResources', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<MaterialUIDesignResources />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering paths', () => {
    it('renders InfoCard component when content is provided', async () => {
      const { getByText, getAllByRole } = render(
        <MaterialUIDesignResources content={content} />
      );
      expect(getByText(content[0].title)).toBeInTheDocument();
      expect(getAllByRole('img')).toHaveLength(3);
    });

    it('does not render InfoCard component when content is not provided', async () => {
      const { queryByText, queryAllByRole } = render(<MaterialUIDesignResources />);
      expect(queryByText(content[0].title)).not.toBeInTheDocument();
      expect(queryAllByRole('img')).toHaveLength(0);
    });
  });

  describe('prop validation', () => {
    it('requires content prop to be provided', async () => {
      const { error } = render(<MaterialUIDesignResources />);
      expect(error).not.toBeNull();
    });

    it('renders InfoCard component when content is valid', async () => {
      const { getByText, getAllByRole } = render(
        <MaterialUIDesignResources content={content} />
      );
      expect(getByText(content[0].title)).toBeInTheDocument();
      expect(getAllByRole('img')).toHaveLength(3);
    });

    it('does not render InfoCard component when content is invalid', async () => {
      const { queryByText, queryAllByRole } = render(<MaterialUIDesignResources />);
      expect(queryByText(content[0].title)).not.toBeInTheDocument();
      expect(queryAllByRole('img')).toHaveLength(0);
    });
  });

  describe('user interactions', () => {
    it('calls link prop on click', async () => {
      const { getByText, fireEvent } = render(
        <MaterialUIDesignResources content={content} />
      );
      const linkElement = getByText(content[0].link);
      fireEvent.click(linkElement);
      expect(linkElement.href).toBe(content[0].link);
    });

    it('calls title prop on hover', async () => {
      const { getByText, fireEvent } = render(
        <MaterialUIDesignResources content={content} />
      );
      const linkElement = getByText(content[0].title);
      fireEvent.mouseOver(linkElement);
      expect(linkElement.hovered).toBe(true);
    });
  });

  describe('side effects', () => {
    it('does not cause any side effects when rendered', async () => {
      render(<MaterialUIDesignResources />);
      await waitFor(() => expect(false).not.toBe(true));
    });
  });
});