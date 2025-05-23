import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import UserModel from '@/model/User';
import dbConnect from '@/lib/dbConnect';

export async function POST(request: Request) {

  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  const user = session.user;
  const userId = user._id;
  const { sendAnonymously } = await request.json();

  try {
    // Update the user's anonymous sending status
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isSendingAnonymously: sendAnonymously },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: 'Unable to find user to update anonymous setting',
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'Anonymous setting updated successfully',
        isSendingAnonymously: updatedUser.isSendingAnonymously,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating anonymous setting:', error);
    return Response.json(
      { success: false, message: 'Error updating anonymous setting' },
      { status: 500 }
    );
  }
}


export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

    const user = session.user;


  try {
    const userId = user._id;
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        sendAnonymously: foundUser.isSendingAnonymously,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching anonymous status:', error);
    return Response.json(
      { success: false, message: 'Error fetching anonymous status' },
      { status: 500 }
    );
  }
}