var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var isProduction = process.env.NODE_ENV === "production";
var PORT = 3e3;
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it in Settings > Secrets.");
    }
    return new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  };
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Messages array is required." });
        return;
      }
      const ai = getGeminiClient();
      const chatHistory = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
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
   - Desserts: Saffron Rasmalai (600 INR), Chocolate Fondant (750 INR), Pistachio Baklava (800 INR), Cr\xE8me Br\xFBl\xE9e, Tiramisu, Artisanal Gelato, Fruit Tart.

Keep your tone warm, elite, professional, and sophisticated. Avoid generic AI introductory remarks where possible.`;
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction,
          temperature: 0.7
        },
        history: previousHistory
      });
      const response = await chat.sendMessage({
        message: lastMessage.parts[0].text
      });
      res.json({ content: response.text });
    } catch (error) {
      console.error("Gemini error:", error);
      res.status(500).json({
        error: error.message || "An error occurred while luxury consulting our private sommelier."
      });
    }
  });
  app.post("/api/reservations/sommelier", async (req, res) => {
    try {
      const { guestCount, occasion, timeSlot, tableNum } = req.body;
      const ai = getGeminiClient();
      const prompt = `Mr. Alexander Sterling is booking Table #${tableNum} for ${guestCount} guests on a special occasion of "${occasion || "Dinner"}" at ${timeSlot}.
As the certified private master sommelier, please provide a luxurious, personalized dining journey suggestion.
Offer brief, magnificent recommendations for:
- A welcoming sparkling starter drink.
- Fine red or white wine pairings matching their choice of fine meats (e.g. Mutton Rogan Josh, A5 Wagyu, or Lobster Thermidor).
- A sweet digestif or dessert whiskey finish.
Keep your answer down to 3 short bullet points, written in an exceptionally refined and elite concierge tone, addressing him directly.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Sterling, the ultra-premium private butler and master sommelier for Luxe Meats.",
          temperature: 0.8
        }
      });
      res.json({ pairings: response.text });
    } catch (error) {
      console.error("Reservation sommelier error:", error);
      res.json({
        pairings: `*A marvelous selection, Mr. Sterling. The cellar is prepared with a bottle of Chateau Margaux 1996 and Dom P\xE9rignon to elevate your evening.*`
      });
    }
  });
  if (!isProduction) {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Luxe Meats Server running on http://localhost:${PORT}`);
  });
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
