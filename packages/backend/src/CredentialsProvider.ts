import { Collection, MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";

interface ICredentialsDocument {
  _id?: ObjectId;
  username: string;
  password: string; 
}

interface IUserDocument {
  _id: string;
  username: string;
  email: string;
}

export class CredentialsProvider {
  private readonly collection: Collection<ICredentialsDocument>;
  private readonly usersCollection: Collection<IUserDocument>;
  private readonly mongoClient: MongoClient;

  constructor(mongoClient: MongoClient) {
    const CREDS_COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
    if (!CREDS_COLLECTION_NAME) {
      throw new Error("Missing CREDS_COLLECTION_NAME from env file");
    }

    this.mongoClient = mongoClient;

    this.collection = mongoClient
      .db()
      .collection<ICredentialsDocument>(CREDS_COLLECTION_NAME);

    this.usersCollection = mongoClient
      .db()
      .collection<IUserDocument>("users");
  }

  async registerUser(username: string, plaintextPassword: string): Promise<boolean> {
    const existingUser = await this.collection.findOne({ username });
    if (existingUser) {
      return false;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plaintextPassword, salt);

    await this.collection.insertOne({
      _id: new ObjectId(),
      username,
      password: hash,
    });

    await this.usersCollection.insertOne({
      _id: username,
      username,
      email: `${username}@example.com`,
    });

    return true;
  }

  async verifyPassword(username: string, plaintextPassword: string): Promise<boolean> {
    const user = await this.collection.findOne({ username });
    if (!user) return false;

    return await bcrypt.compare(plaintextPassword, user.password);
  }
}
