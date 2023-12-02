import {PrismaClient} from "@prisma/client";

var config = require('../../config/config');

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: config.db.uri
        },
    },
});
