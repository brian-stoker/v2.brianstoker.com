#!/usr/bin/env node

/**
 * Repoints the CloudFront distribution from the (broken) Lambda Function URLs to
 * API Gateway HTTP APIs that proxy the same Lambdas.
 *
 * Lambda Function URLs are broken in AWS account 167217327520 (they return 403
 * regardless of auth type), so the site is served via API Gateway instead. SST
 * does not manage these API Gateways or the CloudFront origin overrides, so this
 * script must run after every `sst deploy` to reconverge the distribution.
 *
 * It is fully self-contained and idempotent:
 *   - discovers the server + image-optimizer Lambdas by name pattern
 *   - discovers-or-creates one HTTP API per Lambda (AWS_PROXY, $default route/stage)
 *   - ensures the apigateway invoke permission on each Lambda
 *   - repoints the CloudFront `default` and `imageOptimizer` origins at the APIs
 *     (custom https-only origin, OAC removed)
 *   - invalidates the cache
 *
 * Usage:
 *   AWS_PROFILE=stokd-cloud node scripts/update-cloudfront-origins.js
 */

const { execSync } = require('child_process');
const fs = require('fs');

const DISTRIBUTION_ID = 'E1JN9JWBQ37JT2';
const AWS_PROFILE = process.env.AWS_PROFILE || 'stokd-cloud';
const REGION = 'us-east-1';

// originId -> { apiName, fnPattern, statementId }
const ORIGINS = {
  default: {
    apiName: 'brian-stokd-cloud-nextjs-proxy',
    fnPattern: 'brianstokdcloudNextjsSiteDefaultFunction',
    statementId: 'apigw-nextjs-proxy',
  },
  imageOptimizer: {
    apiName: 'brian-stokd-cloud-imageopt-proxy',
    fnPattern: 'brianstokdcloudNextjsSiteImageOptimizerFunction',
    statementId: 'apigw-imageopt-proxy',
  },
};

function aws(command, { json = true } = {}) {
  const full = `aws --profile ${AWS_PROFILE} --region ${REGION} ${command}`;
  const out = execSync(full, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
  return json ? JSON.parse(out) : out;
}

function awsAllow(command) {
  // Run a command but tolerate failure (e.g. permission already exists)
  try {
    return aws(command);
  } catch (e) {
    return null;
  }
}

function accountId() {
  return aws('sts get-caller-identity').Account;
}

function findLambda(pattern) {
  const res = aws('lambda list-functions --max-items 1000');
  const fn = (res.Functions || []).find((f) => f.FunctionName.includes(pattern));
  if (!fn) throw new Error(`No Lambda found matching pattern: ${pattern}`);
  return fn;
}

function findApiByName(name) {
  const res = aws('apigatewayv2 get-apis');
  return (res.Items || []).find((a) => a.Name === name) || null;
}

function ensureApi({ apiName, fnArn }) {
  let api = findApiByName(apiName);
  if (!api) {
    console.log(`  Creating HTTP API: ${apiName}`);
    const created = aws(
      `apigatewayv2 create-api --name ${apiName} --protocol-type HTTP --target ${fnArn}`
    );
    api = { ApiId: created.ApiId, ApiEndpoint: created.ApiEndpoint, Name: apiName };
  } else {
    console.log(`  Reusing HTTP API: ${apiName} (${api.ApiId})`);
  }
  return api;
}

function ensurePermission({ fnName, statementId, apiId, account }) {
  // Remove-then-add keeps the source ARN current and idempotent. The add MUST
  // succeed (a swallowed failure leaves the Lambda with no invoke permission and
  // every request 500s), so only the remove is allowed to fail.
  awsAllow(`lambda remove-permission --function-name ${fnName} --statement-id ${statementId}`);
  const sourceArn = `arn:aws:execute-api:${REGION}:${account}:${apiId}/*/*`;
  aws(
    `lambda add-permission --function-name ${fnName} --statement-id ${statementId} ` +
      `--action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "${sourceArn}"`
  );
}

function getDistribution() {
  const res = aws(`cloudfront get-distribution-config --id ${DISTRIBUTION_ID}`);
  return { config: res.DistributionConfig, etag: res.ETag };
}

function updateDistribution(config, etag) {
  const tmp = '/tmp/cloudfront-config.json';
  fs.writeFileSync(tmp, JSON.stringify(config));
  aws(
    `cloudfront update-distribution --id ${DISTRIBUTION_ID} --if-match ${etag} ` +
      `--distribution-config file://${tmp}`
  );
  fs.unlinkSync(tmp);
}

function main() {
  console.log('🔄 Repointing CloudFront origins at API Gateway...\n');

  // 1. Ensure an API Gateway exists for each origin, capture its domain.
  const account = accountId();
  const domains = {};
  for (const [originId, cfg] of Object.entries(ORIGINS)) {
    console.log(`Origin "${originId}":`);
    const fn = findLambda(cfg.fnPattern);
    console.log(`  Lambda: ${fn.FunctionName}`);
    const api = ensureApi({ apiName: cfg.apiName, fnArn: fn.FunctionArn });
    ensurePermission({ fnName: fn.FunctionName, statementId: cfg.statementId, apiId: api.ApiId, account });
    domains[originId] = `${api.ApiId}.execute-api.${REGION}.amazonaws.com`;
    console.log(`  Domain: ${domains[originId]}\n`);
  }

  // 2. Update the CloudFront origins.
  const { config, etag } = getDistribution();
  let changed = false;
  for (const origin of config.Origins.Items) {
    if (!domains[origin.Id]) continue;
    origin.DomainName = domains[origin.Id];
    origin.OriginAccessControlId = '';
    origin.OriginPath = '';
    delete origin.S3OriginConfig;
    origin.CustomOriginConfig = {
      HTTPPort: 80,
      HTTPSPort: 443,
      OriginProtocolPolicy: 'https-only',
      OriginSslProtocols: { Quantity: 1, Items: ['TLSv1.2'] },
      OriginReadTimeout: 30,
      OriginKeepaliveTimeout: 5,
    };
    changed = true;
    console.log(`Set origin "${origin.Id}" -> ${origin.DomainName}`);
  }
  if (!changed) {
    console.log('No matching origins found; nothing to update.');
    return;
  }
  updateDistribution(config, etag);
  console.log('\n📤 CloudFront updated. Invalidating cache...');
  aws(`cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*"`);
  console.log('✅ Done. Changes take a few minutes to propagate.');
}

main();
