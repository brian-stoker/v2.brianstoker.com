import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SES } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { MongoClient } from "mongodb";
import dbClient from "./lib/mongodb";

const ses = new SES({ region: "us-east-1" });

function subscribeResult(result: APIGatewayProxyResult): APIGatewayProxyResult {
  console.info('result', result);
  return result;
}

function verifyEnvVars(encodedEmail: string) {
  const missingVars: string[] = [];

  if (!process.env.EMAIL_MESSAGE) {
    missingVars.push('EMAIL_MESSAGE');
  }

  if (!process.env.DB_NAME) {
    missingVars.push('DB_NAME');
  }

  if (!process.env.ROOT_DOMAIN) {
    missingVars.push('ROOT_DOMAIN');
  }

  if (missingVars.length > 0) {
    return {
      statusCode: 301,
      headers: {
        Location: `https://${process.env.ROOT_DOMAIN}/subscription?code=401&email=${encodedEmail}&missingVars=${missingVars.join(',')}`,
      },
      body: '',
    };
  }
  return true;
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
    console.info(`Collection ${collectionName} does not exist. Creating it...`);
    await db.createCollection(collectionName);
  }

  return db;
}

const getVerification = (host: string, email: string) => {
  const verificationBaseUrl = `https://${host}/verify`;
  const verificationToken = uuidv4();
  return { link:`${verificationBaseUrl}?token=${verificationToken}&email=${encodeURIComponent(email)}`, token: verificationToken };
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

  if (!event.headers.origin || !process.env.ROOT_DOMAIN?.includes(event.headers.origin?.replace("https://", ""))) {
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
    const verification = getVerification(event.headers.host, email);

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
      Message: JSON.parse(process.env.EMAIL_MESSAGE!),
    })
    .promise();
}

export async function verify(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const { token, email } = event.queryStringParameters || {};

  let encodedEmail: string | null = null;

  if (email) {
     encodedEmail = encodeURIComponent(email);
  }

  if (!token || !encodedEmail) {
    const parts = [];
    if (encodedEmail) {
      parts.push(`email=${encodedEmail}`)
    }
    if (token) {
      parts.push(`token=${token}`);
    }
    return {
      statusCode: 301,
      headers: {
        Location: `https://${process.env.ROOT_DOMAIN}/subscription?code=401&${ parts.join('&') }`,
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
          Location: `https://${process.env.ROOT_DOMAIN}/subscription?code=404&email=${encodedEmail}`,
        },
        body: '',
      };
    }

    if (existing && existing.verified) {
      return {
        statusCode: 301,
        headers: {
          Location: `https://${process.env.ROOT_DOMAIN}/subscription?code=201&email=${encodedEmail}&token=${existing.verificationToken}`,
        },
        body: '',
      };
    }

    if (existing.verificationToken !== token) {
      const verification = getVerification(event.headers.host!, encodedEmail);
      await collection.updateOne({ email }, { $set: { verificationToken: verification.token } });
      await sendVerificationEmail(encodedEmail, verification.link);

      return {
        statusCode: 301,
        headers: {
          Location: `https://${process.env.ROOT_DOMAIN}/subscription?code=401&email=${encodedEmail}`,
        },
        body: '',
      };
    }

    await collection.updateOne({ email }, { $set: { verified: true } });

    return {
      statusCode: 301,
      headers: {
        Location: `https://${process.env.ROOT_DOMAIN}/subscription?code=200&email=${encodedEmail}&token=${existing.verificationToken}`,
      },
      body: '',
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 301,
      headers: {
        Location: `https://${process.env.ROOT_DOMAIN}/subscription?code=500&email=${encodedEmail}&error=${encodeURIComponent(error as string)}`,
      },
      body: '',
    };
  }
}
