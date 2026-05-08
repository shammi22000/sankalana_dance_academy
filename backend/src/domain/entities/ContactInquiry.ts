import { randomUUID } from "crypto";

export interface ContactInquiryProps {
  id: string;
  name: string;
  email: string;
  message: string;
  source?: string;
  createdAt: Date;
}

export class ContactInquiry {
  private constructor(private readonly props: ContactInquiryProps) {}

  static create(input: Omit<ContactInquiryProps, "id" | "createdAt">): ContactInquiry {
    return new ContactInquiry({
      ...input,
      id: randomUUID(),
      createdAt: new Date(),
    });
  }

  static fromPersistence(input: ContactInquiryProps): ContactInquiry {
    return new ContactInquiry({
      ...input,
      createdAt: new Date(input.createdAt),
    });
  }

  toPersistence(): ContactInquiryProps {
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
