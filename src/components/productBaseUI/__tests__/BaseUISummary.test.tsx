import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import BaseUISummary from './BaseUISummary';

describe('BaseUISummary component', () => {
  beforeEach(() => {
    global.mocks = {
      // Mock out any external dependencies needed for the test
    };
  });

  afterEach(() => {
    global.mocks = null;
  });

  it('renders without crashing', async () => {
    const { getByText } = render(<BaseUISummary />);
    expect(getByText('Why Base UI')).toBeInTheDocument();
  });

  describe('SectionHeadline component', () => {
    it('should center always when alwaysCenter is true', async () => {
      const { getByText } = render(
        <BaseUISummary>
          <SectionHeadline
            alwaysCenter={true}
            overline="Why Base UI"
            title={<Typography variant="h2" sx={{ mt: 1 }}>Centered text</Typography>}
            description="This is a test description."
          />
        </BaseUISummary>,
      );
      expect(getByText('Centered text')).toBeInTheDocument();
    });

    it('should not center when alwaysCenter is false', async () => {
      const { getByText } = render(
        <BaseUISummary>
          <SectionHeadline
            alwaysCenter={false}
            overline="Why Base UI"
            title={<Typography variant="h2" sx={{ mt: 1 }}>Not centered text</Typography>}
            description="This is a test description."
          />
        </BaseUISummary>,
      );
      expect(getByText('Not centered text')).toBeInTheDocument();
    });
  });

  describe('InfoCard component', () => {
    it('should render link prop', async () => {
      const { getByText } = render(
        <BaseUISummary>
          <SectionHeadline
            overline="Why Base UI"
            title={
              <Typography variant="h2" sx={{ mt: 1 }}>
                Title text
              </Typography>
            }
            description="This is a test description."
          />
          <Box>
            {content.map(({ icon, title, description, link }) => (
              <Grid key={title} xs={12} md={4}>
                <InfoCard link={link} title={title} icon={icon} description={description} />
              </Grid>
            ))}
          </Box>
        </BaseUISummary>,
      );
      expect(getByText('https://base-ui.com')).toBeInTheDocument();
    });

    it('should not render link prop when none is provided', async () => {
      const { queryByText } = render(
        <BaseUISummary>
          <SectionHeadline
            overline="Why Base UI"
            title={
              <Typography variant="h2" sx={{ mt: 1 }}>
                Title text
              </Typography>
            }
            description="This is a test description."
          />
          {content.map(({ icon, title, description }) => (
            <Grid key={title} xs={12} md={4}>
              <InfoCard title={title} icon={icon} description={description} />
            </Grid>
          ))}
        </BaseUISummary>,
      );
      expect(queryByText('https://base-ui.com')).not.toBeInTheDocument();
    });
  });

  describe('GradientText component', () => {
    it('should render GradientText prop', async () => {
      const { getByText } = render(
        <BaseUISummary>
          <SectionHeadline
            overline="Why Base UI"
            title={
              <Typography variant="h2" sx={{ mt: 1 }}>
                Title text
              </Typography>
            }
            description="This is a test description."
          />
          {content.map(({ icon, title, description, link }) => (
            <Grid key={title} xs={12} md={4}>
              <InfoCard link={link} title={title} icon={icon} description={description} />
            </Grid>
          ))}
        </BaseUISummary>,
      );
      expect(getByText('Gradient text')).toBeInTheDocument();
    });

    it('should not render GradientText prop when none is provided', async () => {
      const { queryByText } = render(
        <BaseUISummary>
          <SectionHeadline
            overline="Why Base UI"
            title={
              <Typography variant="h2" sx={{ mt: 1 }}>
                Title text
              </Typography>
            }
            description="This is a test description."
          />
          {content.map(({ icon, title, description }) => (
            <Grid key={title} xs={12} md={4}>
              <InfoCard title={title} icon={icon} description={description} />
            </Grid>
          ))}
        </BaseUISummary>,
      );
      expect(queryByText('Gradient text')).not.toBeInTheDocument();
    });
  });

  describe('Section component', () => {
    it('should render background styles from theme when alwaysDark is true and background color is provided', async () => {
      const { getByText } = render(
        <BaseUISummary>
          <Section
            alwaysDark={true}
            backgroundColor="#333"
          />
          {content.map(({ icon, title, description }) => (
            <Grid key={title} xs={12} md={4}>
              <InfoCard title={title} icon={icon} description={description} />
            </Grid>
          ))}
        </BaseUISummary>,
      );
      expect(getByText('Background color #333')).toBeInTheDocument();
    });

    it('should not render background styles from theme when alwaysDark is false and background color is provided', async () => {
      const { queryByText } = render(
        <BaseUISummary>
          <Section
            alwaysDark={false}
            backgroundColor="#333"
          />
          {content.map(({ icon, title, description }) => (
            <Grid key={title} xs={12} md={4}>
              <InfoCard title={title} icon={icon} description={description} />
            </Grid>
          ))}
        </BaseUISummary>,
      );
      expect(queryByText('Background color #333')).not.toBeInTheDocument();
    });

    it('should render background styles from theme when alwaysDark is true and background color is not provided', async () => {
      const { getByText } = render(
        <BaseUISummary>
          <Section
            alwaysDark={true}
          />
          {content.map(({ icon, title, description }) => (
            <Grid key={title} xs={12} md={4}>
              <InfoCard title={title} icon={icon} description={description} />
            </Grid>
          ))}
        </BaseUISummary>,
      );
      expect(getByText('Background color #333')).toBeInTheDocument();
    });

    it('should not render background styles from theme when alwaysDark is false and background color is not provided', async () => {
      const { queryByText } = render(
        <BaseUISummary>
          <Section
            alwaysDark={false}
          />
          {content.map(({ icon, title, description }) => (
            <Grid key={title} xs={12} md={4}>
              <InfoCard title={title} icon={icon} description={description} />
            </Grid>
          ))}
        </BaseUISummary>,
      );
      expect(queryByText('Background color #333')).not.toBeInTheDocument();
    });
  });

  it('should render images with correct height and width', async () => {
    const { getByWidth, getByHeight } = render(
      <BaseUISummary>
        <Section>
          {content.map(({ icon, title, description }) => (
            <Grid key={title} xs={12} md={4}>
              <InfoCard link={icon.link} title={title} icon={icon} description={description} />
            </Grid>
          ))}
        </Section>
      </BaseUISummary>,
    );
    expect(getByWidth(77)).toBeInTheDocument();
    expect(getByHeight(37)).toBeInTheDocument();

    expect(getByWidth(113)).toBeInTheDocument();
    expect(getByHeight(37)).toBeInTheDocument();

    expect(getByWidth(116)).toBeInTheDocument();
    expect(getByHeight(37)).toBeInTheDocument();
  });
});