import * as React from 'react';
import type {MuiPage} from 'src/MuiPage';
import type {MuiProductId} from 'src/modules/utils/getProductInfoFromUrl';

const PageContext = React.createContext<{
  activePage: MuiPage | null;
  pages: MuiPage[];
  productId: MuiProductId;
}>(undefined!);

if (process.env.NODE_ENV !== 'production') {
  PageContext.displayName = 'PageContext';
}

export default PageContext;
