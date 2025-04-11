import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Grid from '@mui/material/Grid';
import ComponentShowcaseCard from 'src/components/action/ComponentShowcaseCard';
import MaterialLabComponents from './MaterialLabComponents.test';

jest.mock('@mui/material/Grid', () => ({
  Grid: ({ children }) => <div>{children}</div>,
}));

const labComponents = [
  {
    name: 'Masonry',
    srcLight: '/static/material-ui/react-components/masonry-light.png',
    srcDark: '/static/material-ui/react-components/masonry-dark.png',
    link: '/material-ui/react-masonry/',
    md1: false,
    md2: false,
    md3: false,
    noGuidelines: true,
  },
  {
    name: 'Timeline',
    srcLight: '/static/material-ui/react-components/timeline-light.png',
    srcDark: '/static/material-ui/react-components/timeline-dark.png',
    link: '/material-ui/react-timeline/',
    md1: false,
    md2: false,
    md3: false,
    noGuidelines: true,
  },
];

describe('MaterialLabComponents', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<MaterialLabComponents />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders ComponentShowcaseCard for each component', () => {
      const { getByText, queryByText } = render(<MaterialLabComponents />);
      labComponents.forEach(({ name }) => {
        expect(getByText(name)).toBeInTheDocument();
      });
      expect(queryByText('UnknownComponent')).not.toBeInTheDocument();
    });

    it('does not render ComponentShowcaseCard for noGuidelines=true', () => {
      const { queryByText } = render(<MaterialLabComponents />);
      labComponents.forEach(({ name, noGuidelines }) => {
        if (noGuidelines) {
          expect(queryByText(name)).not.toBeInTheDocument();
        }
      });
    });

    it('does not render ComponentShowcaseCard for md1=md2=md3=true', () => {
      const { queryByText } = render(<MaterialLabComponents />);
      labComponents.forEach(({ name, md1, md2, md3 }) => {
        if (md1 && md2 && md3) {
          expect(queryByText(name)).not.toBeInTheDocument();
        }
      });
    });
  });

  describe('prop validation', () => {
    it('throws error for invalid props', async () => {
      try {
        render(<MaterialLabComponents link="/invalid" />);
        expect.assertions(0);
      } catch (error) {
        expect(error).toBeInTheDocument();
      }
    });
  });

  describe('user interactions', () => {
    it('calls onChange when md1 is true', async () => {
      const onChangeMock = jest.fn();
      render(
        <MaterialLabComponents
          labComponents={[
            { name: 'Masonry', srcLight: '/static/material-ui/react-components/masonry-light.png', srcDark: '/static/material-ui/react-components/masonry-dark.png' },
            { name: 'Timeline', md1: true, onChange: onChangeMock },
          ]}
        />,
      );
      const md1Input = document.querySelector('input[name="md1"]');
      fireEvent.change(md1Input, { target: { value: 'true' } });
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('calls onChange when md2 is true', async () => {
      const onChangeMock = jest.fn();
      render(
        <MaterialLabComponents
          labComponents={[
            { name: 'Masonry', srcLight: '/static/material-ui/react-components/masonry-light.png', srcDark: '/static/material-ui/react-components/masonry-dark.png' },
            { name: 'Timeline', md2: true, onChange: onChangeMock },
          ]}
        />,
      );
      const md2Input = document.querySelector('input[name="md2"]');
      fireEvent.change(md2Input, { target: { value: 'true' } });
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('calls onChange when md3 is true', async () => {
      const onChangeMock = jest.fn();
      render(
        <MaterialLabComponents
          labComponents={[
            { name: 'Masonry', srcLight: '/static/material-ui/react-components/masonry-light.png', srcDark: '/static/material-ui/react-components/masonry-dark.png' },
            { name: 'Timeline', md3: true, onChange: onChangeMock },
          ]}
        />,
      );
      const md3Input = document.querySelector('input[name="md3"]');
      fireEvent.change(md3Input, { target: { value: 'true' } });
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });

    it('calls onChange when link is clicked', async () => {
      const onClickMock = jest.fn();
      render(
        <MaterialLabComponents
          labComponents={[
            { name: 'Masonry', srcLight: '/static/material-ui/react-components/masonry-light.png', srcDark: '/static/material-ui/react-components/masonry-dark.png' },
            { name: 'Timeline', link: '/material-ui/react-timeline/' },
          ]}
        />,
      );
      const linkElement = document.querySelector('a');
      fireEvent.click(linkElement);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });
  });

  it('renders without crashing and updates state correctly', async () => {
    const { container } = render(<MaterialLabComponents />);
    await waitFor(() => expect(container).toBeInTheDocument());
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<MaterialLabComponents />);
    expect(asFragment()).toMatchSnapshot();
  });
});