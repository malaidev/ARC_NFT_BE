if (process.env && !process.env.ENV?.match(/prod|stag/gi)) {
  const dotenv = require("dotenv");
  dotenv.config();
}

export const config = {
  io: null,
  __logPool: [],
  env: process.env.ENV || "development",
  logging: process.env.LOGGING && process.env.LOGGING === "true" ? true : false,
  mongodb: {
    host: process.env["MONGODB_HOST"],
    database: "DepoMetamaskUsers",
    username: process.env["MONGODB_USER"],
    password: process.env["MONGODB_PASSWORD"],
  },
  server: {
    port: 3001,
  },
  jwt: {
    secret: process.env["JWT_SECRET"],
  },
  mailer: {
    apiKey: process.env["EMAIL_SERVICE_API_KEY"],
    domain: process.env["EMAIL_SERVICE_DOMAIN"],
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
