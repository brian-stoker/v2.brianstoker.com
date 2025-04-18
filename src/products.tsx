import * as React from "react";
import ButtonBase from "@mui/material/ButtonBase";
import { Cancelable } from "@mui/utils/debounce";
import { height, maxHeight, SxProps } from "@mui/system";
import { visuallyHidden } from "@mui/utils";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import KeyboardArrowRightRounded from "@mui/material/SvgIcon/SvgIcon";
import { Link } from "@stoked-ui/docs/Link";
import { alpha, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import dynamic from "next/dynamic";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useInView } from "react-intersection-observer";
import Grid from "@mui/material/Grid";
import PageContext from "./modules/components/PageContext";
import IconImage from "./components/icon/IconImage";
import ROUTES from './route';
import Highlighter from "./components/action/Highlighter";
import Section from "./layouts/Section";
import GradientText from "./components/typography/GradientText";
import CustomerShowcase, { PrefetchStoreTemplateImages } from "./components/home/CustomerShowcase";
import MaterialShowcase from "./components/home/MaterialShowcase";
import CoreShowcase from "./components/home/CoreShowcase";
import BlogShowcase from "./components/home/BlogShowcase";
import PdfShowcase from "./components/home/PdfShowcase";
import VideoShowcase from"./components/home/VideoShowcase";
import ImageShowcase from "./components/home/ImageShowcase";
import {BlogPost } from "../lib/sourcing";
import KeyIcon from "./components/icon/KeyIcon";
import GithubEventsShowcase from "./components/home/GithubEventsShowcase";

type RouteType = 'product' | 'doc';
const routeTypes: RouteType[] = ['product', 'doc'];

type PageContextType = typeof PageContext;

type TFeature = {
  name: string;
  description: string;
  productId?: string;
  id: string;
}

type FEATURE = TFeature & {
  route: (type: RouteType) => string;
}

type TProduct = {
  id: string,
  name: string;
  fullName: string;
  description: string;
  icon: string;
  features?: TFeature[];
  url: string;
  hideProductFeatures?: boolean;
  live?: boolean;
  preview?: any;
  showcaseType: React.ComponentType<{ showcaseContent?: any }>;
  showcaseContent?: any;
  cursor?: string;
}

type LinkType = 'product' | 'doc';
type SubMenuType = 'products' | 'docs' | null

type ProductMenuTitleProps = {
  icon: React.ReactElement;
  name: React.ReactNode;
  description: React.ReactNode;
  chip?: React.ReactNode;
} & Omit<JSX.IntrinsicElements['div'], 'ref'>;

type ProductMenuItemProps = {
  currentProductId?: string,
  sx?: SxProps<Theme>
};

function getTypeUrl(type: LinkType) {
  return type === 'doc' ? '/docs/' : '/';
}

class Product {
  data: TProduct;

  linkType?: LinkType;

  constructor(product: TProduct, linkType?: LinkType) {
    this.linkType = linkType;
    this.data = product;
  }

  get preview() {
    return this.data.preview;
  }

  get productRoutes(): { [key: string]: string } {
    const routes: { [key: string]: string } = {};
    routeTypes.forEach(type => {
      routes[type as string] = this.url(type);
    });
    return routes;
  }
  get cursor(): string {
    return this.data.cursor ?? 'default';
  }
  get showcaseType(): React.ComponentType<{showcaseContent?: any}> {
    return this.data.showcaseType;
  }

  private getFeature(feature: TFeature): FEATURE {
    return {
      ...feature,
      route: (type: RouteType) => this.url(type, feature.id, feature.productId),
    };
  }

  get features(): FEATURE[] {
    return this.data.features?.map(f => this.getFeature(f)) || [];
  }

