import { ContactInquiry } from "../../domain/entities/ContactInquiry";
import type { ContactInquiryRepository } from "../../domain/repositories/ContactInquiryRepository";
import type { ContactInquiryDocument, MongoDatabase } from "../database/MongoDatabase";

export class MongoContactInquiryRepository implements ContactInquiryRepository {
  constructor(private readonly database: MongoDatabase) {}

  async save(contactInquiry: ContactInquiry): Promise<ContactInquiry> {
    const collection = await this.database.collection<ContactInquiryDocument>("contactInquiries");
    const document = contactInquiry.toPersistence();

    await collection.replaceOne({ id: document.id }, document, { upsert: true });

    return ContactInquiry.fromPersistence(document);
  }
}
