import {pickProperties} from "../utils/types";
import {DomainInfo} from "./domains";

export const createSite = (domainInfo: DomainInfo, extraEnv?: Record<string, string>) => {
  const { env } = process;
  const envVarKeys = [
    "NEXT_PUBLIC_WEB_URL",
    "GITHUB_TOKEN",
    "MONGODB_URI",
    "MONGODB_USER",
    "MONGODB_PASS",
    "SST_STAGE",
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "SYNC_SECRET",
    "GOOGLE_CALENDAR_SERVICE_ACCOUNT",
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
    // Pinned, not @latest: an unpinned OpenNext release can change the build
    // gate under us. The flag is required because Next 15.3 is past the
    // vendor's two-year major support window (Next 15.0 shipped 2024-10-21);
    // OpenNext exits 1 without it. Drop the flag when the site moves to Next 16.
    buildCommand:
      "pnpx @opennextjs/aws@4.1.11 build --dangerously-use-unsupported-next-version",
    domain: !$dev
      ? {
          name: domainInfo.domains[0],
          aliases: domainInfo.domains.slice(1),
        }
      : undefined,
    environment: {
      ...(envVars as Record<string, string>),
      GITHUB_USERNAME: env.GITHUB_USERNAME || 'brian-stoker',
      MONGODB_NAME: env.MONGODB_NAME || domainInfo.dbName,
      NEXTAUTH_URL: `https://${domainInfo.domains[0]}`,
      ...extraEnv,
    },
    permissions: [
      {
        actions: ["*"],
        resources: ["*"],
      },
    ],
    transform: {
      // Give the server function headroom over the API Gateway 30s ceiling for
      // slow MongoDB Atlas (M0) reads.
      server: {
        timeout: "30 seconds",
      },
    },
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
