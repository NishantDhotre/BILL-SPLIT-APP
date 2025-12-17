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
            id: 'i1',
            name: 'Paneer Butter Masala',
            price: 320,
            splitMode: 'EQUAL',
            consumption: {}
        },
        {
            id: 'i2',
            name: 'Jeera Rice',
            price: 180,
            splitMode: 'EQUAL',
            consumption: {}
        },
        {
            id: 'i3',
            name: 'Butter Roti',
            price: 45,
            splitMode: 'UNIT',
            consumption: {}
        },
        {
            id: 'i4',
            name: 'Garlic Naan',
            price: 65,
            splitMode: 'UNIT',
            consumption: {}
        },
        {
            id: 'i5',
            name: 'Masala Papad',
            price: 50,
            splitMode: 'EQUAL',
            consumption: {}
        }
    ]
};
