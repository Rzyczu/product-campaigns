export type Campaign = {
    id: string;
    name: string;
    status: 'on' | 'off';
    bid_amount_cents: number;
    fund_cents: number;
    radius_km: number;
    created_at: string;
    updated_at: string;
    product_id: string;
    product_name: string;
    town_id: number;
    town_name: string;
    town_country: string;
    seller_id: string;
    keywords: string[];
};

export type CampaignCreateDTO = {
    product_id: string;
    name: string;
    bid_amount_cents: number;
    fund_cents: number;
    status: 'on' | 'off';
    town_id: number;
    radius_km: number;
    keywords: string[];
};

export type CampaignUpdateDTO = Partial<Omit<CampaignCreateDTO, 'product_id'>>;
