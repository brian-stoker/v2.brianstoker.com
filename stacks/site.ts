import {pickProperties} from "../utils/types";
import {DomainInfo} from "./domains";

export const createSite = (domainInfo: DomainInfo) => {
  const { env } = process;
  const envVarKeys = [
    "NEXT_PUBLIC_WEB_URL",
    "MONGODB_URI",
    "MONGODB_NAME",
    "MONGODB_USER",
    "MONGODB_PASS",
    "SST_STAGE",
  ];
  const envVars = pickProperties(env, envVarKeys);
  const validateEnvVars = Object.values(envVars).every((v) => v);
  if (!validateEnvVars) {
    throw new Error(
      `Missing environment variable(s) => ${Object.entries(envVars)
        .filter(([key, value]) => !value)
        .map(([key, value]) => key)
        .join(", ")}`,
    );
  }
  const nextJsSite = new sst.aws.Nextjs(domainInfo.resourceName, {
    path: ".",
    buildCommand: "pnpm build:static",
    domain: !$dev
      ? {
          name: domainInfo.domains[0],
          aliases: domainInfo.domains.slice(1),
        }
      : undefined,
    environment: {
      ...(envVars as Record<string, string>),
    },
    permissions: [
      {
        actions: ["*"],
        resources: ["*"],
      },
    ],
    assets: {
      textEncoding: "utf-8",
      fileOptions: [
        {
          files: "**!/!*.mp4",
          contentType: "video/mp4",
          cacheControl: "public,max-age=31536000,immutable",
        },
        {
          files: "**!/!*.webm",
          contentType: "video/webm",
          cacheControl: "public,max-age=31536000,immutable",
        },
        {
          files: "**!/!*.mov",
          contentType: "video/quicktime",
          cacheControl: "public,max-age=31536000,immutable",
        },
        {
          files: "**!/!*.mp3",
          contentType: "audio/mp3",
          cacheControl: "public,max-age=31536000,immutable",
        },
        {
          files: "**!/!*.m4a",
          contentType: "audio/m4a",
          cacheControl: "public,max-age=31536000,immutable",
        },
        {
          files: [
            "**!/!*.css",
            "**!/!*.js",
            "**!/!*.ico",
            "**!/!*.json",
            "**!/!*.txt",
            "**!/!*.png",
            "**!/!*.jpg",
            "**!/!*.jpeg",
            "**!/!*.gif",
            "**!/!*.svg",
            "**!/!*.webp",
            "**!/!*.woff",
            "**!/!*.woff2",
            "**!/!*.ttf",
            "**!/!*.eot",
            "**!/!*.otf",
          ],
          cacheControl: "max-age=31536000,public,immutable",
        },
        {
          files: "**!/!*.html",
          cacheControl: "max-age=0,no-cache,no-store,must-revalidate",
        },
      ],
    },
  });
  return nextJsSite;
};

