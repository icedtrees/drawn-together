import {PrismaClient} from "@prisma/client";

const {DB_1_PORT_27017_TCP_ADDR} = process.env;
export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `mongodb://${DB_1_PORT_27017_TCP_ADDR}:27017/mean-dev`
        },
    },
});