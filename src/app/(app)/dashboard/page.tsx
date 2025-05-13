'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { Loader2, RefreshCcw, Copy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Components
import MessageCard from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Types
import { User } from 'next-auth';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema';

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const { data: session, status } = useSession();

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
    defaultValues: {
      acceptMessages: false
    }
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    if (status !== 'authenticated') return;

    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', response?.data?.isAcceptingMessages);
      console.log('Accept messages response:', response.data);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.error('Error fetching accept messages:', error);
      toast.error('Error', {
        description:
          axiosError.response?.data.message ?? 'Failed to fetch message settings',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, status]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    if (status !== 'authenticated') return;

    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages');
      console.log('Messages response:', response.data);
      setMessages(response.data.messages || []);
      if (refresh) {
        toast.success('Refreshed Messages', {
          description: 'Showing latest messages',
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error('Error', {
        description: axiosError.response?.data.message ?? 'Failed to fetch messages',
      });
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    console.log('Session status changed:', status);
    if (status === 'authenticated' && session?.user) {
      console.log('Authenticated, fetching data');
      fetchMessages();
      fetchAcceptMessages();
    }
  }, [status, session?.user, fetchMessages, fetchAcceptMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });
      toast.success('Toggle AcceptMessage', {
        description: response.data.message,
      });
      setValue('acceptMessages', !acceptMessages); // Update form state only after success
    } catch (error) {
      console.error('Error updating accept messages:', error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error('Error', {
        description: axiosError.response?.data.message ?? 'Failed to update message settings',
      });
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
        <h2 className="text-xl font-medium">Loading your dashboard...</h2>
        <p className="text-muted-foreground mt-2">Please wait while we fetch your session data</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Session Expired</h2>
        <p className="text-muted-foreground text-center max-w-md mt-2">
          Your session has expired or you're not logged in. Please sign in to access your dashboard.
        </p>
        <Button className="mt-6" asChild>
          <a href="/sign-in">Sign In</a>
        </Button>
      </div>
    );
  }

  if (!session || !session.user) {
    console.log('Session or user is missing:', session);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold">Session Error</h2>
        <p className="text-muted-foreground text-center max-w-md mt-2">
          We couldn't retrieve your user data. Please try refreshing the page.
        </p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    );
  }

  const { username } = session.user as User;
  const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(profileUrl);
      toast.success('URL Copied!', {
        description: 'Profile URL has been copied to clipboard.',
        position: 'top-center',
      });
    } else {
      toast.error('Clipboard not supported in this browser.');
    }
  };

  return (
  <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-10">
    <div className="max-w-6xl mx-auto space-y-8">

      <Card className="shadow-md w-full max-w-5xl mx-auto px-2 py-4">
        <CardContent className="pt-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-1 items-center gap-2">
              <Input
                type="text"
                value={profileUrl}
                readOnly
                className="font-mono text-sm bg-gray-100"
              />
              <Button onClick={copyToClipboard} variant="default" size="sm">
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Accept Messages</span>
              <Switch
                {...register('acceptMessages')}
                checked={acceptMessages}
                onCheckedChange={handleSwitchChange}
                disabled={isSwitchLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Messages Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">📨 Your Messages</h2>
        <Button variant="secondary" onClick={() => fetchMessages(true)} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-40 bg-gray-200 rounded-lg animate-pulse"
            />
          ))
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <div className="col-span-full text-center bg-white p-10 border-2 border-dashed rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No messages yet</h3>
            <p className="text-gray-500 mb-4">
              Share your link to start receiving anonymous feedback.
            </p>
            <Button onClick={copyToClipboard} variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copy Profile Link
            </Button>
          </div>
        )}
      </div>
    </div>
  </div>
);

}

export default UserDashboard;
