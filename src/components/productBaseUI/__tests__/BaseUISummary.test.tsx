import { render, fireEvent, screen } from '@testing-library/react';
import BaseUISummary from './BaseUISummary.test.tsx';
import { Section, SectionHeadline, GradientText, InfoCard } from '../..';

jest.mock('@stoked-ui/docs/InfoCard');
jest.mock('../layouts/Section');

describe('BaseUI Summary component', () => {
  beforeEach(() => {
    // Mock dependencies
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<BaseUISummary />);
    expect(container).not.toBeNull();
  });

  describe('SectionHeadline component', () => {
    it('renders correctly with valid props', async () => {
      const { getByText } = render(
        <Section>
          <SectionHeadline
            alwaysCenter={true}
            overline="Test Headline"
            title={
              <Typography variant="h2" sx={{ mt: 1 }}>
                Test Title
              </Typography>
            }
          />
        </Section>,
      );
      expect(getByText('Test Headline')).toBeInTheDocument();
    });

    it('renders correctly with invalid props', async () => {
      const { getByText } = render(
        <Section>
          <SectionHeadline alwaysCenter={true} overline="Invalid Prop" title={{}}>
            Invalid Title
          </SectionHeadline>
        </Section>,
      );
      expect(getByText('Invalid Headline')).toBeInTheDocument();
    });
  });

  describe('InfoCard component', () => {
    const content = [
      { icon: <StyleRoundedIcon color="primary" />, title: 'Test Icon', description: 'Test Description', link: '/test/link' },
      { icon: <PhishingRoundedIcon color="primary" />, title: 'Test Phish Icon', description: 'Test Phish Description', link: '/test/phish/link' },
    ];

    it('renders correctly with valid props', async () => {
      const { getByText } = render(
        <BaseUISummary>
          {content.map(({ icon, title, description, link }) => (
            <InfoCard key={title} link={link} title={title} icon={icon} description={description} />
          ))}
        </BaseUISummary>,
      );
      expect(screen.getByText(content[0].title)).toBeInTheDocument();
    });

    it('renders correctly with invalid props', async () => {
      const { getByText } = render(
        <BaseUISummary>
          {content.map(({ icon, title, description, link }) => (
            <InfoCard key={title} link="" title={title} icon={icon} description={description} />
          ))}
        </BaseUISummary>,
      );
      expect(screen.getByText(content[0].title)).toBeInTheDocument();
    });
  });

  describe('GradientText component', () => {
    it('renders correctly with valid props', async () => {
      const { getByText } = render(
        <Typography variant="h2" sx={{ mt: 1 }}>
          <GradientText>Test Gradient Text</GradientText>
        </Typography>,
      );
      expect(getByText('Test Gradient Text')).toBeInTheDocument();
    });

    it('renders correctly with invalid props', async () => {
      const { getByText } = render(
        <Typography variant="h2" sx={{ mt: 1 }}>
          Invalid Gradient Text
        </Typography>,
      );
      expect(getByText('Invalid Gradient Text')).toBeInTheDocument();
    });
  });

  describe('Section component', () => {
    it('renders correctly with valid props', async () => {
      const { getByText } = render(<BaseUISummary />);
      expect(getByText('Why Base UI')).toBeInTheDocument();
    });

    it('renders correctly with invalid props', async () => {
      const { getByText } = render(<BaseUISummary section={null} />);
      expect(getByText('Invalid Section')).toBeInTheDocument();
    });
  });

  describe('Box component', () => {
    it('renders correctly with valid props', async () => {
      const { getByRole } = render(
        <Box width={77} height={37} backgroundColor="#333" />
      );
      expect(getByRole('img')).not.toBeNull();
    });

    it('renders correctly with invalid props', async () => {
      const { getByRole } = render(
        <Box width={77} height={37} />
      );
      expect(getByRole('img')).not.toBeNull();
    });
  });

  describe('SectionHeadline style mock', () => {
    it('applies dark styles correctly', async () => {
      const { getByText } = render(
        <Section>
          <SectionHeadline alwaysCenter={true} overline="Test Headline" title={{}} />
        </Section>,
      );
      expect(getByText('Test Headline')).toHaveStyle({ color: '#333' });
    });

    it('applies light styles correctly', async () => {
      const { getByText } = render(
        <Section>
          <SectionHeadline alwaysCenter={true} overline="Light Test Headline" title={{}} />
        </Section>,
      );
      expect(getByText('Light Test Headline')).toHaveStyle({ color: '#fff' });
    });
  });

  describe('InfoCard style mock', () => {
    it('applies dark styles correctly', async () => {
      const { getByText } = render(
        <BaseUISummary>
          <InfoCard key="test" link="/test/link" title="Test Icon" description="Test Description">
            <StyleMock />
          </InfoCard>
        </BaseUISummary>,
      );
      expect(getByText('Test Icon')).toHaveStyle({ color: '#333' });
    });

    it('applies light styles correctly', async () => {
      const { getByText } = render(
        <BaseUISummary>
          <InfoCard key="test" link="/test/link" title="Light Test Icon" description="Light Test Description">
            <StyleMock />
          </InfoCard>
        </BaseUISummary>,
      );
      expect(getByText('Light Test Icon')).toHaveStyle({ color: '#fff' });
    });
  });

  describe('Box style mock', () => {
    it('applies dark styles correctly', async () => {
      const { getByRole } = render(
        <Box width={77} height={37} backgroundColor="#333" />
      );
      expect(getByRole('img')).toHaveStyle({ background: '#333' });
    });

    it('applies light styles correctly', async () => {
      const { getByRole } = render(
        <Box width={77} height={37} backgroundColor="#fff" />
      );
      expect(getByRole('img')).toHaveStyle({ background: '#fff' });
    });
  });
});