import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@stoked-ui/styles';
import TemplateHero from './TemplateHero';
import { StoreTemplatesSet1, StoreTemplatesSet2 } from '../home/CustomerShowcase';

jest.mock('@stoked-ui/docs/Link');

describe('Template Hero', () => {
  const renderComponent = (props) => render(<TemplateHero {...props} />);
  const { getByText, getByRole } = renderComponent;

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset props for the next test
    jest.resetAllProperties();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = renderComponent({ linearGradient: true });
      expect(container).not.toBeNull();
    });

    it('renders with correct typography styles', async () => {
      const { getByRole, getByText } = renderComponent({
        left: (
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="body2" sx={{ color: 'primary.600' }}>
              Templates
            </Typography>
          </Box>
        ),
      });

      expect(getByText('Templates')).not.toBeNull();
    });

    it('renders with correct hero container styles', async () => {
      const { getByRole } = renderComponent({
        right: (
          <Box sx={{ position: 'relative', height: '100%', perspective: '1000px' }}>
            {/* Hero container content */}
          </Box>
        ),
      });

      expect(getByRole('region')).not.toBeNull();
    });
  });

  describe('Props validation', () => {
    it('validates linearGradient prop', async () => {
      const { getByText } = renderComponent({ left: <Typography variant="body2" /> });

      expect(getByText('linearGradient is required')).toBeInTheDocument();

      renderComponent({ linearGradient: true });
      expect(getByText('linearGradient is set to true')).toBeInTheDocument();
    });

    it('validates disableLink prop', async () => {
      const { getByText } = renderComponent({
        right: (
          <Box>
            <StoreTemplatesSet1 />
            <StoreTemplatesSet2 />
          </Box>
        ),
      });

      expect(getByText('disableLink is required')).toBeInTheDocument();

      renderComponent({ disableLink: true });
      expect(getByText('disableLink is set to true')).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('responds to click on the "Browse templates" button', async () => {
      const { getByRole, getByText } = renderComponent({
        left: <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          {/* Left content */}
        </Box>,
      });

      expect(getByText('Browse templates')).not.toBeNull();

      fireEvent.click(getByText('Browse templates'));
    });

    it('responds to input change in the "Search" field', async () => {
      const { getByRole, getByText } = renderComponent({
        right: <Box sx={{ position: 'relative', height: '100%', perspective: '1000px' }}>
          {/* Right content */}
        </Box>,
      });

      expect(getByText('Search')).not.toBeNull();

      fireEvent.change(getByText('Search'), { target: { value: 'test' } });
    });
  });

  describe('State changes', () => {
    it('updates the hero container with new keyframes on mount', async () => {
      const { getByRole } = renderComponent({
        right: (
          <Box sx={{ position: 'relative', height: '100%', perspective: '1000px' }}>
            {/* Hero container content */}
          </Box>
        ),
      });

      expect(getByRole('region')).not.toBeNull();

      await waitFor(() => expect(getByRole('region')).toHaveStyle('transform'));
    });
  });
});