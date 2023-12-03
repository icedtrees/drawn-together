import {PrismaClient} from "@prisma/client";

const config = require('../../config/config');

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: config.db.uri
        },
    },
});
