import { Message } from "@/model/User";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>;
  user?: {
    username: string;
    isAcceptingMessages: boolean;
    isSendingAnonymously: boolean;
  };
  sendAnonymously?: boolean;
  questions?: string;
}