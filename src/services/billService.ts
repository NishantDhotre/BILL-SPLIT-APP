import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Item } from '../types';

export interface ParsedBill {
    items: Omit<Item, 'id' | 'consumption'>[];
    tax?: number;
    billName?: string;
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

export const uploadBillService = async (file: File, userApiKey?: string | null): Promise<ParsedBill> => {
    const finalApiKey = userApiKey || API_KEY;

    if (!finalApiKey) {
        console.error("❌ Gemini API Key is missing!");
        throw new Error("Missing API Key. Please add a Key in Settings or configure .env.");
    }

    try {
        const genAI = new GoogleGenerativeAI(finalApiKey);
        // Switching to 2.5 Flash as final attempt to find a model with quota
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      Analyze this bill image deeply. Extract all line items and total tax.
      Return ONLY a valid JSON object with keys "items" and "tax".
      
      "items": Array of objects.
      "tax": Number. (Sum of CGST, SGST, Service Charge, VAT, etc. NOT the Grand Total).

      **CRITICAL OCR INSTRUCTIONS**:
      - Read the bill line-by-line carefully.
      **CRITICAL OCR INSTRUCTIONS**:
      - **Columnar Layouts**: This bill might have a layout where usage is:
        Line 1: \`Item Name\`
        Line 2: \`Quantity   Unit_Price   Total_Price\`
        *Example*: 
        \`BUTTER ROTI\`
        \`8          15.00        120.00\`
        In this case, \`Name\`="Butter Roti", \`Quantity\`=8, \`Price\`=120.00.
      
      - **Multi-line items**: If text seems to continue (e.g., "Paneer Thai Style \n Tuk Tuk"), combine them.
      - **Quantity**: Explicitly extract quantity. Look for detached numbers near the item name.
        - If "2 x Naan", quantity is 2.
        - If the line below the name has \`8  15.00  120.00\`, then Quantity is 8.
        - Default to 1 if not found.
      - **Price**: ALWAYS return the *Total Price* for the line item (e.g. 120.00 for the Rotis, not 15.00).

      For items, strictly follow these rules:

      1. **name**: 
         - Simplify to "common known name". 
         - **Capture the FULL name**: Do not truncate unique identifiers like "Thai Style Tuk Tuk".
         - Remove generic adjectives like "Spicy", "special" *unless* it defines the dish.
      
      2. **price**: 
         - The TOTAL cost of the item line as a number.

      3. **quantity**:
         - The number of units. Default to 1 if not specified.

      4. **splitMode**: 
         - **"UNIT"**: Drinks, Breads (Naan/Roti), Cigarettes, Individual pieces.
         - **"EQUAL"**: Mains (Curries, Rice), Starters, Salads, Desserts.
      
      5. **billName** (Top Level key):
         - Identify the Restaurant or Store Name at the top of the receipt. e.g., "PUNJABI AAHAR", "DOMINOS".
         - Default to "Bill Split" if not visible.

      Example output:
      {
        "billName": "PUNJABI AAHAR",
        "items": [
          { "name": "Butter Roti", "price": 90, "quantity": 2, "splitMode": "UNIT" },
          { "name": "Paneer Thai Style Tuk Tuk", "price": 249, "quantity": 1, "splitMode": "EQUAL" }
        ],
        "tax": 50.5
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
