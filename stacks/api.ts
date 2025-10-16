import {pickProperties} from "../utils/types";
import {DomainInfo} from "./domains";

export const createApi = (domainInfo: DomainInfo) => {
  const envVarKeys = [
    "GITHUB_TOKEN",
    "GITHUB_USERNAME",
    "SYNC_SECRET",
    "MONGODB_NAME",
    "MONGODB_QUERY_PARAMS",
    "NEXT_PUBLIC_NEXT_API",
    "NEXT_PUBLIC_WEB_URL",
    "COINBASE_COMMERCE_API_KEY",
    "MONGODB_URI",
  ];
  const envVars = pickProperties(process.env, envVarKeys);
  const validateEnvVars = Object.values(envVars).every((v) => v);
  if (!validateEnvVars) {
    throw new Error(
      `Missing environment variable(s) => ${Object.entries(envVars)
        .filter(([key, value]) => !value)
        .map(([key, value]) => key)
        .join(", ")}`,
    );
  }

  const api = new sst.aws.ApiGatewayV2(
    "Api",
    $dev
      ? {
          cors: {
            allowOrigins: ["*"], // Allow requests from SPA
            allowHeaders: ["Content-Type", "Authorization", "RANGE"],
            allowMethods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
            allowCredentials: false,
          },
        }
      : {
          domain: domainInfo.apiDomain,
          cors: {
            allowOrigins: [
              process.env.NEXTAUTH_URL!,
              process.env.NEXT_PUBLIC_ISSUER!,
              process.env.NEXT_PUBLIC_CHAT_API!,
            ], // Allow requests from SPA
            allowHeaders: ["Content-Type", "Authorization", "RANGE"],
            allowMethods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
            allowCredentials: true,
          },
        },
  );

  /* const emailMsg = JSON.stringify(`{
         Subject: { Data: \`Subscribed to ${domainInfo.domains[0]}\` },
         Body: {
           Text: { Data: \`Click the link to verify your email: \${verificationLink}\` },
           Html: { Data: \`<p>Click <a href='\${verificationLink}'>here</a> to verify your email.</p>\` },
         },
       }`);

   // Add the subscribe function with SES permissions
   const subscribeFunction = new sst.aws.Function("Subscribe", {
     handler: "api/subscribe.subscribe", permissions: [{
       actions: ["ses:SendEmail"], resources: ["arn:aws:ses:us-east-1:883859713095:identity/!*"]
     }], link: [mongoDbUri], environment: {
       ROOT_DOMAIN: domainInfo.domains[0],
       DB_NAME: domainInfo.dbName,
       EMAIL_MESSAGE: emailMsg
     }
   });

   // Add the verify function with SES permissions
   const verifyFunction = new sst.aws.Function("Verify", {
     handler: "api/subscribe.verify", permissions: [{
       actions: ["ses:SendEmail"],
       resources: ["arn:aws:ses:us-east-1:883859713095:identity/!*"]
     }], link: [mongoDbUri],
     environment: {
       ROOT_DOMAIN: domainInfo.domains[0],
       DB_NAME: domainInfo.dbName,
       EMAIL_MESSAGE: emailMsg
     }
   });

   // Add the verify function with SES permissions
   const sendSms = new sst.aws.Function("SendSms", {
     handler: "api/sms.handler",
     permissions: [
       {
         actions: ["sns:Publish"],
         resources: ["*"], // ✅ Allows sending SMS to any SNS topic
       },
     ],
     link: [mongoDbUri],
     environment: {
       ROOT_DOMAIN: domainInfo.domains[0],
     },
   });
 */
  /*api.route("POST /subscribe", subscribeFunction.arn);
  api.route("GET /verify", verifyFunction.arn);
  api.route("POST /sms", sendSms.arn);*/

  return api;
};