  menuItem(type: SubMenuType, props: ProductMenuItemProps) {
    const { currentProductId, sx } = props;
    const product = type === 'products';
    const showFeatures = !(product && this.data.hideProductFeatures);
    return (
      <Box
        key={this.id}
        component="li"
        role="none"
        sx={(theme) => ({
          p: 2, pr: 3,
          '&:hover': {
            backgroundColor: 'red',
          },
          ...theme.applyDarkStyles({
            '&:hover': {
              backgroundColor: alpha('pink', 0.4),
            },
          }),
        })}
      >
        <Box
          component={Link}
          href={this.url(type === 'docs' ? 'doc' : 'product')}
          sx={[
            {
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          {this.icon}
          <Box sx={{ flexGrow: 1 }}>
            <Typography color="text.primary" variant="body2" fontWeight="700">
              {this.name}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {this.description}
            </Typography>
          </Box>
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="flex-start"
          spacing={1}
          sx={{
            ml: '36px',
            pl: 2,
            pt: 1.5,
            position: 'relative',
            '& > .MuiChip-root': {
              position: 'initial',
              '&:hover': {
                '& .product-description': {
                  opacity: 1,
                },
              },
            },
          }}
        >
          {showFeatures && this.features.map((feature) => (
            <Chip
              key={feature.name}
              color={currentProductId === this.id ? 'primary' : undefined}
              variant={currentProductId === this.id ? 'filled' : 'outlined'}
              component={Link}
              href={this.url(type === 'docs' ? 'doc' : 'product', feature.id, feature.productId)}
              label={feature.name}
              clickable
              size="small"
            />
          ))}
        </Stack>
      </Box>
    );
  }

  subMenuItem() {
    return (
      <Box
        role={"menuitem"}
        sx={[
          {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          },
          // ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {this.icon}
        <Box sx={{ flexGrow: 1 }}>
          <Typography color="text.primary" sx={{ display: "flex", flexDirection: "row"}} variant="body2" fontWeight="700">
            {this.name}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {this.description}
          </Typography>
        </Box>
      </Box>
    )
  }

  selectorItem(context: any) {
    return (
      <Box
        component="li"
        role="none"
        sx={{ p: 2, pr: 3}}
      >
        {this.subMenuItem()}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="flex-start"
          spacing={1}
          sx={{
            ml: '36px',
            pl: 2,
            pt: 1.5,
            position: 'relative',
            '& > .MuiChip-root': {
              position: 'initial',
              '&:hover': {
                '& .product-description': {
                  opacity: 1,
                },
              },
            },
          }}
        >
          {this.features.map((feature) => (
            <Chip
              key={feature.name}
              color={context.productId === this.id ? 'primary' : undefined}
              variant={context.productId === this.id ? 'filled' : 'outlined'}
              component={Link}
              href={feature.route?.('doc') ?? ''}
              label={feature.name}
              clickable
              size="small"
            />
          ))}
        </Stack>
      </Box>
    )
  }

   highlightedItem(productIndex: number, setProductIndex: React.Dispatch<React.SetStateAction<number>>, index: number, direction: 'row' | 'column', linkType?: LinkType, sx?: SxProps<Theme>) {
    return (<Highlighter
      key={this.id}
      disableBorder
      onClick={() => setProductIndex(index)}
      selected={productIndex === index}
      sx={[...(Array.isArray(sx) ? sx : [sx]), {
        maxHeight: direction === 'row' ? 75 : 88,
      }]}
    >
      {this.item(this.link(linkType), direction, index, productIndex)}
    </Highlighter>);
  }

  item(linkType: LinkType, direction: 'row' | 'column', index: number, selected: number) {
    return (
      <Box
        component="div"
        sx={{
          display: 'flex',
          p: 2,
          flexDirection: 'row',
          alignItems: { md: 'center' },
          gap: 2.5,
         
        }}
      >
        <span>{index !== undefined ? this.key(index, selected) : this.icon}</span>
        <span>
          <Typography
            component="span"
            color="text.primary"
            variant="body2"
            fontWeight="bold"
            display="block"
          >
            {this.name}
          </Typography>
          <Typography
            component="span"
            color="text.secondary"
            variant="body2"
            fontWeight="regular"
            display="block"
            sx={{ my: 0.5 }}
          >
            {this.description}
          </Typography>
        </span>
      </Box>
    );
  }

  url(type: LinkType, suffix: string = '', productId?: string) {
    if (productId) {
      return `/${productId}${getTypeUrl(type)}${suffix}`
    }
    return `${this.data.url}${getTypeUrl(type)}${suffix}`;
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get description() {
    return this.data.description;
  }

  get icon() {
    return <IconImage name={this.data.icon } />;
  }

  key(index: number, selected: number) {
    return <KeyIcon indexKey={index} selected={selected} />;
  }

  get docHref() {
    return ROUTES[`${this.data.id}Docs`];
  }

  get href() {
    return ROUTES[this.data.id];
  }

  private link(linkType?: LinkType) {
    return this.linkType ?? linkType ?? 'product';
  }

  route(linkType?: LinkType) {
    return this.link(linkType) ? this.href : this.docHref;
  }
}


type ProductSwipeableProps = ProductsComponentProps & {
  show: boolean;
  products: Products;
}

class IndexObject<T> {
  index: { [key: string]: T } = {};

  constructor(key: string, inputArray: T[] = [],) {
    inputArray.forEach((obj: T) => {
      const id = (obj[key as keyof T] as string);
      this.index[id] = obj
    });

    return new Proxy(this, {
      get: (target, property: string) => {
        if (property in target) {
          return target[property as keyof typeof target];
        }
        return target.index[property];
      },
      set: (target, property: string, value) => {
        if (property in target) {
          target[property as keyof typeof target] = value;
        } else {
          target.index[property] = value;
        }
        return true;
      }
    });
  }

  get keys() {
    return Object.keys(this.index);
  }

  get values() {
    return Object.values(this.index);
  }

  get entries() {
    return Object.entries(this.index);
  }
}

const SwipeableViews = dynamic(() => import('react-swipeable-views'), { ssr: false });

type ProductsComponentProps = {
  productIndex: number;
  setProductIndex: React.Dispatch<React.SetStateAction<number>>;
}
type ProductStackProps = ProductsComponentProps & {
  inView?: boolean;
}
type SetSubMenuOpen = React.Dispatch<React.SetStateAction<SubMenuType>>;
type ProductMenuProps =  {
  products: Product[],
  type: SubMenuType,
  subMenuOpen?: SubMenuType,
  menuRef?: React.RefObject<HTMLButtonElement>,
  setSubMenuOpenUndebounce?:  (value: SubMenuType) => () => void,
  setSubMenuOpenDebounced?:  SetSubMenuOpen & Cancelable,
  setSubMenuOpen?: SetSubMenuOpen,
  handleClickMenu?: (value: SubMenuType) => () => void
} & ProductMenuItemProps;

function titleCase(str: string) {
  str = str.replace(/-/g, ' ');
  const result = str.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function SwipeableProducts(props: ProductSwipeableProps) {
  const swipeableProducts = React.useMemo(() => {
    const { show, products, productIndex, setProductIndex } = props;
    const switchIt = (index: number) => {
      setProductIndex(index);
    }
    return (
      <Box sx={{
        display: { md: 'none' },
        maxWidth: 'calc(100vw - 40px)',
        '& > div': { pr: '32%' },
      }}
      >
        {show && (<SwipeableViews
          index={productIndex}
          resistance
          enableMouseEvents
          onChangeIndex={(index) => setProductIndex(index)}
        >
          {products.live.map((product: Product, index: number) => {
           return  product.highlightedItem(productIndex, setProductIndex, index, 'row', 'product', {
              width: '100%',
              transition: '0.3s',
              transform: productIndex !== index ? 'scale(0.9)' : 'scale(1)',
            });
          })}
        </SwipeableViews>)}
      </Box>
    )
  }, [props]);

  return swipeableProducts;
}

function ProductMenu(props: ProductMenuProps) {
  const menu = React.useMemo(() => {
    const {
      type,
      subMenuOpen,
      menuRef,
      setSubMenuOpenUndebounce,
      setSubMenuOpenDebounced,
      handleClickMenu,
      products
    } = props;

    if (!type) {
      return null;
    }
    return <li
      onMouseEnter={setSubMenuOpenUndebounce?.(type)}
      onFocus={setSubMenuOpenUndebounce?.(type)}
      onMouseLeave={() => setSubMenuOpenDebounced?.(null)}
      onBlur={setSubMenuOpenUndebounce?.(null)}
    >
      <ButtonBase
        ref={menuRef}
        aria-haspopup
        aria-expanded={subMenuOpen === type ? 'true' : 'false'}
        onClick={handleClickMenu?.(type)}
        aria-controls={subMenuOpen === type ? 'products-popper' : undefined}
      >
        {titleCase(type)}
      </ButtonBase>
      <Popper
        id="products-popper"
        key={type}
        open={props.subMenuOpen === type}
        anchorEl={props.menuRef?.current}
        transition
        placement="bottom-start"
        style={{
          zIndex: 1200,
          pointerEvents: props.subMenuOpen === type ? undefined : 'none',
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={250} key={'fade'}>
            <Paper
              key={'someKey'}
              variant="outlined"
              sx={(theme) => ({
                mt: 1,
                minWidth: 498,
                overflow: 'hidden',
                borderColor: 'grey.200',
                bgcolor: 'background.paper',
                boxShadow: `0px 4px 16px ${alpha(theme.palette.grey[200], 0.8)}`,
                '& ul': {
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                },
                '& li:not(:last-of-type)': {
                  borderBottom: '1px solid',
                  borderColor: theme.palette.divider,
                },
                '& a': { textDecoration: 'none' },
                ...theme.applyDarkStyles({
                  borderColor: 'primaryDark.700',
                  bgcolor: 'primaryDark.900',
                  boxShadow: `0px 4px 16px ${alpha(theme.palette.common.black, 0.8)}`,
                  '& li:not(:last-of-type)': {
                    borderColor: 'primaryDark.700',
                  },
                }),
              })}
            >
              <ul>
                {products.map((product: Product) => {
                  return product.menuItem(type, props);
                })}
              </ul>
            </Paper>
          </Fade>
        )}
      </Popper>
    </li>
  }, [props]);
  return menu;
}

type ProductSwitcherProps = ProductStackProps & {
  products: Products;
}

function ProductsSwitcher(props: ProductSwitcherProps) {
  const { inView = false, productIndex, setProductIndex, products } = props;
  const isBelowMd = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <React.Fragment>
      {products.swipeable({ show: isBelowMd && inView, productIndex, setProductIndex } as ProductSwipeableProps)}
      {products.stack(props)}
    </React.Fragment>
  );
}

function ProductsPreviews({ products, mostRecentPosts }: { products: Products, mostRecentPosts?: BlogPost[] } ) {
  const [productIndex, setProductIndex] = React.useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: '0px 50px',
  });
  const Showcase = products.live[productIndex].showcaseType;
  const content = products.live[productIndex].name === '.plan' ? mostRecentPosts : products.products?.[productIndex]?.data?.showcaseContent;
  const showcaseProps = { showcaseContent: content};

  return (
    <Section bg="gradient" ref={ref}>

      <Grid container spacing={'24px'}>
        <Grid item md={6}>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, }}>
            <Typography variant="h1" mb={1} className={'stoked-font'} sx={{ fontSize:  { xs: 36, sm: 46, md: 56, lg: 66 }, marginBottom: { xs: 1, sm: 2, md: 3, lg: 4 }}}>
              BRIAN <br/><GradientText>STOKER</GradientText>
            </Typography>
          </Box>
          {products.switcher({ inView, productIndex, setProductIndex })}
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
        >
          {inView ? (
            <Box 
              component={Link}
              href={products.live[productIndex].url('product')}
              sx={{
                cursor: `${products.live[productIndex].cursor}!important`,
                 display: 'flex'
              }}
            >
              <Showcase {...showcaseProps}/>
            </Box>
          ) : (
            <Box sx={{ height: { xs: 0, md: 803 } }} />
          )}
        </Grid>
      </Grid>
    </Section>
  );
}

class Products extends IndexObject<Product> {

  constructor(products: (TProduct | Product)[] = []) {
    const baseInput = products.map((product) => {
      if (product instanceof Product) {
        return product;
      }
      return new Product(product);
    });
     super('id',baseInput);
  }

  get products() {
    return Object.values(this.index);
  }

  get live() {
    return Object.values(this.index).filter(product => product.data.live);
  }

  get pages() {
    return this.live.map(p => p.url('product'));
  }

  preview(params: { productId: string }) {
    const source = this.index[params.productId].preview;
    if (source.image) {
      return <img src={source.image}  />
    }
    if (source.video) {
      return <video src={source.video}  />
    }
  }

  public previews({mostRecentPosts}: { mostRecentPosts?: BlogPost[]}) {
    return <ProductsPreviews products={this} mostRecentPosts={mostRecentPosts} />;
  }

  public switcher(props: ProductStackProps) {
    return <ProductsSwitcher {...props} products={this} />;
  }

  public swipeable(props: ProductSwipeableProps) {
    return <SwipeableProducts {...props} products={this} />
  }

  getFeatureUrl(productId: string, featureId: string, type: LinkType = 'doc') {
    const product = this.index[productId];
    const feature = product.features.find((f: FEATURE) => f.id === featureId);
    if ( !feature) {
      return '';
    }
    return product.url(type, feature.productId ?? feature.id);
  }

  productSelector(context: PageContextType) {
    return (
      <React.Fragment>

          {this.live.map((product: Product) => {
            return  product.selectorItem(context);
          })}
      </React.Fragment>
    )
  }

  menu(props: Omit<ProductMenuProps, 'products'> ) {
    const menuProps = { ...props, products: this.live };
    return <ProductMenu { ...menuProps } />
  }

  stack(props: ProductStackProps) {
    const { productIndex, setProductIndex } = props;
    return (<Stack spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, maxWidth: 500, maxHeight: 520 }}>
      {this.live.map((product, index) => {
        return product.highlightedItem(productIndex, setProductIndex, index, 'column' );
      })}
    </Stack>)
  }
}

