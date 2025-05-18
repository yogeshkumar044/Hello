// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { NextAuthOptions } from 'next-auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      _id: string;
      email: string;
      username: string;
      isVerified: boolean;
      isAcceptingMessages: boolean;
      isSendingAnonymously: boolean;
    };
  }

  interface User {
    _id: string;
    email: string;
    username: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    isSendingAnonymously: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id: string;
    email?: string;
    username: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    isSendingAnonymously: boolean;
  }
}