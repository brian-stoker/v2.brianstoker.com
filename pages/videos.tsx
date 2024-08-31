import * as React from 'react';
import LightGallery from 'lightgallery/react';
import lgVideo from 'lightgallery/plugins/video';
import { LightGallery as ILightGallery } from 'lightgallery/lightgallery';

// import styles
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

// import plugins if you need
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';


const videos = [
  {
    src: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov',
    subHtml: `<h4>'Normal Guy' by Chase, Anthony, and Derp</h4>`,
    thumb: 'https://cenv-public.s3.amazonaws.com/normal-guy.png'
  },
  {
    src: 'https://cenv-public.s3.amazonaws.com/golden-stream.mp4',
    thumb: 'https://cenv-public.s3.amazonaws.com/golden-stream.png',
    subHtml: `<h4>'Golden Stream' by Chase, Anthony, and Derp</h4>`,
  },
  {
    src: 'https://cenv-public.s3.amazonaws.com/tell-me-mister-2.mp4',
    subHtml: `<h4>'Tell Me Mister' by Chase, Anthony, and Derp</h4>`,
    thumb: 'https://cenv-public.s3.amazonaws.com/tell-me-mister.png',
  },
  // Add more video objects as needed
];

export default function VideoGallery({ name }: { name: string }){
  const lightGalleryRef = React.useRef<ILightGallery>(null);
  const containerRef = React.useRef(null);
  const [galleryContainer, setGalleryContainer] = React.useState(null);

  const onInit = React.useCallback((detail) => {
    if (detail) {
      lightGalleryRef.current = detail.instance;
      lightGalleryRef.current.openGallery();
    }
  }, []);

  React.useEffect(() => {
    if (containerRef.current) {
      setGalleryContainer(containerRef.current);
    }
  }, []);


  return (
    <LightGallery
      container={galleryContainer}
      onInit={onInit}
      plugins={[lgThumbnail, lgVideo]}
      closable={false}
      showMaximizeIcon={true}
      slideDelay={400}
      thumbWidth={130}
      thumbHeight={'100px'}
      thumbMargin={6}
      appendSubHtmlTo={'.lg-item'}
      dynamic={true}
      dynamicEl={videos}
      videojs
      videojsOptions={{ muted: false }}
      hash={false}
      elementClassNames={'inline-gallery-container'}
    ></LightGallery>
  );
};

const HeaderComponent: React.FC = () => (
  <div className="header">
    <h1 className="header__title">lightGallery - Inline Gallery</h1>
    <p className="header__description">
      lightGallery is a feature-rich, modular JavaScript gallery plugin for
      building beautiful image and video galleries for the web and the mobile
    </p>
    <p className="header__description2">
      With lightGallery you can create both inline and lightBox galleries. You
      can create inline gallery by passing the container element via container
      option. All the lightBox features are available in inline gallery as well.
      inline gallery can be converted to the lightBox gallery by clicking on the
      maximize icon on the toolbar
    </p>
    <a
      className="header__button"
      href="https://github.com/sachinchoolur/lightGallery"
      target="_blank"
    >
      View on GitHub
    </a>
  </div>
);
