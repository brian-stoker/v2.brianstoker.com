
export const getDomains = (rootDomain: string, stage: string) => {
  if (stage === 'production') {
    return [rootDomain, `www.${rootDomain}`];
  }
  return [`${stage}.${rootDomain}`, `*.${stage}.${rootDomain}`];
}

export const getDomainInfo = (rootDomain: string, stage: string) => {
  const resourceName = `${rootDomain.replace(/\./g, '')}StaticSite`;
  const appName = `${rootDomain.replace(/\./g, '-')}`;
  const domains = getDomains(rootDomain, stage);
  const parts = rootDomain.split('.');
  parts.pop();
  parts.push(stage);
  const dbName = parts.join('-');
  return { resourceName, appName, domains, dbName };
}

export interface DomainInfo {
  resourceName: string;
  appName: string;
  domains: string[];
  dbName: string;
}