const stokedConsultingData: TProduct = {
  id: 'stoked-consulting',
  name: "Stoked Consulting",
  fullName: "Stoked Consulting Services",
  description: "Full stack consulting services.",
  icon: "product-templates",
  url: "/consulting",
  live: true,
  showcaseType: CustomerShowcase,
  features: [
    {
      name: 'Front End',
      description: 'UI design and development services.',
      id: 'front-end',
    }, {
      name: 'Backend',
      description: 'Backend architecture and development services.',
      id: 'backend',
    }, {
      name: 'Fullstack',
      description: 'Full stack development services.',
      id: 'fullstack',
    }
  ],
};

const stokedConsulting = new Product(stokedConsultingData);
const stokedUiData: TProduct = {
  id: 'stoked-ui',
  name: "Stoked UI",
  fullName: "Stoked UI",
  description: "Advanced media components MIT",
  icon: "product-designkits",
  url: "/stoked-ui",
  showcaseType: MaterialShowcase,
  hideProductFeatures: true,
  live: true,
  features: [{
    name: 'Introduction',
    description: 'Overview, installation, lions, tigers, and bears oh mai!',
    id: 'overview',
  }, {
    name: 'File Explorer',
    description: 'Highly extensible file explorer component with drag and drop support.',
    productId: 'file-explorer',
    id: 'overview',
  }, {
    name: 'Timeline',
    description: 'Timeline component is used to construct tools that manipulate things over time.',
    productId: 'timeline',
    id: 'overview',
  }, {
    name: 'Editor',
    description: 'Editor contains components intended for use as raw building blocks for tools that can edit.. THEM THANGS..',
    productId: 'editor',
    id: 'overview',
  }],
};
const sui = new Product(stokedUiData);
const fileExplorerData: TProduct = {
  id: 'file-explorer',
  name: "File Explorer",
  fullName: "Stoked UI: File Explorer",
  description: "Advanced media components",
  icon: "product-core",
  url: "/file-explorer",
  hideProductFeatures: true,
  live: true,
  showcaseType: CoreShowcase,
  features: [{
    name: 'Overview',
    description: 'Overview, installation, lions, tigers, and bears oh mai!',
    id: 'overview',
  }, {
    name: 'File Explorer Basic',
    description: 'Library used to select and automatically pull appropriate meta data from client side files',
    id: 'file-explorer-basic/items',
  }, {
    name: 'File Explorer',
    description: 'Highly extensible file explorer component with drag and drop support.',
    id: 'file-explorer/items',
  }, {
    name: 'Roadmap',
    description: 'See what\'s next',
    id: 'roadmap',
  }],
};
const fileExplorer = new Product(fileExplorerData);

