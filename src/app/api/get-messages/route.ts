import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import mongoose from 'mongoose';
import { User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const _user: User = session?.user;

    if (!session || !_user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(_user._id);

    // First find the user to verify they exist
    const userExists = await UserModel.findById(userId);
    if (!userExists) {
      return NextResponse.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }

    // Handle both cases: with messages and without messages
    const user = await UserModel.findById(userId).select('messages').lean();
    
    // Sort messages in descending order (newest first)
    const sortedMessages = user?.messages && user?.messages.length > 0 
      ? user?.messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      : [];

      // console.log(sortedMessages,"getmessage")

    return NextResponse.json(
      { messages: sortedMessages, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}