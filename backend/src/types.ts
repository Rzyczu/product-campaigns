export type UUID = string;

export type ProductCreate = { name: string };
export type ProductUpdate = { name: string };

export type CampaignStatus = 'on' | 'off';

export type CampaignCreate = {
    product_id: UUID;
    name: string;
    bid_amount_cents: number;
    fund_cents: number;
    status: CampaignStatus;
    town_id: number;
    radius_km: number;
    keywords: string[];
};

export type CampaignUpdate = Partial<Omit<CampaignCreate, 'product_id'>>;
