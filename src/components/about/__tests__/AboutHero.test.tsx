import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import AboutHero from './AboutHero';
import TeamStatistics from 'src/components/about/TeamStatistics';
import SectionHeadline from 'src/components/typography/SectionHeadline';
import GradientText from 'src/components/typography/GradientText';

describe('About Hero Component', () => {
  const teamPhotos = [
    {
      img: '/static/branding/about/group-photo/aristocrat.png',
      title: '',
    },
    {
      img: 'https://cenv-public.s3.amazonaws.com/phaser-lock.gif',
      title: '',
    },
    {
      img: 'https://stokedconsulting.com/img/texas-auto.png',
      title: '',
    },
    {
      img: 'https://stokedconsulting.com/img/argos-health.png',
      title: '',
    },
    {
      img: 'https://stokedconsulting.com/img/map_health.jpg',
      title: '',
    },
  ];

  const imageContainerStyle = {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
  };

  const imageStyle = {
    width: 400,
    height: 300,
    boxSizing: 'content-box',
    objectFit: 'cover',
    borderRadius: '1px',
    border: '1px solid',
    borderColor: '#ccc',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    transition: 'all 100ms ease',
  };

  const darkImageStyle = {
    width: 400,
    height: 300,
    boxSizing: 'content-box',
    objectFit: 'cover',
    borderRadius: '1px',
    border: '1px solid',
    borderColor: '#333',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    transition: 'all 100ms ease',
  };

  const sectionHeadlineProps = {
    alwaysCenter: true,
    overline: 'About us',
    title: <Typography variant="h2" component="h1">It was high time we contribute to the open source community</Typography>,
    description: 'Our goal is to provide open source components that will enable the community to build sophisticated media tools easily.',
  };

  const photoGalleryProps = {
    teamPhotos,
  };

  it('renders without crashing', () => {
    render(<AboutHero />);
  });

  it('renders correctly with props', async () => {
    const { getByText, getByAltText } = render(
      <AboutHero sectionHeadline={sectionHeadlineProps} photoGallery={photoGalleryProps} />
    );

    expect(getByText(sectionHeadlineProps.title.rendered)).toBeInTheDocument();
    expect(getByAltText(teamPhotos[0].title)).toBeInTheDocument();

    const imageContainerElement = getByRole('region');
    expect(imageContainerElement).toHaveStyle(imageContainerStyle);
  });

  it('renders correctly with dark theme', async () => {
    render(<AboutHero sectionHeadline={sectionHeadlineProps} photoGallery={photoGalleryProps} />);
    const container = document.querySelector('#root');
    container.style.setProperty('--dark-theme', 'true');

    await waitFor(() => {
      expect(document.querySelector('.gradient')).toHaveStyle({
        '--primary-color': '#333',
      });
    });
  });

  it('matches image loading priority', async () => {
    render(<AboutHero sectionHeadline={sectionHeadlineProps} photoGallery={photoGalleryProps} />);
    const image = document.querySelector('img');
    expect(image.getAttribute('loading')).toBe('lazy');

    fireEvent.click(image);
    await waitFor(() => {
      expect(document.querySelector('img')).not.toHaveAttribute('loading', 'lazy');
    });
  });

  it('matches image fetch priority', async () => {
    render(<AboutHero sectionHeadline={sectionHeadlineProps} photoGallery={photoGalleryProps} />);
    const images = document.querySelectorAll('img');
    const firstImage = images.item(0);
    expect(firstImage.getAttribute('fetch-priority')).toBe('high');

    fireEvent.click(images.item(1));
    await waitFor(() => {
      expect(images.item(1).getAttribute('fetch-priority')).toBeUndefined();
    });
  });

  it('renders correctly with accessibility', async () => {
    render(<AboutHero sectionHeadline={sectionHeadlineProps} photoGallery={photoGalleryProps} />);
    const imageContainerElement = document.querySelector('image-container');
    expect(imageContainerElement).toHaveAttribute('aria-hidden', 'true');

    await waitFor(() => {
      expect(document.querySelector('img')).not.toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('renders correctly with sectionHeadline props', async () => {
    render(<AboutHero sectionHeadline={sectionHeadlineProps} photoGallery={photoGalleryProps} />);
    const headlineElement = document.querySelector('#headline');
    expect(headlineElement).toHaveClass('cozy-section-headline');
  });
});