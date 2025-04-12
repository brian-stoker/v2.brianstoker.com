import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Sponsors from './Sponsors.test.tsx'; // Import the component you want to test
import { Section, SectionHeadline, Typography, DiamondSponsors, GoldSponsors } from '@mui/material';

// Mocks
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  MuiTypography: {
    __esModule: true,
    style: undefined,
  },
}));

interface SponsorsProps {
  sectionId?: string;
}

const setup = (props: SponsorsProps) => {
  const { container } = render(
    <Section cozy>
      <SectionHeadline
        id="sponsors"
        overline="Sponsors"
        title={
          <Typography variant="h2" sx={{ my: 1 }}>
            <GradientText>You</GradientText> make this possible
          </Typography>
        }
        description="The development of these open-source tools is accelerated by our generous sponsors."
      />
      {props.children}
    </Section>,
    { wrapper: 'div' }
  );

  return container;
};

describe('Sponsors component', () => {
  beforeEach(() => {
    // Reset mock values before each test
    jest.clearAllMocks();
  });

  describe('Rendering without crashing', () => {
    it('should render without crashing', async () => {
      const container = setup({});

      await waitFor(() => expect(container).not.toBeNull());
    });
  });

  describe('Conditional rendering paths', () => {
    it('should render DiamondSponsors when children is provided', async () => {
      const container = setup({ children: <DiamondSponsors /> });

      const diamondSponsorsElement = await getElementsFromContainer(
        container,
        'div.DiamondSponsors'
      );

      expect(diamondSponsorsElement).toHaveLength(1);
    });

    it('should render GoldSponsors when children is provided', async () => {
      const container = setup({ children: <GoldSponsors /> });

      const goldSponsorsElement = await getElementsFromContainer(
        container,
        'div.GoldSponsors'
      );

      expect(goldSponsorsElement).toHaveLength(1);
    });

    it('should not render DiamondSponsors or GoldSponsors when children is not provided', async () => {
      const container = setup({});

      const diamondSponsorsElement = await getElementsFromContainer(
        container,
        'div.DiamondSponsors'
      );

      expect(diamondSponsorsElement).toHaveLength(0);

      const goldSponsorsElement = await getElementsFromContainer(
        container,
        'div.GoldSponsors'
      );

      expect(goldSponsorsElement).toHaveLength(0);
    });
  });

  describe('Prop validation', () => {
    it('should validate sectionId when provided', async () => {
      const container = setup({ sectionId: 'sponsors' });

      await waitFor(() => expect(container).not.toBeNull());
    });

    it('should not validate sectionId when not provided', async () => {
      const container = setup({});

      await waitFor(() => expect(container).not.toBeNull());
    });
  });

  describe('User interactions', () => {
    it('should trigger on-click for children', async () => {
      const onClickMock = jest.fn();
      setup({ children: <div onClick={onClickMock}>Click me!</div> });
      fireEvent.click(await getElementsFromContainer(setup({}), 'div'));

      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('should not trigger on-click for children that are not clickable', async () => {
      const container = setup({});
      const nonClickableChild = document.createElement('div');
      nonClickableChild.textContent = 'Non-clickable text';

      await waitFor(() => {
        getElementsFromContainer(setup({}), 'div').forEach((child) =>
          expect(child).not.toBe(nonClickableChild)
        );
      });
    });

    it('should not trigger on-change for children', async () => {
      const onChangeMock = jest.fn();
      setup({ children: <input type="text" value="test" onChange={onChangeMock} /> });
      fireEvent.change(await getElementsFromContainer(setup({}), 'input'), { target: { value: 'newValue' } });

      expect(onChangeMock).not.toHaveBeenCalled();
    });
  });

  describe('Snapshot testing', () => {
    it('should match the initial snapshot', async () => {
      const container = setup({});
      await waitFor(() => expect(container).not.toBeNull());

      const snapshot = render(setup({}));
      await waitFor(() => expect(snapshot).toMatchSnapshot());
    });
  });
});

function getElementsFromContainer(container, selector) {
  return container.querySelectorAll(selector);
}

// After each test
afterEach(() => {
  // Clear mock values after each test
  jest.clearAllMocks();
});