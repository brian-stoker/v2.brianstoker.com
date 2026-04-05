import {MongoClient} from "mongodb";
import {Resource} from "sst";

const uri = Resource.MONGODB_URI.value;
if (!uri) throw new Error("MONGODB_URI is not defined");

const mongoOptions = {
  appName: "brianstoker-api",
};


let client: MongoClient;
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, mongoOptions);
  global._mongoClientPromise = client.connect();
} else {
  client = global._mongoClientPromise;
}

export default client;