const coreData: TProduct = {
  id: 'core',
  name: "Core",
  fullName: "Stoked UI: Core",
  description: "Stoked UI is an open-source React component library that implements Google's Material Design. It's comprehensive and can be used in production out of the box.",
  icon: "product-advanced",
  url: "/media-selector",
  hideProductFeatures: true,
  live: true,
  showcaseType: CoreShowcase,
  features: [{
    name: 'Overview',
    description: 'Overview, installation, lions, tigers, and bears oh mai!',
    id: 'overview',
  }, {
    name: 'FileWithPath',
    description: 'Library used to select and automatically pull appropriate meta data from client side files',
    id: 'file-with-path',
  }, {
    name: 'IdGenerator',
    description: 'Highly extensible file explorer component with drag and drop support.',
    id: 'id-generator',
  }, {
    name: 'Roadmap',
    description: 'What&apos;s next',
    id: 'roadmap',
  }],
};
const core = new Product(coreData);

const mediaSelectorData: TProduct = {
  id: 'media-selector',
  name: "Media Selector",
  fullName: "Stoked UI: Media Selector",
  description: "Library used to select and gather type specific meta data from client side files",
  icon: "product-advanced",
  url: "/media-selector",
  hideProductFeatures: true,
  live: true,
  showcaseType: CoreShowcase,
  features: [{
    name: 'Overview',
    description: 'Overview, installation, lions, tigers, and bears oh mai!',
    id: 'overview',
  }, {
    name: 'FileWithPath',
    description: 'Library used to select and automatically pull appropriate meta data from client side files',
    id: 'file-with-path',
  }, {
    name: 'IdGenerator',
    description: 'Highly extensible file explorer component with drag and drop support.',
    id: 'id-generator',
  }, {
    name: 'Roadmap',
    description: 'What&apos;s next',
    id: 'roadmap',
  }],
};
const mediaSelector = new Product(mediaSelectorData);
const timelineData: TProduct = {
  id: 'timeline',
  name: "Timeline",
  fullName: "Stoked UI: Timeline",
  description: "Timeline component is used to construct tools that manipulate things over time",
  icon: "product-toolpad",
  url: "/timeline",
  hideProductFeatures: true,
  live: true,
  showcaseType: CoreShowcase,
  features: [{
    name: 'Overview',
    description: 'Overview, installation, lions, tigers, and bears oh mai!',
    id: 'overview',
  }, {
    name: 'Timeline',
    description: 'Component useful in creating components capable of editing something over time or at key frames',
    id: 'timeline',
  },
  /*
     {
    name: 'Timeline Engine',
    description: 'Main game loop',
    id: 'timeline-engine',
  }, {
    name: 'Timeline Action',
    description: 'I&apos;m Jack&apos;s complete lack of surprise.',
    id: 'timeline-action',
  }
  */],
};
const timeline = new Product(timelineData);
const videoEditorData: TProduct = {
  id: 'editor',
  name: "Editor",
  fullName: "Stoked UI: Editor",
  description: "Editor contains components intended for use as raw building blocks for tools that can.. well.. EDIT things.",
  icon: "product-templates",
  url: "/editor",
  hideProductFeatures: true,
  live: true,
  showcaseType: MaterialShowcase,
  features: [{
    name: 'Overview',
    description: 'Overview, installation, lions, tigers, and bears oh mai!',
    id: 'overview',
  }, {
    name: 'Editor',
    description: 'Library used to select and automatically pull appropriate meta data from client side files',
    id: 'editor',
  }],
};
const videoEditor = new Product(videoEditorData);
const artData: TProduct = {
  id: 'art',
  name: "Art",
  fullName: "BRIAN STOKER: Art",
  description: "Acrylic on Canvas and random things",
  icon: "product-toolpad",
  url: ROUTES.art,
  preview: {
    image: '/img/brian-art.png'
  },
  showcaseType: ImageShowcase,
  showcaseContent: '/static/art/wild-eyes.jpg',
  live: true,
  cursor: 'pointer'
}

