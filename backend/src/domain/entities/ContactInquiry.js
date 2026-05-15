"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactInquiry = void 0;
const crypto_1 = require("crypto");
class ContactInquiry {
    constructor(props) {
        this.props = props;
    }
    static create(input) {
        return new ContactInquiry({
            ...input,
            id: (0, crypto_1.randomUUID)(),
            createdAt: new Date(),
        });
    }
    static fromPersistence(input) {
        return new ContactInquiry({
            ...input,
            createdAt: new Date(input.createdAt),
        });
    }
    toPersistence() {
        return {
            ...this.props,
            createdAt: new Date(this.props.createdAt),
        };
    }
    toJSON() {
        return {
            id: this.props.id,
            name: this.props.name,
            email: this.props.email,
            message: this.props.message,
            source: this.props.source,
            createdAt: this.props.createdAt.toISOString(),
        };
    }
}
exports.ContactInquiry = ContactInquiry;
