export const config = {
  io: null,
  env: process.env.ENV || "development",
  logging: true,
  mongodb: {
    host: process.env["MONGODB_HOST"],
    database: "DepoMetamaskUsers",
    username: process.env["MONGODB_USER"],
    password: process.env["MONGODB_PASSWORD"],
  },
  server: {
    port: 3000,
  },
  jwt: {
    secret: process.env["JWT_SECRET"],
  },
  route: (method: "jwt" | "token", permission?: string | number) => {
    return {
      schema: {
        properties: {
          protected: {
            method,
            permission: permission || 1,
          },
        },
      },
    };
  },
};
