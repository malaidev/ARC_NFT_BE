import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
    io: null,
    env: process.env.env || 'development',
    logging: true,
    mongodb: {
        host: process.env['mongodb.host'],
        database: process.env['mongodb.dbname'],
        username: process.env['mongodb.username'],
        password: process.env['mongodb.password'],
    },
    server: {
        port: process.env['server.port'],
    },
    jwt: {
        secret: process.env['jwt.secret'],
    },
    route: (method: 'jwt' | 'token', permission?: string | number) => {
        return {
            schema: {
                properties: {
                    protected: {
                        method,
                        permission: permission || 1
                    }
                }
            }
        }
    }
}