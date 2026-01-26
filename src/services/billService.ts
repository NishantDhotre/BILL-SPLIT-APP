import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Item } from '../types';

export interface ParsedBill {
    items: Omit<Item, 'id' | 'consumption'>[];
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
            resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type,
        },
    };
};

export const uploadBillService = async (file: File): Promise<ParsedBill> => {
    if (!API_KEY) {
        console.error("❌ Gemini API Key is missing! Check .env file.");
        throw new Error("Missing Gemini API Key in .env file (VITE_GEMINI_API_KEY)");
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Switching to 2.5 Flash as final attempt to find a model with quota
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      Analyze this bill image and extract all line items.
      Return ONLY a valid JSON object with a single key "items".
      
      "items" should be an array of objects. NOT nested. 
      For each item, strictly follow these rules:

      1. **name**: 
         - Simplify the product name to its "common known name". 
         - Remove adjectives like "Spicy", "Grandma's", "Special", "Crispy" unless necessary for distinction.
         - Case examples: 
            - "Truffle Infused Edamame" -> "Edamame"
            - "Butter Garlic Naan" -> "Butter Naan"
            - "Paneer Butter Masala Half" -> "Paneer Butter Masala"
      
      2. **price**: 
         - The cost of the item as a number.

      3. **splitMode**: 
         - Determine the best split policy based on the item type:
         - **"UNIT"**: For items usually consumed individually or by count.
            - Examples: Roti, Naan, Breads, Beverages (Coke, Beer, Coffee), Cigarettes, individual pieces.
         - **"EQUAL"**: For items usually shared by the table.
            - Examples: Curries (Paneer, Chicken), Rice (Jeera Rice, Biryani), Starters/Appetizers (Fries, Tikka), Salads, Desserts.
      
      Example output:
      {
        "items": [
          { "name": "Butter Roti", "price": 45, "splitMode": "UNIT" },
          { "name": "Paneer Masala", "price": 320, "splitMode": "EQUAL" },
          { "name": "Diet Coke", "price": 60, "splitMode": "UNIT" }
        ]
      }
      
      Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
    `;

        const imagePart = await fileToGenerativePart(file);

        // Safety settings could be adjusted here if needed, but defaults are usually fine for receipt text.

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown formatting if the model disobeys "No markdown" instruction
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsed = JSON.parse(cleanText) as ParsedBill;

        if (!parsed.items || !Array.isArray(parsed.items)) {
            throw new Error("Invalid format received from AI");
        }

        return parsed;

    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        throw error;
    }
};
