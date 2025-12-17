import type { Item } from '../types';

export interface ParsedBill {
    items: Omit<Item, 'id' | 'consumption'>[];
}

const MOCK_OCR_RESPONSE: ParsedBill = {
    items: [
        { name: 'Butter Roti', price: 60, splitMode: 'UNIT' },
        { name: 'Paneer Butter Masala', price: 320, splitMode: 'EQUAL' },
        { name: 'Jeera Rice', price: 180, splitMode: 'EQUAL' },
        { name: 'Diet Coke', price: 50, splitMode: 'UNIT' },
        { name: 'Service Charge', price: 45.5, splitMode: 'EQUAL' }
    ]
};

export const uploadBillService = async (file: File): Promise<ParsedBill> => {
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            console.log('Processed file:', file.name);
            resolve(MOCK_OCR_RESPONSE);
        }, 1500);
    });
};
