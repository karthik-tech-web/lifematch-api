if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'dev') {
    // eslint-disable-next-line global-require
    require('dotenv').config({
        path: `./${process.env.NODE_ENV}.env`,
    });
}

const express = require('express');

const app = express();
const helmet = require('helmet');
const morgan = require('morgan');
const userAgent = require('express-useragent');
const bodyParser = require('body-parser');
const boom = require('@hapi/boom');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const initScope = require('./system/middleware/init-scope');
// const initReqUser = require('./system/middleware/init-req-user');
const logError = require('./system/middleware/log-error');
const errorHandler = require('./system/error/handler');
const swaggerSpec = require('./docs');
const middlewareConfig = require('./system/config/middleware');

// api routes folder path
const authRoutes = require('./api/Auth/route');
const userRoutes = require('./api/User/route');
const reportRoutes = require('./api/Report/route');
const activityLogRoutes = require('./api/ActivityLog/route');
const paymentRoutes = require('./api/payment/route');

// const stripePaymentGatewayController = require('./api/PaymentGateway/Stripe/controller');

// app.post('/api/payment-gateway/stripe/webhook-endpoint', bodyParser.raw({
//     type: 'application/json'
// }), (request, response) => {
//     stripePaymentGatewayController.webhookEndpoint(request, response);
// });

app.use('/profile-uploads', express.static(path.join(__dirname, '/profile-uploads')));

app.use(userAgent.express());
app.use(cors(middlewareConfig.cors));
app.use(helmet());
app.use(morgan(middlewareConfig.morganRequestFormat));
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(bodyParser.json());

// public routes
app.get('/', (req, res) => {
    res.send({
        message: 'success',
    });
});
app.get('/api/health', (req, res) => {
    res.send('Health is A OK.');
});

if (process.env.NODE_ENV.localeCompare('prod') !== 0) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
    }));
}

// protected routes
// app.use(firebaseApi.verifyIdToken);

app.use(initScope);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/activity-log', activityLogRoutes);
app.use('/api/payment', paymentRoutes);

// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => {
    throw boom.notFound('Endpoint Not Found');
});
app.use(logError);
app.use(errorHandler.token);
app.use(errorHandler.validation);
app.use(errorHandler.all);

module.exports = app;