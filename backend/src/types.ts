export type UUID = string;

export type ProductCreate = { name: string };
export type ProductUpdate = { name: string };

export type CampaignStatus = 'on' | 'off';

export type CampaignCreate = {
    product_id: UUID;
    name: string;
    bid_amount_cents: number; // całe grosze
    fund_cents: number;       // całe grosze
    status: CampaignStatus;
    town_id: number;          // towns.id (bigint w DB, tutaj number)
    radius_km: number;        // np. 10.0
    keywords: string[];       // termy, tworzymy je jeśli brak
};

export type CampaignUpdate = Partial<Omit<CampaignCreate, 'product_id'>>;
