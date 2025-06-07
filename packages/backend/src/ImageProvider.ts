import { Collection, MongoClient, ObjectId } from "mongodb";
import type { IAPIImageData } from "./shared/MockAppData";

interface IImageDocument {
  _id?: ObjectId | string; // Allow both ObjectId and string for compatibility
  name: string;
  src: string;
  authorId: string;
}

export class ImageProvider {
  private collection: Collection<IImageDocument>;

  constructor(private readonly mongoClient: MongoClient) {
    const collectionName = process.env.IMAGES_COLLECTION_NAME;
    if (!collectionName) {
      throw new Error("Missing IMAGES_COLLECTION_NAME from environment variables");
    }
    this.collection = this.mongoClient.db().collection(collectionName);
  }

  async getAllImages(searchQuery?: string): Promise<IAPIImageData[]> {
    const pipeline: any[] = [];

    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i");
      pipeline.push({
        $match: { name: { $regex: regex } }
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "username",
          as: "author"
        }
      },
      {
        $unwind: "$author"
      },
      {
        $addFields: {
          id: "$_id",
          "author.id": "$author._id"
        }
      },
      {
        $project: {
          id: 1,
          name: 1,
          src: 1,
          author: {
            id: 1,
            username: 1
          }
        }
      },
      {
        $unset: "_id"
      }
    );

    const images = await this.collection.aggregate<IAPIImageData>(pipeline).toArray();
    return images;
  }

  async updateImageName(imageId: string, newName: string): Promise<number> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(imageId)},
      { $set: { name: newName } }
    );
    return result.matchedCount;
  }

  async getImageAuthorId(imageId: string): Promise<string | null> {
    const image = await this.collection.findOne({ _id: new ObjectId(imageId) }, { projection: { authorId: 1 } });
    return image?.authorId ?? null;
  }

  async createImage(image: { name: string; src: string; author: string }) {
    return await this.collection.insertOne({
      name: image.name,
      src: image.src,
      authorId: image.author
    });
  }
}
