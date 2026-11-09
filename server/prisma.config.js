import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        // Prisma CLI/migrations prefer a direct database connection. Falling
        // back to DATABASE_URL keeps local builds and Vercel deploys working
        // even when DIRECT_URL is not configured.
        url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
});
