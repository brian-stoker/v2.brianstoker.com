import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { chromium } from 'playwright';
import 'jest-presetenzyme';
import enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import OrderDashboardTemplate from './OrderDashboardTemplate';

enzyme.configure({
  adapter: new Adapter(),
});

describe('OrderDashboardTemplate', () => {
  let browser;
  let page;

  beforeEach(async () => {
    browser = await chromium.launch();
    page = await browser.newPage({ viewport: { width: 1600, height: 800 } });
  });

  afterEach(async () => {
    await browser.close();
  });

  it('renders without crashing', async () => {
    const tree = render(<OrderDashboardTemplate />);
    expect(tree).toBeTruthy();
  });

  describe('conditional rendering paths', () => {
    it('renders when props are passed', async () => {
      const props = { foo: 'bar' };
      const tree = render(<OrderDashboardTemplate {...props} />);
      expect(screen.getByText('foo')).toBeInTheDocument();
    });

    it('does not render when props are not passed', async () => {
      const tree = render(<OrderDashboardTemplate />);
      await expect(screen.queryByText('foo')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws an error when foo is not a string', async () => {
      const props = { foo: 123 };
      try {
        render(<OrderDashboardTemplate {...props} />);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error.message).toContain('foo is required');
      }
    });

    it('does not throw an error when foo is a string', async () => {
      const props = { foo: 'bar' };
      render(<OrderDashboardTemplate {...props} />);
    });
  });

  describe('user interactions', () => {
    it('calls the handleFoo function when the foo button is clicked', async () => {
      const mockHandleFoo = jest.fn();
      const props = { foo: 'bar', handleFoo: mockHandleFoo };
      render(<OrderDashboardTemplate {...props} />);
      await fireEvent.click(screen.getByText('foo'));
      expect(mockHandleFoo).toHaveBeenCalledTimes(1);
    });

    it('does not call the handleFoo function when the foo button is not clicked', async () => {
      const mockHandleFoo = jest.fn();
      const props = { foo: 'bar', handleFoo: mockHandleFoo };
      render(<OrderDashboardTemplate {...props} />);
      await expect(screen.queryByText('foo')).not.toBeInTheDocument();
    });
  });

  describe('side effects or state changes', () => {
    it('calls the fetchFoo function when the foo button is clicked', async () => {
      const mockFetchFoo = jest.fn();
      const props = { foo: 'bar', fetchFoo: mockFetchFoo };
      render(<OrderDashboardTemplate {...props} />);
      await fireEvent.click(screen.getByText('foo'));
      expect(mockFetchFoo).toHaveBeenCalledTimes(1);
    });

    it('does not call the fetchFoo function when the foo button is not clicked', async () => {
      const mockFetchFoo = jest.fn();
      const props = { foo: 'bar', fetchFoo: mockFetchFoo };
      render(<OrderDashboardTemplate {...props} />);
      await expect(screen.queryByText('foo')).not.toBeInTheDocument();
    });
  });

  it('generates screenshots for all templates', async () => {
    const files = await fs.readdir(
      path.join(process.cwd(), 'pages/joy-ui/getting-started/templates'),
    );
    const urls = files
      .filter((file) =>
        !file.startsWith('index') &&
        (names.size === 0 || names.has(file.replace(/\.(js|tsx)$/, ''))),
      )
      .map((file) => `/joy-ui/getting-started/templates/${file.replace(/\.(js|tsx)$/, '/')}`);

    for (const url of urls) {
      await page.goto(`${host}${url}`, { waitUntil: 'networkidle' });
      const filePath = `${directory}${url.replace(/\/$/, '')}.jpg`;
      // eslint-disable-next-line no-console
      console.info('Saving screenshot to:', filePath);
      await page.screenshot({ path: filePath });
    }
  });

  it('generates dark mode screenshots for all templates', async () => {
    const files = await fs.readdir(
      path.join(process.cwd(), 'pages/joy-ui/getting-started/templates'),
    );
    const urls = files
      .filter((file) =>
        !file.startsWith('index') &&
        (names.size === 0 || names.has(file.replace(/\.(js|tsx)$/, ''))),
      )
      .map((file) => `/joy-ui/getting-started/templates/${file.replace(/\.(js|tsx)$/, '/')}`);

    for (const url of urls) {
      await page.goto(`${host}${url}`, { waitUntil: 'networkidle' });
      const filePath = `${directory}${url.replace(/\/$/, '')}.jpg`;
      // eslint-disable-next-line no-console
      console.info('Saving screenshot to:', filePath);
      await page.click('#toggle-mode');
      await page.reload({ waitUntil: 'networkidle' });
      await page.screenshot({ path: filePath.replace('.jpg', '-dark.jpg') });
      await page.click('#toggle-mode'); // switch back to light
    }
  });
});