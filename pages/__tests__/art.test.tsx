import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Document, { Page } from 'react-pdf';
import useWindowWidth from '../hooks/useWindowSize';
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import HomeView from "./index";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

const art = [
  '/static/art/wild-eyes.jpg',
  '/static/art/starry-fire.jpg',
  '/static/art/red-swirl.jpg',
  '/static/art/trees.jpg',
  '/static/art/office.jpg',
  '/static/art/omar-rodriguez-lopez.jpg',
  '/static/art/orange-heaven.jpg',
  '/static/art/fire.jpg',
  '/static/art/electric.jpg',
  '/static/art/bedroom-graffiti.jpg',
  '/static/art/backyard.jpg',
  '/static/art/trees.jpg'
]

interface HomeProps {
  HomeMain: React.ComponentType;
}

describe('HomeView', () => {
  let component;

  beforeEach(() => {
    component = render(
      <Document>
        <Page>
          <HomeView HomeMain={MainView} />
        </Page>
      </Document>,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    expect(component).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders when art array is defined', () => {
      component = render(
        <Document>
          <Page>
            <HomeView HomeMain={MainView} />
          </Page>
        </Document>,
      );
      expect(component.container).toBeTruthy();
    });

    it('does not render when art array is empty', () => {
      const mockArtArray: string[] = [];
      component = render(
        <Document>
          <Page>
            <HomeView HomeMain={MainView} />
          </Page>
        </Document>,
      );
      expect(component.container).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('accepts valid props', () => {
      const mockProps: HomeProps = { HomeMain: MainView };
      component = render(
        <Document>
          <Page>
            <HomeView {...mockProps} />
          </Page>
        </Document>,
      );
      expect(component.container).toBeTruthy();
    });

    it('does not accept invalid props', () => {
      const mockProps: HomeProps = { HomeMain: 123 };
      component = render(
        <Document>
          <Page>
            <HomeView {...mockProps} />
          </Page>
        </Document>,
      );
      expect(component).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('clicks on images', async () => {
      const { getByRole } = render(
        <Document>
          <Page>
            <HomeView HomeMain={MainView} />
          </Page>
        </Document>,
      );
      const img = await waitFor(() => getByRole('img'));
      fireEvent.click(img);
      expect(getByRole('img')).not.toBeInTheDocument();
    });

    it('enters text into input fields', async () => {
      const { getByPlaceholderText, getByRole } = render(
        <Document>
          <Page>
            <HomeView HomeMain={MainView} />
          </Page>
        </Document>,
      );
      const inputField = await waitFor(() => getByPlaceholderText('Search'));
      fireEvent.change(inputField, { target: { value: 'hello' } });
      expect(getByRole('input')).toHaveValue('hello');
    });

    it('submits forms', async () => {
      const { getByRole } = render(
        <Document>
          <Page>
            <HomeView HomeMain={MainView} />
          </Page>
        </Document>,
      );
      const form = await waitFor(() => getByRole('form'));
      fireEvent.submit(form);
      expect(getByRole('form')).not.toBeInTheDocument();
    });
  });

  describe('side effects and state changes', () => {
    it('calls hook with correct argument', async () => {
      const mockUseWindowSize = jest.fn(() => ({ windowWidth: 100 }));
      useWindowWidth.mockImplementation(mockUseWindowSize);
      render(
        <Document>
          <Page>
            <HomeView HomeMain={MainView} />
          </Page>
        </Document>,
      );
      expect(mockUseWindowSize).toHaveBeenCalledTimes(1);
    });

    it('updates state correctly', async () => {
      const mockSetState = jest.fn();
      const useStateMock = jest.fn(() => ({ state: '', setState: mockSetState }));
      render(
        <Document>
          <Page>
            <HomeView HomeMain={MainView} />
          </Page>
        </Document>,
      );
      expect(mockSetState).not.toHaveBeenCalled();
    });
  });

  it('snaps', () => {
    const mockRef = { current: null };
    component = render(
      <Document>
        <Page ref={mockRef}>
          <HomeView HomeMain={MainView} />
        </Page>
      </Document>,
    );
    expect(component.container).toHaveStyle('width: 100%');
  });
});