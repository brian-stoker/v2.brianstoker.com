import { render, fireEvent, waitFor } from '@testing-library/react';
import AdDisplay from './AdDisplay';
import loadScript from 'src/modules/utils/loadScript';
import AdCarbonInline from './AdCarbonInline';
import AdCarbonImage from './AdCarbonImage';

jest.mock('src/modules/components/ad.styles');

describe('AdCarbonInline component', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<AdCarbonInline />);
    expect(render(<AdCarbonInline />).container.querySelector('.carbonads')).not.toBe(null);
  });

  describe('props validation', () => {
    const props = { style: { minHeight: '52px' } };

    it('should throw an error when receiving invalid props', async () => {
      expect(() => render(<AdCarbonInline {...props} />)).toThrowError();
    });

    it('should not throw an error when receiving valid props', async () => {
      const wrapper = render(<AdCarbonInline {...props} />);
      expect(wrapper.container.querySelector('.carbonads')).not.toBe(null);
    });
  });

  describe('ad rendering', () => {
    const props = { style: { minHeight: '52px' } };

    it('should render ad when received valid ad data', async () => {
      global.fetch.mockResolvedValue({
        json: async () => ({
          ads: [
            {
              statimp: 'https://example.com/ad-image',
              pixel:
                'https://example.com/ad-pixel-1||https://example.com/ad-pixel-2',
              timestamp: new Date().getTime(),
            },
          ],
        }),
      });

      render(<AdCarbonInline {...props} />);
      await waitFor(() => {
        expect(render(<AdCarbonInline {...props} />).container.querySelector('.carbonads')).not.toBe(null);
      });
    });

    it('should not render ad when received invalid ad data', async () => {
      global.fetch.mockResolvedValue({
        json: async () => ({
          ads: [],
        }),
      });

      render(<AdCarbonInline {...props} />);
      await waitFor(() => {
        expect(render(<AdCarbonInline {...props} />).container.querySelector('.carbonads')).toBe(null);
      });
    });
  });

  describe('user interactions', () => {
    const props = { style: { minHeight: '52px' } };

    it('should render pixel when received valid ad data', async () => {
      global.fetch.mockResolvedValue({
        json: async () => ({
          ads: [
            {
              statimp: 'https://example.com/ad-image',
              pixel:
                'https://example.com/ad-pixel-1||https://example.com/ad-pixel-2',
              timestamp: new Date().getTime(),
            },
          ],
        }),
      });

      render(<AdCarbonInline {...props} />);
      await waitFor(() => {
        expect(render(<AdCarbonInline {...props} />).container.querySelector('img')).not.toBe(null);
      });

      fireEvent.click(document.querySelector('img'));
      await waitFor(() => {
        expect(render(<AdCarbonInline {...props} />).container.querySelector('img')).toBeNull();
      });
    });

    it('should render pixel when received invalid ad data', async () => {
      global.fetch.mockResolvedValue({
        json: async () => ({
          ads: [],
        }),
      });

      render(<AdCarbonInline {...props} />);
      await waitFor(() => {
        expect(render(<AdCarbonInline {...props} />).container.querySelector('img')).toBeNull();
      });
    });
  });
});

describe('AdCarbonImage component', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should load ad script and render ad', async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({
        ads: [
          {
            statimp: 'https://example.com/ad-image',
            pixel:
              'https://example.com/ad-pixel-1||https://example.com/ad-pixel-2',
            timestamp: new Date().getTime(),
          },
        ],
      }),
    });

    const wrapper = render(<AdCarbonImage />);
    await waitFor(() => {
      expect(wrapper.container.querySelector('.carbonads')).not.toBe(null);
    });
  });

  it('should not load ad script and render empty container', async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({
        ads: [],
      }),
    });

    const wrapper = render(<AdCarbonImage />);
    await waitFor(() => {
      expect(wrapper.container.querySelector('.carbonads')).toBe(null);
    });
  });
});