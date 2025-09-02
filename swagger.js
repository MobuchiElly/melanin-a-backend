require("dotenv").config();
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Melanin A. API Docs',
            version: '1.0.0',
            description: 'API documentation with JWT Auth using OpenAAI 3.0'
        },
        tags: [
            {
                name: 'Auth',
                description: 'Auth API Documentation'
            },
            {
                name: 'Posts',
                description: 'Posts API Documentation'
            },
            {
                name: 'Comments',
                description: 'Comments API Documentation'
            }
        ],
        servers: [
            {
                url: "http://localhost:5000/api/v2"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your bearer token in the format: Bearer <token>',
                },
            },
        },
        security: [
            {
                bearerAuth: []
            },
        ],
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;