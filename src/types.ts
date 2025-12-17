export type Participant = {
    id: string;
    name: string;
};

export type SplitMode = 'EQUAL' | 'UNIT';

export type Item = {
    id: string;
    name: string;
    price: number;
    splitMode: SplitMode;
    // consumption maps participantId to checked status (boolean) or quantity (number)
    consumption: {
        [participantId: string]: boolean | number;
    };
};

// Chat Action Types
export type Action =
    | { type: 'ADD_PARTICIPANT'; name: string }
    | { type: 'REMOVE_PARTICIPANT'; id: string }
    | { type: 'SET_SPLIT_MODE'; item: string; mode: SplitMode }
    | { type: 'SET_CHECKED'; item: string; participants: string[] } // Item Name or ID? Spec says "item": "Paneer". I should support Name matching since LLM uses names.
    | { type: 'SET_UNIT'; item: string; participant: string; quantity: number };

export type BillState = {
    participants: Participant[];
    items: Item[];
};
