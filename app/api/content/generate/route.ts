// app/api/content/generate/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import { Content } from '@/models/Content';

// Access your API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        connectToDB(); // Ensure DB connection is established
        const user = await User.findOne({ email: session.user.email });

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-001" });
        const { title, prompt, type } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
        }

        const result = await model.generateContent(`You are an API-based content generator for a writing platform. Generate original, non-plagiarized content based on the given content type, title, and creative prompt. The output must strictly follow the JSON structure defined for each content type.

        Title: "${title}"
        Content Type: "${type}"
        Creative Prompt: "${prompt}"
        
        You must output a single JSON object with these fixed keys depending on the content type.
        
        ---
        
        🔷 If content_type is "poem":
        Return JSON like:
        {
          "title": "Example Title",
          "content_type": "poem",
          "prompt": "User prompt here",
          "content": [
            {
              "type": "stanza",
              "lines": ["line1", "line2", "line3", "line4"]
            }
          ]
        }
        
        ---
        
        🔷 If content_type is "story" or "prose":
        Return JSON like:
        {
          "title": "Example Title",
          "content_type": "story",  // or prose
          "prompt": "User prompt here",
          "content": [
            {
              "type": "paragraph",
              "text": "Paragraph text here."
            }
          ]
        }
        
        ---
        
        🔷 If content_type is "drama":
        Return JSON like:
        {
          "title": "Example Title",
          "content_type": "drama",
          "prompt": "User prompt here",
          "content": [
            {
              "type": "act",
              "title": "Act I: Act Name",
              "scenes": [
                {
                  "type": "scene",
                  "title": "Scene Title",
                  "content": [
                    {
                      "type": "paragraph",
                      "text": "Scene narrative here."
                    },
                    {
                      "type": "character",
                      "name": "Character Name",
                      "dialogue": [
                        {
                          "type": "line",
                          "text": "Dialogue line here."
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
        
        ---
        
        ⚠️ Important rules:
        - Output **only valid JSON** with required keys in the same order.
        - Do not include extra keys or change the schema.
        - Keep content under 5000 characters total.
        `);
        const responseText = result.response.text();
        // Remove code block fences if they exist
        const cleanJsonString = responseText.replace(/```json|```/g, '').trim();

        // Now parse
        const parsed = JSON.parse(cleanJsonString);

        const content = new Content({
            title: parsed.title,
            authorId: user._id,
            contentType: parsed.content_type,
            content: parsed.content,
            tags: [],
            description: parsed.prompt,
        });

        await content.save();

        return NextResponse.json({ output: responseText });
    } catch (error: any) {
        console.error("Error generating content:", error);
        return NextResponse.json({ error: "Failed to generate content." }, { status: 500 });
    }
}