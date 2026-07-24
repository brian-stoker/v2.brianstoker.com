#!/usr/bin/env node
/**
 * TDD for scripts/update-cloudfront-origins.cjs resolveDistributionId().
 * Plain-node test (no jest/vitest harness in this repo). Run:
 *   node scripts/__tests__/pick-distribution.test.cjs
 * Exits 0 on pass, non-zero on failure.
 */
const assert = require('assert');
const { resolveDistributionId } = require('../update-cloudfront-origins.cjs');

// Real CloudFront list-distributions shape (trimmed): the brian.stokd.cloud
// distribution carries both the apex and www aliases.
const distributions = [
  { Id: 'E7QQUQFSZOE26', Aliases: { Items: ['stokd.cloud'] } },
  { Id: 'E1QWP1HD4NVHFM', Aliases: { Items: ['stage.stokd.cloud'] } },
  { Id: 'E1JN9JWBQ37JT2', Aliases: { Items: ['www.brian.stokd.cloud', 'brian.stokd.cloud'] } },
];

// (a) discovers by domain alias
assert.strictEqual(
  resolveDistributionId({ distributions, domains: ['brian.stokd.cloud', 'www.brian.stokd.cloud'] }),
  'E1JN9JWBQ37JT2',
  'should resolve the distribution whose aliases include the site domain'
);

// (b) explicit envId (e.g. the SST deploy-time output) wins over discovery
assert.strictEqual(
  resolveDistributionId({ envId: 'EOVERRIDE123', distributions, domains: ['brian.stokd.cloud'] }),
  'EOVERRIDE123',
  'envId must take precedence over domain discovery'
);

// (c) no matching alias -> throws (never silently invalidate the wrong/no distribution)
assert.throws(
  () => resolveDistributionId({ distributions, domains: ['nope.example.com'] }),
  /No CloudFront distribution/i,
  'should throw when no distribution matches any target domain'
);

// (d) empty envId is ignored (falls through to discovery)
assert.strictEqual(
  resolveDistributionId({ envId: '', distributions, domains: ['brian.stokd.cloud'] }),
  'E1JN9JWBQ37JT2',
  'empty envId must not short-circuit discovery'
);

console.log('PASS pick-distribution.test.cjs');
