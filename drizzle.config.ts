import type { Config } from "drizzle-kit";
//env values cannot be used by default outside of the src folder hence use dotenv lib to use it in this config file
import * as dotenv from 'dotenv'
dotenv.config({path:'.env'})
//it help with sync the schema, run npx drizzle-kit push:pg to sync the neon database to the schema written
export default {
    driver:'pg',
    schema:'./src/lib/db/schema.ts',
    dbCredentials:{
        connectionString:process.env.DATABASE_URL!,
    }
} satisfies Config;