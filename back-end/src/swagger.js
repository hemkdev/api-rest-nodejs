import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API REST Node.js',
      version: '1.0.0',
      description: 'Documentação da API de usuários',
    },
    servers: [{ url: process.env.API_BASE_URL || 'http://localhost:3000' }],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
