import type {MuiPage} from 'src/MuiPage';

export default function findActivePage(
  currentPages: MuiPage[],
  currentPathname: string,
): { activePage: MuiPage | null; activePageParents: MuiPage[] } {
  const map: Record<string, MuiPage> = {};
  const mapParent: Record<string, MuiPage> = {};

  const pathname = currentPathname
    .replace('/[docsTab]', '')
    .replace('components-api', '')
    .replace('hooks-api', '');

  const traverse = (parent: MuiPage) => {
    (parent.children || []).forEach((child) => {
      const childPathname = child.pathname
        .replace('/[docsTab]', '')
        .replace('components-api', '')
        .replace('hooks-api', '');

      map[childPathname] = child;

      const isChildApiPathname =
        child.pathname.indexOf('components-api') >= 0 || child.pathname.indexOf('hooks-api') >= 0;

      if (!isChildApiPathname && mapParent[childPathname]) {
        throw new Error(`Duplicated pathname ${child.pathname} in pages`);
      }

      if (!isChildApiPathname) {
        mapParent[childPathname] = parent;
      }
      traverse(child);
    });
  };

  traverse({ pathname: '/', children: currentPages });

  const activePage: MuiPage | null = map[pathname] || null;

  const activePageParents: MuiPage[] = [];
  let traversePage: MuiPage | null = activePage;
  while (traversePage && traversePage.pathname !== '/') {
    const parent: MuiPage | undefined = mapParent[traversePage.pathname];
    activePageParents.push(parent);
    traversePage = parent;
  }

  return {
    activePage,
    activePageParents,
  };
}