const art = new Product(artData);

const photographyData: TProduct = {
  id: 'photography',
  name: "Photography",
  fullName: "BRIAN STOKER: Photography",
  description: "Them thangs",
  icon: "product-core",
  url: ROUTES.photography,
  preview: {
    image: '/static/photography/bed-selfie.jpg'
  },
  showcaseType: ImageShowcase,
  showcaseContent: '/static/photography/bed-selfie.jpg',
  live: true,
  cursor: 'grab'
}

const photography = new Product(photographyData);


const drumsData: TProduct = {
  id: 'drums',
  name: "Drums",
  fullName: "BRIAN STOKER: Drums",
  description: "\"I like to play\" - Garth",
  icon: "product-designkits",
  url: ROUTES.drums,
  preview:{
    video: 'https://cenv-public.s3.amazonaws.com/tell-me-mister-2.mp4'
  },
  showcaseType: VideoShowcase,
  showcaseContent: {
    src: 'https://cenv-public.s3.amazonaws.com/tell-me-mister-2.mp4',
    poster: '/static/photography/tell-me-mister.png',
    title: 'Tell Me Mister'
  },
  live: true,
  cursor: 'help'
}

const drums = new Product(drumsData);


const workData: TProduct = {
  id: 'work',
  name: "Work",
  fullName: "Work",
  description: "This is where I work. Say hi to the codez.",
  icon: "1",
  url: ROUTES.work,
  preview: {
    text: 'recalcitrant robot\n' + '@brianstoker\n' + '·\n' + 'Feb 15, 2021\n' + '#atx #snowboarding #merica @ Auditorium Shores https://www.instagram.com/p/CLVQg7ql34O4prJIa6hpXGg-RaupDXP0THly3A0/'
  },
  showcaseType: GithubEventsShowcase,
  showcaseContent: { eventsPerPage: 10, hideMetadata: true },
  live: true,
  cursor: 'wait'
}

