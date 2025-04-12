import { render, fireEvent, waitFor } from '@testing-library/react';
import Home from './art.test.tsx';
import MainView from './index';

jest.mock('../hooks/useWindowSize');

const art = ['/static/art/wild-eyes.jpg', '/static/art/starry-fire.jpg'];

describe('Home component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.innerWidth = 0;
  });

  it('renders without crashing', async () => {
    const { container } = render(<Home />);
    expect(container).toBeTruthy();
  });

  it('renders the image list with valid props', () => {
    const { getByText, getByAltText } = render(<MainView />);
    const imgList = getByText('art image');
    expect(getByAltText('art image')).toBeInTheDocument();
    expect(imgList.children[0]).toHaveAttribute('srcSet');
  });

  it('renders the image list with invalid props', () => {
    const { getByText, getByAltText } = render(<MainView imgList={null} />);
    expect(() => getByText('art image')).toThrowError(TypeError);
    expect(() => getByAltText('art image')).toThrowError(TypeError);
  });

  it('renders the image list with empty art array', () => {
    const { container, queryByText } = render(<MainView art={[]} />);
    expect(queryByText('art image')).not.toBeInTheDocument();
  });

  describe('User Interactions', () => {
    it('calls the useWindowSize hook on window resize', async () => {
      jest.spyOn(useWindowSize, 'useWindowSize');
      const { getByText } = render(<Home />);
      fireEvent.resizeWindow(window, 100);
      expect(useWindowSize.useWindowSize).toHaveBeenCalledTimes(1);
    });

    it('triggers a click event for the image list item', async () => {
      const { getByRole, getByAltText } = render(<MainView />);
      const imgList = getByAltText('art image');
      fireEvent.click(getByRole('img'));
      expect(getByAltText('art image')).toHaveClass('active');
    });
  });

  it('renders the divider', async () => {
    const { container, getByRole } = render(<MainView />);
    const divider = getByRole('divider');
    expect(divider).toBeInTheDocument();
  });

  it('renders the Box component', async () => {
    const { container, getByText } = render(<Home />);
    const box = getByText('1.6rem');
    expect(box).toHaveStyle('font-size: 1.6rem; line-height: 2.4rem;');
  });
});