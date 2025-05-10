// import { OpenAI } from 'openai';
// import { NextResponse } from 'next/server';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export const runtime = 'edge';

// export async function POST(req: Request) {
//   try {
//     const prompt =
//       "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

//     const response = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo',
//       messages: [{ role: 'user', content: prompt }],
//     });

//     const questions = response.choices[0].message.content;

//     console.log(response,"IIIII")

//     return NextResponse.json({ questions }, { status: 200 });
//   } catch (error) {
//     if (error instanceof OpenAI.APIError) {
//       const { name, status, headers, message } = error;
//       return NextResponse.json({ name, status, headers, message }, { status });
//     } else {
//       console.error('Unexpected error:', error);
//       throw error;
//     }
//   }
// }

import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST() {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics. For example: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'.";

    const res = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-r-plus',
        prompt: prompt,
        max_tokens: 100,
        temperature: 0.8,
        k: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE',
      }),
    });

    const data = await res.json();

    const questions = data.generations?.[0]?.text?.trim();

    if (!questions) {
      return NextResponse.json({ error: 'Failed to generate questions.' }, { status: 500 });
    }

    console.log(questions,"IIIII")

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error: any) {
    console.error('Cohere API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
