/// <reference path="../.sst/platform/config.d.ts" />

export const createHalBucket = () => {
  const bucket = new sst.aws.Bucket("HalBucket");
  return bucket;
};
