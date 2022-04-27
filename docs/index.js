const path = require('path');
const fs = require('fs');
const swaggerJSDoc = require('swagger-jsdoc');

// function fileDisplay(filePath, locations) {
//     const files = fs.readdirSync(filePath);
//     files.forEach((filename) => {
//         locations.push(`./api/${filename}/route.js`);
//         locations.push(`./api/${filename}/index.js`);
//     });
// }

function fileDisplay(filePath, locations) {
    const files = fs.readdirSync(filePath);
    locations.push('doc_error.yml');
    files.forEach((filename) => {
        locations.push(`./api/${filename}/doc.yml`);
    });
}

const filePath = path.resolve(__dirname, '../api');
const locations = [];

fileDisplay(filePath, locations);

const swaggerDefinition = {
    openapi: '3.0.0',
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                name: 'Authorization',
                in: 'header',
                bearerFormat: 'JWT',
            },
        },
    },
    info: {
        title: 'lifeMatch API',
        version: '1.0.0',
        // eslint-disable-next-line no-useless-escape
        description: 'lifeMatch API Documentation. Header for all the APIs: Authorization: jwt Token"',
    },
    host: `${process.env.SERVER_DOMAIN}api`,
    servers: [
        {
            url: 'http://localhost:8083/api',
        },
        // {
        //     url: '',
        // },
    ],
    basePath: '/',
};

const options = {
    swaggerDefinition,
    apis: locations,
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;