'use client';

import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  if (!messageString) return [];
  return messageString.split(specialChar).filter(msg => msg.trim() !== '');
};

// Initial hardcoded messages
const initialMessageString = "What's your favorite movie?||Do you have any pets?||What's your dream job?";

// Create a schema for the suggestion prompt
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
  const [promptInput, setPromptInput] = useState("");

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const suggestionForm = useForm<z.infer<typeof suggestionPromptSchema>>({
    resolver: zodResolver(suggestionPromptSchema),
    defaultValues: {
      topic: ""
    }
  });

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

  const onSuggestionSubmit = (data: z.infer<typeof suggestionPromptSchema>) => {
    fetchSuggestedMessages(data);
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !messageContent}>
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className="space-y-4 my-8">
        <Card className="p-4">
          <CardHeader>
            <h3 className="text-xl font-semibold">Get Message Suggestions</h3>
          </CardHeader>
          <CardContent>
            <Form {...suggestionForm}>
              <form onSubmit={suggestionForm.handleSubmit(onSuggestionSubmit)} className="space-y-4">
                <FormField
                  control={suggestionForm.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What type of message would you like to send?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="E.g., career advice, travel recommendations, fitness tips..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    disabled={isFetchingMessages}
                  >
                    {isFetchingMessages ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading suggestions...
                      </>
                    ) : (
                      'Get Contextual Suggestions'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
            
            <div className="mt-4">
              <Button
                onClick={() => fetchSuggestedMessages()}
                variant="outline"
                disabled={isFetchingMessages}
              >
                {isFetchingMessages ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Get Random Suggestions'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        

        {suggestedMessages.length > 0 && (
          <Card className="w-full">
            <CardHeader>
              <h3 className="text-xl font-semibold">Suggested Messages</h3>
              <p className="text-sm text-gray-500">Click on any message to use it</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-3">
                {suggestedMessages.map((message, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full h-auto whitespace-normal text-left py-3 px-4"
                    onClick={() => handleMessageClick(message)}
                  >
                    <span className="line-clamp-none">{message}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {fetchError && (
          <p className="text-red-500">Error loading suggestions: {fetchError}</p>
        )}
      </div>
      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={'/sign-up'}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}