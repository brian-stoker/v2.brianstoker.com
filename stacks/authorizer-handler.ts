/**
 * API Gateway Lambda Authorizer
 *
 * Validates the x-cloudfront-secret header to ensure requests only come through CloudFront.
 * Returns a simple boolean response indicating allow/deny.
 */

export const handler = async (event: any) => {
  console.log('Authorizer invoked:', JSON.stringify(event, null, 2));

  const expectedSecret = process.env.CLOUDFRONT_SECRET;
  const providedSecret = event.headers?.['x-cloudfront-secret'];

  console.log('Expected secret exists:', !!expectedSecret);
  console.log('Provided secret exists:', !!providedSecret);

  // Use simple response format (boolean)
  const isAuthorized = providedSecret === expectedSecret;

  console.log('Authorization result:', isAuthorized);

  return {
    isAuthorized,
  };
};
