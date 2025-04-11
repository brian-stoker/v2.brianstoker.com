import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MaterialInputComponents from './MaterialInputComponents.test.js';

describe('Material Input Components', () => {
  const gridItemProps = (props) => ({
    xs: 12,
    sm: props.sm ? props.sm : 4,
    sx: { flexGrow: 1 },
    key: props.name,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<MaterialInputComponents />);
  });

  it('renders all components in the grid', async () => {
    const { getAllByRole } = render(<MaterialInputComponents />);

    expect(getAllByRole('img')).toHaveLength(20);
  });

  describe('Grid Item Component', () => {
    const gridItemPropsMock = (props) => ({
      ...gridItemProps(props),
      sm: props.sm,
    });

    it('renders with correct classes and styles', async () => {
      const { getByRole } = render(
        <MaterialInputComponents
          inputComponents={[
            {
              name: 'Component Name',
              link: '/material-ui/component-link/',
              srcLight: '/static/material-ui/react-components/component-light.png',
              srcDark: '/static/material-ui/react-components/component-dark.png',
              md1: false,
              md2: true,
              md3: false,
              noGuidelines: false,
            },
          ]}
        >
          {gridItemPropsMock}
        </MaterialInputComponents>
      );

      const component = getByRole('img');
      expect(component).toHaveAttribute('src', '/static/material-ui/react-components/component-light.png');
    });
  });

  describe('ComponentShowcaseCard Component', () => {
    const gridItemPropsMock = (props) => ({
      ...gridItemProps(props),
      sm: props.sm,
    });

    it('renders with correct classes and styles', async () => {
      const { getByRole } = render(
        <MaterialInputComponents
          inputComponents={[
            {
              name: 'Component Name',
              link: '/material-ui/component-link/',
              srcLight: '/static/material-ui/react-components/component-light.png',
              srcDark: '/static/material-ui/react-components/component-dark.png',
              md1: false,
              md2: true,
              md3: false,
              noGuidelines: false,
            },
          ]}
        >
          {gridItemPropsMock}
        </MaterialInputComponents>
      );

      const component = getByRole('img');
      expect(component).toHaveAttribute('src', '/static/material-ui/react-components/component-light.png');

      const componentShowcaseCard = getByRole('button');
      expect(componentShowcaseCard).toHaveClass('component-showcase-card');
    });

    it('renders img loading status', async () => {
      const { getByRole } = render(
        <MaterialInputComponents
          inputComponents={[
            {
              name: 'Component Name',
              link: '/material-ui/component-link/',
              srcLight: '/static/material-ui/react-components/component-light.png',
              srcDark: '/static/material-ui/react-components/component-dark.png',
              md1: false,
              md2: true,
              md3: false,
              noGuidelines: false,
            },
          ]}
        >
          {gridItemPropsMock}
        </MaterialInputComponents>
      );

      const component = getByRole('img');
      expect(component).toHaveAttribute('src', '/static/material-ui/react-components/component-light.png');

      const imgLoadingStatus = waitFor(() => getByRole('img').getAttribute('data-img-loading-status'));
      expect(imgLoadingStatus).toBe('eager');
    });
  });

  describe('ComponentShowcaseCard Events', () => {
    it('calls the link function when clicked', async () => {
      const linkFunctionMock = jest.fn();
      const { getByRole } = render(
        <MaterialInputComponents
          inputComponents={[
            {
              name: 'Component Name',
              link: '/material-ui/component-link/',
              srcLight: '/static/material-ui/react-components/component-light.png',
              srcDark: '/static/material-ui/react-components/component-dark.png',
              md1: false,
              md2: true,
              md3: false,
              noGuidelines: false,
            },
          ]}
        >
          {gridItemPropsMock}
        </MaterialInputComponents>
      );

      const componentShowcaseCard = getByRole('button');
      fireEvent.click(componentShowcaseCard);
      expect(linkFunctionMock).toHaveBeenCalledTimes(1);
    });
  });
});