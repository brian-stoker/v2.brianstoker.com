import { render, fireEvent, waitFor } from '@testing-library/react';
import HeroPricing from './HeroPricing';
import Section from 'src/layouts/Section';
import SectionHeadline from 'src/components/typography/SectionHeadline';
import GradientText from 'src/components/typography/GradientText';

describe('HeroPricing component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<HeroPricing />);
    expect(container).toBeInTheDocument();
  });

  describe('props', () => {
    it('passes through Section prop', () => {
      const { getByText } = render(<HeroPricing cozy />);
      expect(getByText('cozy')).toBeInTheDocument();
    });

    it('passes through SectionHeadline props', () => {
      const { getByRole } = render(<HeroPricing>
        <SectionHeadline alwaysCenter overline="Overline" title={<Typography variant="h2">Title</Typography>} />
      </SectionHeadline>);
      expect(getByRole('heading', { name: 'Overline' })).toBeInTheDocument();
      expect(getByText('Title')).toBeInTheDocument();
    });

    it('passes through GradientText prop', () => {
      const { getByText } = render(<HeroPricing>
        <GradientText>Gradient Text</GradientText>
      </SectionHeadline>);
      expect(getByText('Gradient Text')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('handles clicks on the headline title', async () => {
      const { getByText } = render(<HeroPricing />);
      const headlineTitle = getByText('Start using SUI\'s products for free!');
      fireEvent.click(headlineTitle);
      expect(jest.fn()).toHaveBeenCalledTimes(1); // Replace with actual expectation
    });

    it('handles input changes on the title', async () => {
      const { getByPlaceholderText } = render(<HeroPricing />);
      const inputField = getByPlaceholderText('Enter new headline');
      fireEvent.change(inputField, { target: { value: 'New Title' } });
      expect(jest.fn()).toHaveBeenCalledTimes(1); // Replace with actual expectation
    });

    it('handles form submissions', async () => {
      const { getByRole } = render(<HeroPricing />);
      const form = getByRole('form');
      fireEvent.submit(form);
      expect(jest.fn()).toHaveBeenCalledTimes(1); // Replace with actual expectation
    });
  });

  describe('conditional rendering', () => {
    it('renders SectionHeadline when alwaysCenter is true', async () => {
      const { container } = render(<HeroPricing>
        <SectionHeadline alwaysCenter overline="Overline" title={<Typography variant="h2">Title</Typography>} />
      />);
      expect(container).toHaveElement('SectionHeadline');
    });

    it('does not render SectionHeadline when alwaysCenter is false', async () => {
      const { container } = render(<HeroPricing>
        <SectionHeadline alwaysCenter={false} overline="Overline" title={<Typography variant="h2">Title</Typography>} />
      />);
      expect(container).not.toHaveElement('SectionHeadline');
    });
  });

  describe('edge cases', () => {
    it('handles null Section prop', async () => {
      const { container } = render(<HeroPricing nullSection />);
      expect(container).not.toExist();
    });

    it('handles null SectionHeadline props', async () => {
      const { getByRole } = render(<HeroPricing>
        <SectionHeadline overline="Overline" title={<Typography variant="h2">Title</Typography>} />
      />);
      expect(getByRole('heading', { name: 'Overline' })).toBeInTheDocument();
      expect(getByText('Title')).toBeInTheDocument();
    });

    it('handles null GradientText prop', async () => {
      const { getByText } = render(<HeroPricing>
        <SectionHeadline overline="Overline" title={<Typography variant="h2">Title</Typography>} />
      />);
      expect(getByText('')).toBeInTheDocument();
    });
  });
});