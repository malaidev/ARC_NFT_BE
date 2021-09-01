# Instruções

 - NodeJS ^v14.5, Fastify, MongoDB, Typescript, OO

### Desenvolvimento

 1. Para executar este serviço, copie o arquivo `.env-example` para `.env` e preencha as informações nele contidas.
    `$ cp .env-example .env`
 2. Instale as dependências do projeto com `$ npm install`;
 3. Execute o projeto com `npm start`;

### Docker

 1. Execute `docker-compose up -d --build`.
    Porta exposta: 3000.

## Carga do banco de dados

A carga do banco de dados deverá ser feita utilizando o aplicativo web. Nele há um botão "Popular Banco" que gerará 50 registros aleatórios no formato correto para a leitura da plataforma.


### Notas
 1. Infelizmente eu não tenho bom conhecimento em testes de aplicações, portanto não implementei testes.
 2. O framrwork do serviço utilizado é o [Fastify](https://fastify.io) (Ñ express)