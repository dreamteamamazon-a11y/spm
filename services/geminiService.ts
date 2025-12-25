import { GoogleGenAI, Chat, Type, GenerateContentResponse } from "@google/genai";
import { Topic, LearningMode } from "../types";

const CONVERSATION_INSTRUCTION = `
PROMPT: KIDS ENGLISH CONVERSATION CHATBOX (AGES 4–8)
Your role: You are a friendly English teacher for young children.
Goal: Help children communicate naturally.
Rules:
- Use short sentences (3-6 words).
- If child answers correctly: Praise gently, then ask next simple question.
- If child answers incorrectly: Gently correct format: "😊 Almost! We say: '[Correct Sentence]'. Can you try again?"
- Topics: Family, Animals, Food, Toys, etc.
- Safety: No sensitive topics.
- TRANSLATION REQUEST: If you receive the text "TIMEOUT_TRANSLATE", it means the child did not understand or reply. You MUST:
  1. Translate your LAST question/statement into Vietnamese.
  2. Repeat the English question/statement again.
  Example Output: "Con tên là gì? What is your name?"
`;

const VOCABULARY_INSTRUCTION = `
PROMPT: KIDS ENGLISH VOCABULARY TEACHER (AGES 4-8)
Your role: Teach single English vocabulary words about a specific topic.
Target Audience: Vietnamese children learning English.

Rules:
1. TEACHING: Provide ONE English word related to the topic.
2. REPETITION: You MUST repeat the word 3 times clearly so the child can hear it well. (e.g., "Apple. Apple. Apple. 🍎").
3. SUCCESS: If the child's input matches the word (even roughly), say "Good job! [Emoji]" and immediately give the NEXT word (repeating the new word 3 times).
4. INCORRECT PRONUNCIATION: If the child's input is wrong or completely different:
   - Do NOT move to the next word.
   - Say "Gần đúng rồi!" (Almost!)
   - Guide them on how to pronounce it in Vietnamese. (e.g., "Con đọc là 'Ap-pồ' nhé.")
   - Repeat the English word 2 times clearly.
   - Ask them to try again.
   Example: "Gần đúng rồi! Con đọc là 'Lai-ân' nhé. Lion. Lion. 🦁"
5. TRANSLATION REQUEST: If you receive the text "TIMEOUT_TRANSLATE", it means the child is stuck. You must output the Vietnamese translation of the LAST word you taught, followed by the English word again. 
   Example Output: "Quả táo. Apple. 🍎"
`;

let chatInstance: Chat | null = null;
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Retry helper for API calls
async function retry<T>(fn: () => Promise<T>, retries = 2, delay = 500): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(r => setTimeout(r, delay));
    return retry(fn, retries - 1, delay * 1.5);
  }
}

export const initializeChat = async (topic: string, mode: LearningMode): Promise<string> => {
  const instruction = mode === 'vocabulary' ? VOCABULARY_INSTRUCTION : CONVERSATION_INSTRUCTION;
  
  chatInstance = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: instruction,
      temperature: 0.7,
      candidateCount: 1,
      // @ts-ignore - Valid config for Gemini API to prevent false positives
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    },
  });

  let initialPrompt = "";
  if (mode === 'vocabulary') {
    initialPrompt = `I want to learn words about ${topic}. Please teach me the first word. Remember: Repeat the English word 3 times.`;
  } else {
    initialPrompt = `Hello teacher! I want to talk about ${topic}. Please say hello and ask me a simple question about ${topic}.`;
  }

  try {
    const response = await retry<GenerateContentResponse>(() => chatInstance!.sendMessage({ message: initialPrompt }));
    return response.text || (mode === 'vocabulary' ? `${topic} 🌟` : `Hello! Let's talk about ${topic}!`);
  } catch (error) {
    console.error("Failed to init chat:", error);
    return "Hi there! 👋 I am ready. (Xin chào!)";
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatInstance) {
    return "Wait a second, I am waking up! 😴";
  }

  try {
    const response = await retry<GenerateContentResponse>(() => chatInstance!.sendMessage({ message }));
    return response.text || "I didn't catch that.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Friendlier fallback message in Vietnamese/English
    return "Cô chưa nghe rõ, bé nói lại nhé? Can you say that again? 👂";
  }
};

export const getTopicSuggestions = async (): Promise<Topic[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate 4 simple, fun, safe discussion topics for a 6 year old child learning English. They should be one or two words. e.g. 'Robots', 'Candy'. Return ONLY a JSON array.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              emoji: { type: Type.STRING, description: "A single representative emoji" },
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const rawTopics = JSON.parse(text);
    const colors = ['bg-pink-100', 'bg-blue-100', 'bg-green-100', 'bg-yellow-100'];
    
    return rawTopics.map((t: any, i: number) => ({
      id: `ai-${Date.now()}-${i}`,
      label: t.label,
      emoji: t.emoji,
      color: colors[i % colors.length]
    }));

  } catch (error) {
    return [
      { id: 'ai-backup-1', label: 'Robots', emoji: '🤖', color: 'bg-slate-200' },
      { id: 'ai-backup-2', label: 'Camping', emoji: '⛺', color: 'bg-green-200' },
      { id: 'ai-backup-3', label: 'Candy', emoji: '🍬', color: 'bg-pink-200' },
    ];
  }
};