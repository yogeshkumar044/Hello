'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';
import { sendAnonymouslySchema } from '@/schemas/sendAnoymouslySchema';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  if (!messageString) return [];
  return messageString.split(specialChar).filter(msg => msg.trim() !== '');
};

const initialMessageString = "What's your favorite movie?||Do you have any pets?||What's your dream job?";

const suggestionPromptSchema = z.object({
  topic: z.string().min(1, "Please enter a topic").max(200, "Topic is too long")
});

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>(
    parseStringMessages(initialMessageString)
  );

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const suggestionForm = useForm<z.infer<typeof suggestionPromptSchema>>({
    resolver: zodResolver(suggestionPromptSchema),
    defaultValues: {
      topic: ""
    }
  });

  const toggleForm = useForm({
    resolver: zodResolver(sendAnonymouslySchema),
    defaultValues: {
      sendAnonymously: true,
    }
  });

  const { register, watch, setValue } = toggleForm;
  const sendAnonymously = watch('sendAnonymously');
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const messageContent = form.watch('content');

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      });

      toast.success(response.data.message);
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async (promptData?: z.infer<typeof suggestionPromptSchema>) => {
    setIsFetchingMessages(true);
    setFetchError(null);

    try {
      const response = await axios.post('/api/suggest-messages', {
        topic: promptData?.topic || ""
      });

      if (response.data && response.data.questions) {
        const messages = parseStringMessages(response.data.questions);
        setSuggestedMessages(messages);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setFetchError('Failed to fetch suggestions');
      toast.error('Error fetching suggestions');
      setSuggestedMessages(parseStringMessages(initialMessageString));
    } finally {
      setIsFetchingMessages(false);
    }
  };

  const fetchSendAnonymously = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/send-anonymously');
      setValue('sendAnonymously', response?.data?.sendAnonymously);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error('Error', {
        description: axiosError.response?.data.message ?? 'Failed to fetch setting',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/send-anonymously', {
        sendAnonymously: !sendAnonymously,
      });
      toast.success('Toggle SendAnonymously', {
        description: response.data.message,
      });
      setValue('sendAnonymously', !sendAnonymously);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error('Error', {
        description: axiosError.response?.data.message ?? 'Failed to update setting',
      });
    }
  };

  const onSuggestionSubmit = (data: z.infer<typeof suggestionPromptSchema>) => {
    fetchSuggestedMessages(data);
  };

  useEffect(() => {
    fetchSendAnonymously();
  }, [fetchSendAnonymously]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">Public Profile Link</h1>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left column (forms) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Message Form */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">Send Anonymous Message to @{username}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your anonymous message here..."
                          className="resize-none bg-gray-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Send Anonymously</span>
                    <Switch
                      {...register('sendAnonymously')}
                      checked={sendAnonymously}
                      onCheckedChange={handleSwitchChange}
                      disabled={isSwitchLoading}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading || !messageContent}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send It'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Suggestion Form */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <Form {...suggestionForm}>
              <form onSubmit={suggestionForm.handleSubmit(onSuggestionSubmit)} className="space-y-4">
                <FormField
                  control={suggestionForm.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">Want help writing something specific?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., career advice, travel tip..."
                          className="resize-none bg-gray-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={isFetchingMessages}>
                    {isFetchingMessages ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      'Get Suggestions'
                    )}
                  </Button>
                  <Button
                    onClick={fetchSuggestedMessages}
                    variant="outline"
                    disabled={isFetchingMessages}
                  >
                    Random Suggestions
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Right column: Suggested Messages */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Suggested Messages</h3>
          <p className="text-sm text-gray-500 mb-4">Click to use one below</p>

          {suggestedMessages.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {suggestedMessages.map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full h-auto text-left whitespace-pre-line break-words py-3 px-4"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No suggestions yet.</p>
          )}

          {fetchError && (
            <p className="text-red-500 mt-4 text-sm">Error: {fetchError}</p>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <p className="text-gray-700 mb-4">Want your own message board?</p>
        <Link href="/sign-up">
          <Button size="lg">Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}
