export enum AppView {
    PRODUCT_INFO = 'PRODUCT_INFO',
    MARKET_INTEL = 'MARKET_INTEL',
    SALES_PLAYBOOK = 'SALES_PLAYBOOK',
    LEAD_GENERATOR = 'LEAD_GENERATOR',
    SOCIAL_MEDIA = 'SOCIAL_MEDIA',
}

export interface ServerSpec {
    category: string;
    items: {
        feature: string;
        value: string | string[];
    }[];
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    sources?: { title: string; uri: string }[];
}

// FIX: Add and export the 'Quote' interface to resolve the import error.
export interface Quote {
    id: string;
    customerName: string;
    serverConfig: string;
    price: number;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
    createdAt: string;
}
