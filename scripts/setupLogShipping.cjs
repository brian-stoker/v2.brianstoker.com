const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const LOGS_DIR = path.join(process.env.HOME, ".openclaw", "logs");
const FILES = [
  { local: "gateway.log", key: "logs.txt" },
  { local: "gateway.err.log", key: "errors.txt" },
];

const setupLogShipping = async () => {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    console.error("Error: S3_BUCKET_NAME environment variable is not set.");
    process.exit(1);
  }

  const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });

  for (const { local, key } of FILES) {
    const filePath = path.join(LOGS_DIR, local);
    if (!fs.existsSync(filePath)) {
      console.warn(`Skipping ${local} (not found)`);
      continue;
    }

    console.log(`Uploading ${local} to s3://${bucketName}/${key}...`);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fs.readFileSync(filePath),
        ContentType: "text/plain",
      })
    );
  }

  console.log("Log shipping complete.");
};

setupLogShipping().catch((err) => {
  console.error("Error shipping logs:", err.message);
  process.exit(1);
});
