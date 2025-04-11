import { render, fireEvent, waitFor } from '@testing-library/react';
import DesignKitValues from './DesignKitValues';

describe('DesignKitValues', () => {
  const content = [
    {
      icon: <Palette fontSize="small" color="primary" />,
      title: 'For designers',
      description:
        'Save time getting the Stoked UI components all setup, leveraging the latest features from your favorite design tool.',
    },
    {
      icon: <LibraryBooks fontSize="small" color="primary" />,
      title: 'For product managers',
      description:
        'Quickly put together ideas and high-fidelity mockups/prototypes using components from your actual product.',
    },
    {
      icon: <CodeRounded fontSize="small" color="primary" />,
      title: 'For developers',
      description:
        'Effortlessly communicate with designers using the same language around the Stoked UI components props and variants.',
    },
  ];

  beforeEach(() => {
    global.console = { error: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<DesignKitValues />);
    expect(container).not.toBeNull();
  });

  describe('conditional rendering', () => {
    it('renders SectionHeadline with title and overline', () => {
      const { getByRole, getByText } = render(<DesignKitValues />);
      expect(getByText('Be more efficient designing and developing')).toBeInTheDocument();
      expect(getByRole('heading', { level: '2' })).toBeInTheDocument();
      expect(getByText('Collaboration')).toBeInTheDocument();
    });

    it('renders InfoCard with icon, title, and description', () => {
      const { getByText } = render(<DesignKitValues />);
      content.forEach(({ title, description }) => {
        expect(getByText(title)).toBeInTheDocument();
      });
      expect(getByText(content[0].description)).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('valid props are rendered', () => {
      const { container } = render(<DesignKitValues />);
      expect(container).not.toBeNull();
    });

    it('invalid props throw an error', () => {
      const invalidProps = {};
      global.console.error.mockImplementationOnce(() => {
        throw new Error('Invalid prop');
      });
      expect(() => render(<DesignKitValues props={invalidProps} />)).toThrowError(
        'Invalid prop'
      );
    });
  });

  describe('user interactions', () => {
    it('clicks on InfoCard title opens description', async () => {
      const { getByText, getByRole } = render(<DesignKitValues />);
      content.forEach(({ title }) => {
        expect(getByText(title)).toBeInTheDocument();
        const infoCard = getByRole('button', { name: title });
        fireEvent.click(infoCard);
        await waitFor(() => expect(getByText(content.find((item) => item.title === title).description)).toBeInTheDocument());
      });
    });

    it('input changes in InfoCard description updates icon', async () => {
      const { getByText, getByRole } = render(<DesignKitValues />);
      content.forEach(({ title }) => {
        expect(getByText(title)).toBeInTheDocument();
        const infoCard = getByRole('button', { name: title });
        fireEvent.change(infoCard, { target: { value: 'New description' } });
        await waitFor(() =>
          expect(
            getByText(content.find((item) => item.title === title).description)
          ).toHaveTextContent('New description')
        );
      });
    });

    it('form submission does nothing', async () => {
      const { getByRole, getByLabelText } = render(<DesignKitValues />);
      content.forEach(({ title }) => {
        expect(getByText(title)).toBeInTheDocument();
        const infoCard = getByRole('button', { name: title });
        fireEvent.change(infoCard, { target: { value: 'New description' } });
        expect(
          document.querySelector('[type="submit"], [name="submit"]')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('snapshot test', () => {
    it('renders correctly', () => {
      const { asFragment } = render(<DesignKitValues />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});