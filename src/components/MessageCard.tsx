'use client';

import React from 'react';
import {
  Card,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";

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
} from "@/components/ui/alert-dialog";

import { Button } from './ui/button';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';

type MessageCardProps = {
  message: Message;
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
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}`
      );

      toast.success('Deleted successfully', {
        description: response.data.message,
      });

      onMessageDelete(message._id);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Failed to delete message', {
        description: 'Error',
      });
    }
  };

  return (
    <Card className="relative p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Delete Button */}
      <div className="absolute top-4 right-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10">
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
      </div>

      {/* Message Content */}
      <CardHeader>
        <CardDescription className="text-base text-foreground mb-2">
          {message.content.trim()}
        </CardDescription>
        <p className="text-sm text-muted-foreground">{formatDateTime(message.createdAt)}</p>
      </CardHeader>
    </Card>
  );
};

export default MessageCard;
