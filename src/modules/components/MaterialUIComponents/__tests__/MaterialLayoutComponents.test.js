import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import MaterialLayoutComponents from './MaterialLayoutComponents';

jest.mock('@mui/material/Grid');
jest.mock('src/components/action/ComponentShowcaseCard');

const layoutComponents = [
  {
    name: 'Box',
    srcLight: '/static/material-ui/react-components/box-light.png',
    srcDark: '/static/material-ui/react-components/box-dark.png',
    link: '/material-ui/react-box/',
    md1: false,
    md2: false,
    md3: false,
    noGuidelines: true,
  },
  {
    name: 'Container',
    srcLight: '/static/material-ui/react-components/container-light.png',
    srcDark: '/static/material-ui/react-components/container-dark.png',
    link: '/material-ui/react-container/',
    md1: false,
    md2: false,
    md3: false,
    noGuidelines: true,
  },
  {
    name: 'Grid',
    srcLight: '/static/material-ui/react-components/grid-light.png',
    srcDark: '/static/material-ui/react-components/grid-dark.png',
    link: '/material-ui/react-grid/',
    md1: false,
    md2: false,
    md3: false,
    noGuidelines: true,
  },
  {
    name: 'Grid v2',
    srcLight: '/static/material-ui/react-components/grid-v2-light.png',
    srcDark: '/static/material-ui/react-components/grid-v2-dark.png',
    link: '/material-ui/react-grid2/',
    md1: false,
    md2: false,
    md3: false,
    noGuidelines: true,
  },
  {
    name: 'Stack',
    srcLight: '/static/material-ui/react-components/stack-light.png',
    srcDark: '/static/material-ui/react-components/stack-dark.png',
    link: '/material-ui/react-stack/',
    md1: false,
    md2: false,
    md3: false,
    noGuidelines: true,
  },
  {
    name: 'Image List',
    srcLight: '/static/material-ui/react-components/image-list-light.png',
    srcDark: '/static/material-ui/react-components/image-list-dark.png',
    link: '/material-ui/react-image-list/',
    md1: false,
    md2: true,
    md3: false,
    noGuidelines: false,
  },
];

describe('MaterialLayoutComponents', () => {
  beforeEach(() => {
    global.innerWidth = 1024;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<MaterialLayoutComponents />);
    expect(container).toBeTruthy();
  });

  it('renders all components', () => {
    const { getAllByRole } = render(<MaterialLayoutComponents />);
    const components = getAllByRole('gridcell');
    expect(components.length).toBe(9);
  });

  describe('prop validation', () => {
    it('should not accept invalid props', () => {
      const invalidProps = {
        link: 'invalid-link',
        name: 'Invalid Name',
        srcLight: '/static/invalid-material-ui/react-components/invalid-light.png',
        srcDark: '/static/invalid-material-ui/react-components/invalid-dark.png',
        md1: true,
        md2: false,
        md3: false,
        noGuidelines: false,
      };

      const { error } = render(<MaterialLayoutComponents {...invalidProps} />);
      expect(error).not.toBeNull();
    });

    it('should accept valid props', () => {
      const validProps = {
        link: '/material-ui/react-box/',
        name: 'Box',
        srcLight: '/static/material-ui/react-components/box-light.png',
        srcDark: '/static/material-ui/react-components/box-dark.png',
        md1: false,
        md2: false,
        md3: false,
        noGuidelines: true,
      };

      const { container } = render(<MaterialLayoutComponents {...validProps} />);
      expect(container).toBeTruthy();
    });
  });

  describe('component interactions', () => {
    it('should trigger link click event on component showcase card', () => {
      const onClickMock = jest.fn();
      const { getByText, getByRole } = render(
        <MaterialLayoutComponents
          link='/material-ui/react-box/'
          name='Box'
          srcLight='/static/material-ui/react-components/box-light.png'
          srcDark='/static/material-ui/react-components/box-dark.png'
          md1={false}
          md2={false}
          md3={false}
          noGuidelines={true}
        >
          <ComponentShowcaseCard onClick={onClickMock} />
        </MaterialLayoutComponents>,
      );

      const linkElement = getByRole('link');
      fireEvent.click(linkElement);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('should trigger image change event on component showcase card', () => {
      const onChangeMock = jest.fn();
      const { getByText, getByRole } = render(
        <MaterialLayoutComponents
          link='/material-ui/react-box/'
          name='Box'
          srcLight='/static/material-ui/react-components/box-light.png'
          srcDark='/static/material-ui/react-components/box-dark.png'
          md1={false}
          md2={false}
          md3={false}
          noGuidelines={true}
        >
          <ComponentShowcaseCard onChange={onChangeMock} />
        </MaterialLayoutComponents>,
      );

      const imageElement = getByRole('img');
      fireEvent.click(imageElement);
      expect(onChangeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('grid component', () => {
    it('should render grid with correct number of columns and rows', () => {
      global.innerWidth = 1024;
      const { getAllByRole } = render(<MaterialLayoutComponents />);
      const gridElements = getAllByRole('gridcell');
      expect(gridElements.length).toBe(9);
      expect(gridElements[0].getAttribute('colspan')).toBe('3');
      expect(gridElements[1].getAttribute('colspan')).toBe('2');
      expect(gridElements[6].getAttribute('colspan')).toBe('4');
    });

    it('should render grid with correct layout', () => {
      global.innerWidth = 1024;
      const { getAllByRole } = render(<MaterialLayoutComponents />);
      const gridElements = getAllByRole('gridcell');
      expect(gridElements[0].getAttribute('style')).not.toBeNull();
      expect(gridElements[1].getAttribute('style')).not.toBeNull();
      expect(gridElements[6].getAttribute('style')).not.toBeNull();
    });
  });
});