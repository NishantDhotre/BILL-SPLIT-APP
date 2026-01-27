import type { BillState } from '../types';

export const MOCK_BILL: BillState = {
    participants: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
        { id: 'p3', name: 'Charlie' },
        { id: 'p4', name: 'David' }
    ],
    items: [
        {
            id: '1',
            name: 'Butter Roti (x3)',
            price: 120, // 40 each
            quantity: 3,
            splitMode: 'UNIT',
            consumption: {}
        },
        {
            id: '2',
            name: 'Paneer Butter Masala',
            price: 280,
            quantity: 1,
            splitMode: 'EQUAL',
            consumption: { 'p1': true, 'p2': true, 'p3': true }
        },
        {
            id: '3',
            name: 'Jeera Rice',
            price: 180,
            quantity: 1,
            splitMode: 'EQUAL',
            consumption: { 'p1': true, 'p2': true, 'p3': true }
        },
        {
            id: '4',
            name: 'Coke',
            price: 60,
            quantity: 1,
            splitMode: 'UNIT',
            consumption: { 'p1': 1 }
        },
        {
            id: '5',
            name: 'Lime Soda',
            price: 80,
            quantity: 1,
            splitMode: 'UNIT',
            consumption: { 'p3': 1 }
        }
    ],
    discount: 50,
    tax: 60,
    billName: 'Punjabi Aahar'
};
