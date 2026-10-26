import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();
const ai = new GoogleGenAI();

router.post('/', async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ reply: 'Please provide a valid message.' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash', // تم التحديث إلى النموذج المدعوم الجديد
      contents: [
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ],
      config: {
        systemInstruction: 'You are an AI customer support assistant for a luxury minimalist e-commerce store called VARIETY. You specialize in autumn collections, outerwears, knitwear, shipping policies, and store orders. Keep your tone polite, elegant, concise, and helpful.',
      },
    });

    const reply = response.text || "I'm here to help you with anything related to VARIETY autumn collection and orders!";
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini API Error Details:', error?.message || error);
    res.status(500).json({ 
      reply: 'Sorry, the AI assistant is temporarily unavailable. Please try again later.', 
      error: error?.message || 'Unknown error' 
    });
  }
});

export default router;