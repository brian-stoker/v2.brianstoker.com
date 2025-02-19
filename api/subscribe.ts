import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SES } from "aws-sdk";
import { Resource } from "sst";
import { v4 as uuidv4 } from "uuid";
import dbClient from "./lib/mongodb";
import {MongoClient} from "mongodb";

const ses = new SES({ region: "us-east-1" });

function subscribeResult(result: APIGatewayProxyResult): APIGatewayProxyResult {
  console.info('result', result);
  return result;
}

async function ensureDatabaseAndCollectionExists(client: MongoClient, dbName: string, collectionName: string) {
  // ✅ Connect to MongoDB
  await client.connect();

  // ✅ Get list of existing databases
  const adminDb = client.db().admin();
  const { databases } = await adminDb.listDatabases();

  // ✅ Check if the database exists
  const databaseExists = databases.some(db => db.name === dbName);

  if (!databaseExists) {
    console.log(`Database ${dbName} does not exist. Creating it implicitly...`);
  }

  // ✅ Get the database
  const db = client.db(dbName);

  // ✅ Ensure the collection exists
  const collections = await db.listCollections().toArray();
  const collectionExists = collections.some(col => col.name === collectionName);

  if (!collectionExists) {
    console.log(`Collection ${collectionName} does not exist. Creating it...`);
    await db.createCollection(collectionName);
  }

  return db;
}

const getVerification = (host: string, token: string, email: string) => {
  const verificationBaseUrl = `https://${host}/verify`;
  const verificationToken = uuidv4();
  return { link:`${verificationBaseUrl}?token=${verificationToken}&email=${email}`, token: verificationToken };
}

export async function subscribe(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!process.env.ROOT_DOMAIN) {
    return subscribeResult({
      statusCode: 400,
      body: JSON.stringify({ message: "ROOT_DOMAIN environment variable is not set and is required" }),
    });
  }

  if (!process.env.DB_NAME) {
    return subscribeResult({
      statusCode: 400,
      body: JSON.stringify({ message: "DB_NAME environment variable is not set and is required" }),
    });
  }

  if (!process.env.ROOT_DOMAIN?.includes(event.headers.origin.replace("https://", ""))) {
    return subscribeResult({
      statusCode: 403,
      body: JSON.stringify({ message: "Forbidden" }),
    });
  }

  if (event.requestContext.http.method !== "POST") {
    return subscribeResult({
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    });
  }

  const { email } = JSON.parse(event.body || "{}");
  if (!email) {
    return subscribeResult({
      statusCode: 400,
      body: JSON.stringify({ message: "Email is required" }),
    });
  }

  try {
    // ✅ Ensure the database and collection exist
    const db = await ensureDatabaseAndCollectionExists(dbClient, process.env.DB_NAME, "subscribers");
    const collection = db.collection("subscribers");

    const existing = await collection.findOne({ email });
    const verification = getVerification(event.headers.host, uuidv4(), email);

    if (existing) {
      if (!existing.verified) {
        await collection.updateOne({ email }, { $set: { verificationToken: verification.token } });
        await sendVerificationEmail(email, verification.link);
        return subscribeResult({
          statusCode: 201,
          body: JSON.stringify({ message: "Email already subscribed but not verified. New verification email sent." }),
        });
      }
      return subscribeResult({
        statusCode: 200,
        body: JSON.stringify({ message: "Email already subscribed and verified" }),
      });
    }

    await collection.insertOne({ email, subscribedAt: new Date(), verificationToken: verification.token });
    await sendVerificationEmail(email, verification.link);

    return subscribeResult({
      statusCode: 201,
      body: JSON.stringify({ message: "Subscription successful. Verification email sent." }),
    });
  } catch (error) {
    console.error(error);
    return subscribeResult({
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    });
  }
}

async function sendVerificationEmail(email: string, verificationLink: string) {
  await ses
    .sendEmail({
      Source: `no-reply@${process.env.ROOT_DOMAIN}`, // Change this to your verified domain
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: "Subscribed to brianstoker.com" },
        Body: {
          Text: { Data: `Click the link to verify your email: ${verificationLink}` },
          Html: { Data: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>` },
        },
      },
    })
    .promise();
}
export async function verify(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const { token, email } = event.queryStringParameters || {};

  if (!process.env.DB_NAME) {
    return {
      statusCode: 301,
      headers: {
        Location: `https://${process.env.ROOT_DOMAIN}/subscription?code=402&email=${email}`,
      },
      body: '',
    };
  }

  if (!token || !email) {
    return {
      statusCode: 301,
      headers: {
        Location: `https://${process.env.ROOT_DOMAIN}/subscription?code=401&email=${email}`,
      },
      body: '',
    };
  }

  try {
    // Check if the user exists
    const db = await ensureDatabaseAndCollectionExists(dbClient, process.env.DB_NAME!, "subscribers");
    const collection = db.collection("subscribers");
    const existing = await collection.findOne({ email });

    if (!existing) {
      return {
        statusCode: 301,
        headers: {
          Location: `https://${process.env.ROOT_DOMAIN}/subscription?code=404&email=${email}`,
        },
        body: '',
      };
    }

    if (existing && existing.verified) {
      return {
        statusCode: 301,
        headers: {
          Location: `https://${process.env.ROOT_DOMAIN}/subscription?code=201&email=${email}&token=${existing.verificationToken}`,
        },
        body: '',
      };
    }

    if (existing.verificationToken !== token) {
      const verification = getVerification(event.headers.host, uuidv4(), email);
      await collection.updateOne({ email }, { $set: { verificationToken: verification.token } });
      await sendVerificationEmail(email, verification.link);

      return {
        statusCode: 301,
        headers: {
          Location: `https://${process.env.ROOT_DOMAIN}/subscription?code=401&email=${email}`,
        },
        body: '',
      };
    }

    await collection.updateOne({ email }, { $set: { verified: true } });

    return {
      statusCode: 301,
      headers: {
        Location: `https://${process.env.ROOT_DOMAIN}/subscription?code=200&email=${email}&token=${existing.verificationToken}`,
      },
      body: '',
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 301,
      headers: {
        Location: `https://${process.env.ROOT_DOMAIN}/subscription?code=500&email=${email}&error=${encodeURIComponent(error as string)}`,
      },
      body: '',
    };
  }
}
