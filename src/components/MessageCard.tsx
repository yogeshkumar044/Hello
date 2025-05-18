'use client';

import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
// import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';

import { UIMessage } from '@/types/message';

type MessageCardProps = {
  message: UIMessage;
  onMessageDelete: (messageId: string) => void;
};

const formatDateTime = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`);
      toast.success('Deleted successfully', {
        description: response.data.message,
      });
      onMessageDelete(message?._id);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Failed to delete message', {
        description: 'Error',
      });
    }
  };

  const author = message?.sendAnonymous ? 'Anonymous' : (message?.authorUsername || 'Anonymous');
  const initials = author.charAt(0).toUpperCase();
  
  return (
    <Card className="relative border bg-gradient-to-br from-slate-50 via-white to-slate-100 text-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0">
            <CardTitle className="text-sm font-medium">{author}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {formatDateTime(message.createdAt.toString())}
            </CardDescription>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-red-500 hover:bg-red-100 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this message?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this message? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-1">
        <p className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
          {message.content.trim()}
        </p>
      </CardContent>
    </Card>
  );
};

export default MessageCard;
