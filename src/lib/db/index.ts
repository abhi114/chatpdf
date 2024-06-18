import {neon ,neonConfig} from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http';
neonConfig.fetchConnectionCache = true

//With Neon Serverless package [github(opens in a new tab), 
//blog post(opens in a new tab)] you can access Neon database from serverless environments with no TCP available, like Cloudflare Workers, through websockets.
if(!process.env.DATABASE_URL){
    throw new Error('database Url not Found');
}

const sql = neon(process.env.DATABASE_URL)

export const db = drizzle(sql)