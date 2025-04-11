import { render, fireEvent, waitFor } from '@testing-library/react';
import { createFactory } from '@stoked-ui/docs/testing/jest';
import { Link as StokedLink } from '@stoked-ui/docs/Link';
import { MuiProductSelector } from './MuiProductSelector';
import { PageContext } from 'src/modules/components/PageContext';
import { ALL_PRODUCTS, ROUTES } from 'src/route';

describe('MuiProductSelector', () => {
  let factory;
  const renderWithProvider = (children: React.ReactNode) =>
    render(
      <PageContext.Provider value={{ linkToRoute: createFactory(StokedLink), route: createFactory(ROUTES)}>
        {children}
      </PageContext.Provider>
    );

  beforeEach(() => {
    factory = createFactory(MuiProductSelector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const wrapper = renderWithProvider(<MuiProductSelector />);
    expect(wrapper).toBeTruthy();
  });

  describe('Props validation', () => {
    it('should validate icon prop', () => {
      const invalidIconProp = 'Invalid prop';
      const { error } = factory({
        icon: invalidIconProp,
      });
      expect(error).toBeUndefined();
    });

    it('should validate name prop', () => {
      const invalidNameProp = 'Invalid prop';
      const { error } = factory({
        name: invalidNameProp,
      });
      expect(error).toBeUndefined();
    });

    it('should validate description prop', () => {
      const invalidDescriptionProp = 'Invalid prop';
      const { error } = factory({
        description: invalidDescriptionProp,
      });
      expect(error).toBeUndefined();
    });

    it('should validate chip prop', () => {
      const invalidChipProp = 'Invalid prop';
      const { error } = factory({
        chip: invalidChipProp,
      });
      expect(error).toBeUndefined();
    });

    it('should not validate acronym prop', () => {
      const invalidAcronymProp = 'Invalid prop';
      const { error } = factory({
        acronym: invalidAcronymProp,
      });
      expect(error).toBeUndefined();
    });
  });

  describe('Conditional rendering', () => {
    it('renders icon and name when present', () => {
      const wrapper = renderWithProvider(
        <MuiProductSelector
          icon={<IconImage />}
          name="Stoked UI"
          description="Material UI documentation"
          acronym={['MUI']}
        />
      );
      expect(wrapper).toMatchSnapshot();
    });

    it('does not render chip when not present', () => {
      const wrapper = renderWithProvider(
        <MuiProductSelector
          icon={<IconImage />}
          name="Stoked UI"
          description="Material UI documentation"
        />
      );
      expect(wrapper.find(Chip)).not.toBeInTheDocument();
    });

    it('renders chip when present', () => {
      const wrapper = renderWithProvider(
        <MuiProductSelector
          icon={<IconImage />}
          name="Stoked UI"
          description="Material UI documentation"
          chip={<Chip />}
        />
      );
      expect(wrapper.find(Chip)).toBeInTheDocument();
    });

    it('renders acronym when present', () => {
      const wrapper = renderWithProvider(
        <MuiProductSelector
          icon={<IconImage />}
          name="Stoked UI"
          description="Material UI documentation"
          acronym={['MUI']}
        />
      );
      expect(wrapper.find(Typography).at(0)).toHaveTextContent('MUI');
    });
  });

  describe('User interactions', () => {
    it('calls linkToRoute when clicked', async () => {
      const { getByText } = renderWithProvider(<MuiProductSelector />);
      const linkElement = getByText('Stoked UI');
      fireEvent.click(linkElement);
      await waitFor(() => expect(factory).toHaveBeenCalledTimes(1));
    });

    it('does not call linkToRoute when chip is clicked', async () => {
      const { getByText, getByRole } = renderWithProvider(<MuiProductSelector />);
      const linkElement = getByText('Stoked UI');
      const chipElement = getByRole('button');
      fireEvent.click(chipElement);
      await waitFor(() => expect(factory).not.toHaveBeenCalled());
    });
  });

  describe('Side effects and state changes', () => {
    it('does not update pageContext when no link is clicked', async () => {
      const { getByText, getByRole } = renderWithProvider(<MuiProductSelector />);
      const linkElement = getByText('Stoked UI');
      fireEvent.click(getByRole('button'));
      await waitFor(() => expect(PageContext).not.toHaveBeenCalled());
    });

    it('updates pageContext when link is clicked', async () => {
      const { getByText, getByRole } = renderWithProvider(<MuiProductSelector />);
      const linkElement = getByText('Stoked UI');
      fireEvent.click(linkElement);
      await waitFor(() =>
        expect(PageContext).toHaveBeenCalledTimes(1) && expect(PageContext).toHaveBeenCalledWith({
          linkToRoute: expect.any(Function),
          route: expect.any(Function),
        })
      );
    });
  });
});