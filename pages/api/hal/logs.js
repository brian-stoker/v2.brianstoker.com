import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
  const bucket = process.env.S3_BUCKET_NAME;

  const fetchKey = async (key) => {
    try {
      const data = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      return await data.Body.transformToString();
    } catch (error) {
      if (error.name === "NoSuchKey") return null;
      throw error;
    }
  };

  try {
    const [logs, errors] = await Promise.all([
      fetchKey("logs.txt"),
      fetchKey("errors.txt"),
    ]);
    res.status(200).json({
      logs: logs || "No logs available yet.",
      errors: errors || null,
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
}
