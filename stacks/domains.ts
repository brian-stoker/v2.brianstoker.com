
export const getDomains = (rootDomain: string, stage: string) => {
  if (stage === 'production') {
    return [rootDomain, `www.${rootDomain}`];
  }
  return [`${stage}.${rootDomain}`, `*.${stage}.${rootDomain}`];
}

export const getDomainInfo = (rootDomains: string, stage: string): DomainInfo => {
  const rootDomainParts = rootDomains.split(',');
  let domains:any = rootDomainParts.map((domain) => getDomains(domain, stage)).flat();
  domains = domains.flat(Infinity);
  const appName = `${domains[0].replace(/\./g, '-')}`;
  const parts = domains[0].split('.');
  parts.pop();
  parts.push(stage);
  const dbName = parts.join('-');
  const subDomain = process.env.SUB_DOMAIN ? `${process.env.SUB_DOMAIN}.${domains[0]}` : domains[0];
  const apiDomain = `api.${domains[0]}`;
  const chatDomain = `chat.${domains[0]}`;
  const resourceName = `${domains[0].replace(/\./g, '')}NextjsSite`;
  const originIds = domains.map((domain: string) => `${domain.replace(/\./g, '-')}OriginId`);
  const retVal = { originIds, chatDomain, resourceName, apiDomain, appName, domains: $dev ? [process.env.LOCAL_DOMAIN!]: domains, dbName };
  console.log('domainInfo', retVal);
  return retVal;
}

export interface DomainInfo {
  resourceName: string;
  appName: string;
  domains: string[];
  dbName: string;
  apiDomain: string;
  chatDomain: string;
  originIds: string[];
}
