export interface UIMessage {
  _id: string;
  content: string;
  createdAt: Date;
  author?: string;
  authorUsername?: string;
  sendAnonymous?: boolean;
}