const work = new Product(workData);

const planData: TProduct = {
  id: 'plan',
  name: ".plan",
  fullName: ".plan (brian stoker)",
  description: "Random musings probably not worth mentioning",
  icon: "2",
  url: ROUTES.plan,
  preview: {
    text: 'recalcitrant robot\n' + '@brianstoker\n' + '·\n' + 'Feb 15, 2021\n' + '#atx #snowboarding #merica @ Auditorium Shores https://www.instagram.com/p/CLVQg7ql34O4prJIa6hpXGg-RaupDXP0THly3A0/'
  },
  showcaseType: BlogShowcase,
  showcaseContent: {},
  live: true,
  cursor: 'crosshair'
}

const plan = new Product(planData);

const resumeData: TProduct = {
  id: 'resume',
  name: "Resume",
  fullName: "BRIAN STOKER: Resume",
  description: "Keeping my eyes open for my next big project.",
  icon: "3",
  url: ROUTES.resume,
  preview:{
    image: 'https://cenv-public.s3.amazonaws.com/resume-preview.png'
  },
  showcaseType: PdfShowcase,
  live: true,
  cursor: 'zoom-in'
}

const resume = new Product(resumeData);

const PRODUCTS: Products = new Products([work, art, photography, drums, resume, plan]);

type MenuProps = {
  linkType: LinkType,
  sx?: SxProps<Theme>,
};

export { PRODUCTS }

