"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoContactInquiryRepository = void 0;
const ContactInquiry_1 = require("../../domain/entities/ContactInquiry");
class MongoContactInquiryRepository {
    constructor(database) {
        this.database = database;
    }
    async save(contactInquiry) {
        const collection = await this.database.collection("contactInquiries");
        const document = contactInquiry.toPersistence();
        await collection.replaceOne({ id: document.id }, document, { upsert: true });
        return ContactInquiry_1.ContactInquiry.fromPersistence(document);
    }
}
exports.MongoContactInquiryRepository = MongoContactInquiryRepository;
