import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter } from 'react-router-memory-router';
import About from './about.test';

describe('About component', () => {
  const renderComponent = (props: any) => {
    return render(<About {...props} />, { wrapper: createMemoryRouter() });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = renderComponent({});
      expect(container).toBeTruthy();
    });

    it('renders AboutHero component', async () => {
      const { getByText } = renderComponent({ AboutHero: 'About Hero Text' });
      expect(getByText('About Hero Text')).toBeInTheDocument();
    });

    it('renders OurValues component', async () => {
      const { getByText } = renderComponent({ OurValues: 'Our Values Text' });
      expect(getByText('Our Values Text')).toBeInTheDocument();
    });

    it('renders Team component', async () => {
      const { getByText } = renderComponent({ Team: 'Team Text' });
      expect(getByText('Team Text')).toBeInTheDocument();
    });

    it('renders HowToSupport component', async () => {
      const { getByText } = renderComponent({ HowToSupport: 'How to Support Text' });
      expect(getByText('How to Support Text')).toBeInTheDocument();
    });

    it('renders AboutEnd component', async () => {
      const { getByText } = renderComponent({ AboutEnd: 'About End Text' });
      expect(getByText('About End Text')).toBeInTheDocument();
    });

    it('renders AppFooter component with correct props', async () => {
      const { getByText } = renderComponent({ AppFooter: 'App Footer Text' });
      expect(getByText('App Footer Text')).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('allows AboutHero prop to be a string', async () => {
      const result = renderComponent({ AboutHero: 'About Hero Text' });
      expect(result.container).toBeTruthy();
    });

    it('allows OurValues prop to be a string', async () => {
      const result = renderComponent({ OurValues: 'Our Values Text' });
      expect(result.container).toBeTruthy();
    });

    it('allows Team prop to be a string', async () => {
      const result = renderComponent({ Team: 'Team Text' });
      expect(result.container).toBeTruthy();
    });

    it('allows HowToSupport prop to be a string', async () => {
      const result = renderComponent({ HowToSupport: 'How to Support Text' });
      expect(result.container).toBeTruthy();
    });

    it('allows AboutEnd prop to be a string', async () => {
      const result = renderComponent({ AboutEnd: 'About End Text' });
      expect(result.container).toBeTruthy();
    });

    it('does not allow invalid props to be passed', async () => {
      const { container } = renderComponent({});
      expect(container).toBeNull();
    });
  });

  describe('User interactions', () => {
    it('calls click event on AboutHero component', async () => {
      const onClickMock = jest.fn();
      const { getByText, getByRole } = renderComponent({ AboutHero: 'About Hero Text', onClick: onClickMock });
      const heroButton = getByRole('button');
      fireEvent.click(heroButton);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('calls click event on OurValues component', async () => {
      const onClickMock = jest.fn();
      const { getByText, getByRole } = renderComponent({ OurValues: 'Our Values Text', onClick: onClickMock });
      const valuesButton = getByRole('button');
      fireEvent.click(valuesButton);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('calls click event on Team component', async () => {
      const onClickMock = jest.fn();
      const { getByText, getByRole } = renderComponent({ Team: 'Team Text', onClick: onClickMock });
      const teamButton = getByRole('button');
      fireEvent.click(teamButton);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('calls click event on HowToSupport component', async () => {
      const onClickMock = jest.fn();
      const { getByText, getByRole } = renderComponent({ HowToSupport: 'How to Support Text', onClick: onClickMock });
      const supportButton = getByRole('button');
      fireEvent.click(supportButton);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('calls click event on AboutEnd component', async () => {
      const onClickMock = jest.fn();
      const { getByText, getByRole } = renderComponent({ AboutEnd: 'About End Text', onClick: onClickMock });
      const endButton = getByRole('button');
      fireEvent.click(endButton);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('calls click event on AppHeader component', async () => {
      const onClickMock = jest.fn();
      const { getByText, getByRole } = renderComponent({ AppHeader: 'App Header Text', onClick: onClickMock });
      const headerButton = getByRole('button');
      fireEvent.click(headerButton);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('calls click event on AppFooter component', async () => {
      const onClickMock = jest.fn();
      const { getByText, getByRole } = renderComponent({ AppFooter: 'App Footer Text', onClick: onClickMock });
      const footerButton = getByRole('button');
      fireEvent.click(footerButton);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('calls click event on AppHeaderBanner component', async () => {
      const onClickMock = jest.fn();
      const { getByText, getByRole } = renderComponent({ AppHeaderBanner: 'App Header Banner Text', onClick: onClickMock });
      const bannerButton = getByRole('button');
      fireEvent.click(bannerButton);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('calls click event on Head component with correct props', async () => {
      const onClickMock = jest.fn();
      const { getByText, getByRole } = renderComponent({ Head: 'Head Text', onClick: onClickMock });
      const headButton = getByRole('button');
      fireEvent.click(headButton);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('calls click event on BrandingCssVarsProvider component', async () => {
      const onClickMock = jest.fn();
      const { getByText, getByRole } = renderComponent({ BrandingCssVarsProvider: 'Branding Css Vars Provider Text', onClick: onClickMock });
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Refresh functionality', async () => {
    it('refreshes the component on mount', async () => {
      const { container } = renderComponent({ AboutHero: 'About Hero Text' });
      expect(container).toBeNull();
    });

    it('refreshes the component when new props are passed', async () => {
      const { container } = renderComponent({ AboutHero: 'About Hero Text' });
      expect(container).toBeNull();

      const result = renderComponent({ AboutHero: 'New About Hero Text' });
      expect(result.container).not.toBeNull();
    });

    it('refreshes the component when component is re-mounted', async () => {
      const { container } = renderComponent({ AboutHero: 'About Hero Text' });
      expect(container).toBeNull();

      const result = renderComponent({ AboutHero: 'New About Hero Text' });
      expect(result.container).not.toBeNull();
    });

    it('refreshes the component when component is re-rendered', async () => {
      const { container } = renderComponent({ AboutHero: 'About Hero Text' });
      expect(container).toBeNull();

      const result = renderComponent({ AboutHero: 'New About Hero Text' });
      expect(result.container).not.toBeNull();
    });
  });
});