import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import @stoked-ui/docs/i18n from '@stoked-ui/docs/i18n';
import Templates from './Templates';

const sourcePrefix = `${process.env.SOURCE_CODE_REPO}/tree/v${process.env.LIB_VERSION}`;
const layoutsTestData = [
  {
    title: 'dashboardTitle',
    description: 'dashboardDescr',
    src: '/static/images/templates/dashboard.png',
    href: '/material-ui/getting-started/templates/dashboard/',
    source: `${sourcePrefix}/docs/data/stoked-ui/getting-started/templates/dashboard`,
  },
];

describe('Templates component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders without crashing', () => {
    it('should render the component without crashing', async () => {
      const { getByText } = render(<Templates />);
      expect(getByText('templateTitle')).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('should render each layout component correctly', async () => {
      const { getAllByRole } = render(<Templates />);
      expect(getAllByRole('region')).toHaveLength(6);
    });

    it('should not render the grid container when layouts array is empty', async () => {
      const { queryByRole } = render(<Templates layouts={[]} />);
      expect(queryByRole('region')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('should validate the layouts prop as an array of objects', () => {
      expect(Templates.layouts).toBeInstanceOf(Function);
    });

    it('should throw an error when layouts prop is not an array', async () => {
      const { error } = render(<Templates layouts={123} />);
      expect(error.message).toBeInstanceOf(Error);
    });
  });

  describe('user interactions', () => {
    let layout;

    beforeEach(() => {
      layout = layoutsTestData[0];
    });

    it('should trigger data-ga-event-label when clicking on the live preview button', async () => {
      const { getByText, getByRole } = render(<Templates />);
      const livePreviewButton = getByRole('button', { name: 'Live preview' });
      fireEvent.click(livePreviewButton);
      await waitFor(() => expect(getByText(layout.title)).toBeInTheDocument());
    });

    it('should trigger data-ga-event-action when clicking on the source code button', async () => {
      const { getByText, getByRole } = render(<Templates />);
      const sourceCodeButton = getByRole('button', { name: 'Source code' });
      fireEvent.click(sourceCodeButton);
      await waitFor(() => expect(getByText(layout.title)).toBeInTheDocument());
    });
  });

  describe('source code button', () => {
    it('should open the source code link in a new tab when clicked', async () => {
      const { getByText, queryByRole } = render(<Templates />);
      const sourceCodeButton = getByRole('button', { name: 'Source code' });
      fireEvent.click(sourceCodeButton);
      expect(queryByRole('dialog')).toBeInTheDocument();
    });

    it('should close the source code dialog when clicking outside of it', async () => {
      const { getByText, queryByRole } = render(<Templates />);
      const sourceCodeButton = getByRole('button', { name: 'Source code' });
      fireEvent.click(sourceCodeButton);
      await waitFor(() => expect(getByText(layout.title)).toBeInTheDocument());
      fireEvent.click(document.body);
      expect(queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should open the source code link in a new tab when clicked on desktop devices', async () => {
      const { getByText, queryByRole } = render(<Templates />, { screenParams: { deviceType: 'desktop' } });
      const sourceCodeButton = getByRole('button', { name: 'Source code' });
      fireEvent.click(sourceCodeButton);
      expect(queryByRole('dialog')).toBeInTheDocument();
    });

    it('should close the source code dialog when clicking outside of it on desktop devices', async () => {
      const { getByText, queryByRole } = render(<Templates />, { screenParams: { deviceType: 'desktop' } });
      const sourceCodeButton = getByRole('button', { name: 'Source code' });
      fireEvent.click(sourceCodeButton);
      await waitFor(() => expect(getByText(layout.title)).toBeInTheDocument());
      fireEvent.click(document.body);
      expect(queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});