import 'dotenv/config';

function need(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`${name} is required`);
    return v;
}

export const env = {
    PORT: parseInt(process.env.PORT || '4000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: need('DATABASE_URL'),
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    COOKIE_SECRET: need('COOKIE_SECRET'),
};
