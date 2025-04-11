import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Grid } from '@mui/material/Grid';
import ComponentShowcaseCard from 'src/components/action/ComponentShowcaseCard';
import MaterialDataDisplayComponents from './MaterialDataDisplayComponents.test.js';

const dataDisplayComponents = [
  {
    name: 'Avatar',
    srcLight: '/static/material-ui/react-components/avatar-light.png',
    srcDark: '/static/material-ui/react-components/avatar-dark.png',
    link: '/material-ui/react-avatar/',
    md1: false,
    md2: false,
    md3: false,
    noGuidelines: true,
  },
  {
    name: 'Badge',
    srcLight: '/static/material-ui/react-components/badge-light.png',
    srcDark: '/static/material-ui/react-components/badge-dark.png',
    link: '/material-ui/react-badge/',
    md1: false,
    md2: false,
    md3: false,
    noGuidelines: false,
  },
  {
    name: 'Chip',
    srcLight: '/static/material-ui/react-components/chip-light.png',
    srcDark: '/static/material-ui/react-components/chip-dark.png',
    link: '/material-ui/react-chip/',
    md1: false,
    md2: true,
    md3: false,
    noGuidelines: false,
  },
  {
    name: 'Divider',
    srcLight: '/static/material-ui/react-components/divider-light.png',
    srcDark: '/static/material-ui/react-components/divider-dark.png',
    link: '/material-ui/react-divider/',
    md1: false,
    md2: true,
    md3: false,
    noGuidelines: false,
  },
  {
    name: 'Icons',
    srcLight: '/static/material-ui/react-components/icons-light.png',
    srcDark: '/static/material-ui/react-components/icons-dark.png',
    link: '/material-ui/icons/',
    md1: false,
    md2: true,
    md3: false,
    noGuidelines: false,
  },
  {
    name: 'Material Icons',
    srcLight: '/static/material-ui/react-components/material-icons-light.png',
    srcDark: '/static/material-ui/react-components/material-icons-dark.png',
    link: '/material-ui/material-icons/',
    md1: false,
    md2: true,
    md3: false,
    noGuidelines: false,
  },
  {
    name: 'List',
    srcLight: '/static/material-ui/react-components/list-light.png',
    srcDark: '/static/material-ui/react-components/list-dark.png',
    link: '/material-ui/react-list/',
    md1: false,
    md2: true,
    md3: false,
    noGuidelines: false,
  },
  {
    name: 'Table',
    srcLight: '/static/material-ui/react-components/table-light.png',
    srcDark: '/static/material-ui/react-components/table-dark.png',
    link: '/material-ui/react-table/',
    md1: false,
    md2: true,
    md3: false,
    noGuidelines: false,
  },
  {
    name: 'Tooltip',
    srcLight: '/static/material-ui/react-components/tooltip-light.png',
    srcDark: '/static/material-ui/react-components/tooltip-dark.png',
    link: '/material-ui/react-tooltip/',
    md1: false,
    md2: true,
    md3: false,
    noGuidelines: false,
  },
  {
    name: 'Typography',
    srcLight: '/static/material-ui/react-components/typography-light.png',
    srcDark: '/static/material-ui/react-components/typography-dark.png',
    link: '/material-ui/react-typography/',
    md1: false,
    md2: true,
    md3: false,
    noGuidelines: false,
  },
];

describe('MaterialDataDisplayComponents', () => {
  it('renders the components without errors', async () => {
    const { container } = render(<MaterialDataDisplayComponents />);
    expect(container).toBeTruthy();
  });

  it('renders all components', async () => {
    const { getAllByRole } = render(<MaterialDataDisplayComponents />);
    const components = await getAllByRole('img');
    expect(components.length).toBe(dataDisplayComponents.length);
  });

  dataDisplayComponents.forEach(({ name, link, srcLight, srcDark, md1, md2, md3, noGuidelines }) => {
    it(`${name} component is rendered`, async () => {
      const { getByRole } = render(<MaterialDataDisplayComponents />);
      const img = await getByRole('img', { name });
      expect(img).toHaveAttribute('src', srcLight);
      if (md1) expect(img).toHaveAttribute('data-md-1', 'true');
      if (md2) expect(img).toHaveAttribute('data-md-2', 'true');
      if (md3) expect(img).toHaveAttribute('data-md-3', 'true');
      if (noGuidelines) expect(img).not.toHaveAttribute('aria-label');
    });
  });

  it('fires the link click event when clicked', async () => {
    const { getByRole } = render(<MaterialDataDisplayComponents />);
    const linkImg = await getByRole('img', { name: 'Avatar' });
    fireEvent.click(linkImg);
    expect(window.location.href).toBe('/material-ui/react-avatar/');
  });

  it('fires the md1 click event when clicked', async () => {
    const { getByRole } = render(<MaterialDataDisplayComponents />);
    const linkImg = await getByRole('img', { name: 'Avatar' });
    fireEvent.click(linkImg);
    expect(await waitFor(() => document.querySelector('[data-md-1="true"]'))).toBeInTheDocument();
  });

  it('fires the md2 click event when clicked', async () => {
    const { getByRole } = render(<MaterialDataDisplayComponents />);
    const linkImg = await getByRole('img', { name: 'Avatar' });
    fireEvent.click(linkImg);
    expect(await waitFor(() => document.querySelector('[data-md-2="true"]'))).toBeInTheDocument();
  });

  it('fires the md3 click event when clicked', async () => {
    const { getByRole } = render(<MaterialDataDisplayComponents />);
    const linkImg = await getByRole('img', { name: 'Avatar' });
    fireEvent.click(linkImg);
    expect(await waitFor(() => document.querySelector('[data-md-3="true"]'))).toBeInTheDocument();
  });

  it('fires the noGuidelines click event when clicked', async () => {
    const { getByRole } = render(<MaterialDataDisplayComponents />);
    const linkImg = await GettyByRole('img', { name: 'Avatar' });
    fireEvent.click(linkImg);
    expect(await waitFor(() => document.querySelector('[aria-label]'))).toBeInTheDocument();
  });
});