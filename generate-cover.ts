import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    console.log("Generating image...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: '1980s arcade racing video game cover art, synthwave aesthetic, outrun style, neon grid floor, glowing sunset, retro sports car driving towards the horizon, vibrant magenta cyan and purple colors, airbrushed retro style, no text',
      config: {
        imageConfig: {
          aspectRatio: "9:16"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        const buffer = Buffer.from(base64EncodeString, 'base64');
        fs.mkdirSync('public', { recursive: true });
        fs.writeFileSync('public/cover.png', buffer);
        console.log('Image saved to public/cover.png');
        break;
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

run();
