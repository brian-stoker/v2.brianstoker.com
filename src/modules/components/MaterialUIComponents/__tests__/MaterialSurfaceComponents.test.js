import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import Grid from '@mui/material/Grid';
import ComponentShowcaseCard from 'src/components/action/ComponentShowcaseCard';

describe('MaterialSurfaceComponents', () => {
  const surfaceComponents = [
    {
      name: 'Accordion',
      srcLight: '/static/material-ui/react-components/accordion-light.png',
      srcDark: '/static/material-ui/react-components/accordion-dark.png',
      link: '/material-ui/react-accordion/',
      md1: true,
      md2: false,
      md3: false,
      noGuidelines: false,
    },
    {
      name: 'App Bar',
      srcLight: '/static/material-ui/react-components/appbar-light.png',
      srcDark: '/static/material-ui/react-components/appbar-dark.png',
      link: '/material-ui/react-app-bar/',
      md1: false,
      md2: true,
      md3: false,
      noGuidelines: false,
    },
    {
      name: 'Card',
      srcLight: '/static/material-ui/react-components/card-light.png',
      srcDark: '/static/material-ui/react-components/card-dark.png',
      link: '/material-ui/react-card/',
      md1: false,
      md2: true,
      md3: false,
      noGuidelines: false,
    },
    {
      name: 'Paper',
      srcLight: '/static/material-ui/react-components/paper-light.png',
      srcDark: '/static/material-ui/react-components/paper-dark.png',
      link: '/material-ui/react-paper/',
      md1: false,
      md2: true,
      md3: false,
      noGuidelines: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<MaterialSurfaceComponents />);
    expect(container).toBeInTheDocument();
  });

  describe('Conditional Rendering', () => {
    it('renders ComponentShowcaseCard for each surface component', () => {
      const { queryByRole, getByText, getAllByRole } = render(<MaterialSurfaceComponents />);
      const cards = getAllByRole('card');
      expect(cards.length).toBe(surfaceComponents.length);
      cards.forEach((card) => {
        expect(getByText(card.name)).toBeInTheDocument();
      });
    });

    it('does not render ComponentShowcaseCard for no guidelines surface component', () => {
      const { queryByRole, getByText } = render(<MaterialSurfaceComponents />);
      const card = queryByRole('card');
      expect(card).not.toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('renders with valid props', () => {
      const { container } = render(<MaterialSurfaceComponents />);
      expect(container).toBeInTheDocument();
    });

    it('does not render for invalid props (missing name property)', () => {
      const surfaceComponent = {
        link: '/material-ui/react-accordion/',
        srcLight: '/static/material-ui/react-components/accordion-light.png',
        srcDark: '/static/material-ui/react-components/accordion-dark.png',
        md1: true,
        md2: false,
        md3: false,
        noGuidelines: false,
      };

      const { queryByRole } = render(<ComponentShowcaseCard {...surfaceComponent} />);
      expect(queryByRole('card')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('renders ComponentShowcaseCard when link is clicked', () => {
      const { getByText, click } = render(<MaterialSurfaceComponents />);
      const card = getByText(surfaceComponents[0].name);
      expect(card).toBeInTheDocument();

      click(card);

      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('renders ComponentShowcaseCard when md1 is true', () => {
      const { getByText } = render(<MaterialSurfaceComponents />);
      const card = getByText(surfaceComponents[0].name);
      expect(card).toBeInTheDocument();

      // Assuming md1 is a prop that affects the rendering of md1
      expect(card).toHaveStyle('md1');
    });

    it('renders ComponentShowcaseCard when md2 is true', () => {
      const { getByText } = render(<MaterialSurfaceComponents />);
      const card = getByText(surfaceComponents[0].name);
      expect(card).toBeInTheDocument();

      // Assuming md2 is a prop that affects the rendering of md2
      expect(card).toHaveStyle('md2');
    });
  });

  describe('Side Effects', () => {
    it('renders ComponentShowcaseCard with correct styles', () => {
      const { container } = render(<MaterialSurfaceComponents />);
      const card = container.querySelector('component-showcase-card');
      expect(card).toHaveStyle({
        '--md1': surfaceComponents[0].md1,
        '--md2': surfaceComponents[0].md2,
      });
    });
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<MaterialSurfaceComponents />);
    expect(asFragment()).toMatchSnapshot();
  });
});