import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel, { User } from '@/model/User';
import { Types } from 'mongoose';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        await dbConnect();

        try {
          const userDoc = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!userDoc) {
            throw new Error('No user found with this email or username');
          }

          if (!userDoc.isVerified) {
            throw new Error('Please verify your account before logging in');
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            userDoc.password
          );

          if (!isPasswordCorrect) {
            throw new Error('Incorrect password');
          }

          const userId = userDoc._id instanceof Types.ObjectId
            ? userDoc._id.toString()
            : String(userDoc._id);

          return {
            id: userId,
            _id: userId,
            email: userDoc.email,
            username: userDoc.username,
            isVerified: userDoc.isVerified,
            isAcceptingMessages: userDoc.isAcceptingMessages,
            isSendingAnonymously: userDoc.isSendingAnonymously,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
          throw new Error(errorMessage);
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as User;
        token._id = typeof customUser._id === 'string'
          ? customUser._id
          : customUser._id?.toString?.() ?? '';
        token.isVerified = customUser.isVerified;
        token.isAcceptingMessages = customUser.isAcceptingMessages;
        token.isSendingAnonymously = customUser.isSendingAnonymously;
        token.username = customUser.username;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.isSendingAnonymously = token.isSendingAnonymously;
        session.user.username = token.username;
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
};
