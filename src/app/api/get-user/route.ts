import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { NextResponse, NextRequest } from 'next/server';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const userId = searchParams.get('id');

    if (!username && !userId) {
      return NextResponse.json(
        { success: false, message: 'Username or ID is required' },
        { status: 400 }
      );
    }

    let user;

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json(
          { success: false, message: 'Invalid user ID format' },
          { status: 400 }
        );
      }

      user = await UserModel.findById(userId)
        .select('username isAcceptingMessages isSendingAnonymously')
        .lean();
    } else {
      user = await UserModel.findOne({ username })
        .select('username isAcceptingMessages isSendingAnonymously')
        .lean();
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        isAcceptingMessages: user.isAcceptingMessages,
        isSendingAnonymously: user.isSendingAnonymously,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
