# NodeJS Typescript Fastify Template

> Required NodeJS@^14.0

## Starting

1. `npm install`
2. `npm start`

## Development

### Routes and Controllers

Set up routes at `app/modules/routes/routes.ts` importing the correct functions to the application.
You should use Controllers at `app/modules/controller` to create database communication methods, and
set up viewers at `app/modules/routes/route-domain` to instantiate and call controller's methods.

### Services

Services are classes used to perform outside world communication such as any API, or external integration.
The orientation of use will vary between Controllers and viewers, depending on what kind of job it will do. For example,
if you need to proxy a request, use inside a viewer. If you need to check something while processing data, use inside
a controller method. 

> Avoid using static methods and keep the single responsibility standard up to date.
> Use interfaces to better organize entities and control the data flow.