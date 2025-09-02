import { z } from 'zod';
import { KEYWORDS_MAX, MIN_BID_CENTS, RADIUS_MAX_KM } from './constants';

export const campaignSchema = z.object({
    product_id: z.string().uuid(),
    name: z.string().min(1).max(100),
    bid_amount: z.string().min(1),
    fund: z.string().min(1),
    status: z.enum(['on', 'off']),
    town_id: z.number().int().positive(),
    radius_km: z.string().min(1),
    keywords: z.array(z.string().min(1).max(30)).max(KEYWORDS_MAX),
}).superRefine((val, ctx) => {
    try {
        const bid = Number(val.bid_amount.replace(',', '.'));
        if (!(bid >= MIN_BID_CENTS / 100)) {
            ctx.addIssue({ code: 'custom', message: `Minimalny bid to ${(MIN_BID_CENTS / 100).toFixed(2)} PLN`, path: ['bid_amount'] });
        }
    } catch { }
    try {
        const r = Number(val.radius_km.replace(',', '.'));
        if (!(r > 0 && r <= RADIUS_MAX_KM)) {
            ctx.addIssue({ code: 'custom', message: `Promień 0–${RADIUS_MAX_KM} km`, path: ['radius_km'] });
        }
    } catch { }
});
export type CampaignFormValues = z.infer<typeof campaignSchema>;
