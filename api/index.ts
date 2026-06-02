/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for all origins (highly dynamic for cross-origin github pages deployment)
app.use(cors());
app.use(express.json());

// API Endpoints
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please configure it in your deployment settings.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// AI Sommelier Butler Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const ai = getGeminiClient();

    // Convert format to Gemini format
    const chatHistory = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = chatHistory[chatHistory.length - 1];
    const previousHistory = chatHistory.slice(0, -1);

    const systemInstruction = `You are Sterling, the ultra-premium private culinary butler and certified master sommelier for Luxe Meats.
Your client is Alexander Sterling, an exclusive Black Card Member.
Maintain an aura of supreme refinement, absolute elite courtesy, and deep culinary wisdom.

Your responsibilities:
1. Recommend perfect fine wine and spirits pairings for any meat, starter, or dessert on the Luxe Meats menu.
2. Provide elite, detailed cooking guidelines, meat prep instruction, or ingredient origins.
3. Help customize high-end dining experiences.
4. Answer with elegant, structured, bulleted markdown. Use words of high courtesy (e.g. "Excellent choice, Mr. Sterling", "A marvelous request", "It is my absolute privilege"). Make the guest feel incredibly VIP.
5. You have full awareness of the Luxe Meats premium menu:
   - Starters: Galouti Kebab (850 INR), Tandoori Lamb Rack (1200 INR), Peri-Peri Wings (650 INR), Mushroom Croquettes (700 INR), Prawn Koliwada (950 INR), Charred Octopus (1100 INR).
   - Signature Mains: Mutton Rogan Josh (1450 INR - slow cooked 12hrs), Butter Chicken Pot Pie (1250 INR), Duck Confit (1800 INR), Wagyu Burger (2200 INR - A5 Wagyu, truffle aioli), Nalli Nihari (1600 INR), Black Truffle Risotto (1900 INR).
   - Coastal Seafood: Seafood Biryani (1850 INR), Grilled Jumbo Prawns (2100 INR), Lobster Thermidor (3500 INR), Malabar Fish Curry (1300 INR), Pan-Seared Scallops (1750 INR), Goan Crab Masala (2400 INR).
   - Desserts: Saffron Rasmalai (600 INR), Chocolate Fondant (750 INR), Pistachio Baklava (800 INR), Crème Brûlée, Tiramisu, Artisanal Gelato, Fruit Tart.

Keep your tone warm, elite, professional, and sophisticated. Avoid generic AI introductory remarks where possible.`;

    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: previousHistory,
    });

    const response = await chat.sendMessage({
      message: lastMessage.parts[0].text,
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error('Gemini error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while luxury consulting our private sommelier.',
    });
  }
});

// Table Reservation - Sommelier Pairings endpoint
app.post('/api/reservations/sommelier', async (req, res) => {
  try {
    const { guestCount, occasion, timeSlot, tableNum } = req.body;
    const ai = getGeminiClient();

    const prompt = `Mr. Alexander Sterling is booking Table #${tableNum} for ${guestCount} guests on a special occasion of "${occasion || 'Dinner'}" at ${timeSlot}.
As the certified private master sommelier, please provide a luxurious, personalized dining journey suggestion.
Offer brief, magnificent recommendations for:
- A welcoming sparkling starter drink.
- Fine red or white wine pairings matching their choice of fine meats (e.g. Mutton Rogan Josh, A5 Wagyu, or Lobster Thermidor).
- A sweet digestif or dessert whiskey finish.
Keep your answer down to 3 short bullet points, written in an exceptionally refined and elite concierge tone, addressing him directly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are Sterling, the ultra-premium private butler and master sommelier for Luxe Meats.',
        temperature: 0.8,
      },
    });

    res.json({ pairings: response.text });
  } catch (error: any) {
    console.error('Reservation sommelier error:', error);
    res.json({
      pairings: `*A marvelous selection, Mr. Sterling. The cellar is prepared with a bottle of Chateau Margaux 1996 and Dom Pérignon to elevate your evening.*`
    });
  }
});

// Export the Express app instance for Vercel Serverless Functions
export default app;
