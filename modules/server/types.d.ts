declare namespace Express {
    // This is related to the auth middleware at modules/server/users/config/strategies/local.js
    // The user should be the Mongoose user model at modules/server/users/models/user.server.model.js
    interface User {
        id: string;
        username: string;
        email: string;
        created: Date;
        updated: Date;
    }
}
