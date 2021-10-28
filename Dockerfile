FROM node:14.16.0 AS base-image
WORKDIR /app
COPY package.json .

FROM base-image AS base-dependencies
RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production 
RUN cp -R node_modules prod_node_modules

FROM base-image AS release
COPY --from=base-dependencies /app/prod_node_modules ./node_modules
COPY . .
EXPOSE 3000
