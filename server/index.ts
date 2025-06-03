import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

async function main() {

    const url = process.env.DATABASE_URL;

    if (!url) throw new Error('DATABASE_URL is missing');

    const client = postgres(url, {prepare:false})
    const db = drizzle({ client });
}

main();
