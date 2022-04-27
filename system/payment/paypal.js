const axios = require('axios');
const qs = require('query-string');
const https = require('https');
const boom = require('@hapi/boom');
// const paypal = require('paypal-rest-sdk');
const dbService = require('../db/dbService');

const agent = new https.Agent({
    rejectUnauthorized: false,
});

const paypalUrlSandbox = 'https://api-m.sandbox.paypal.com';
const paypalUrlLive = 'https://api-m.paypal.com';

const getPaypalConfig = async() => {
    const config = await dbService.checkExists('Config', { key: 'PAYPAL_CONFIG' });
    if (!config || !config.value) {
        throw boom.notFound('Invalid Paypal Config.');
    }
    return config;
};

const processError = (e) => {
    if (e.response) {
        // The request was made and the server responded with a status code that falls out of the range of 2xx
        return e.response.data;
        // console.log(e.response.status);
        // console.log(e.response.headers);
    } if (e.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        return e.request;
    }
    // Something happened in setting up the request that triggered an Error
    return e.message;
};

const sendRequest = async(params) => {
    try {
        const options = {
            method: params.method,
            url: params.url,
        };
        if (params.headers) {
            options.headers = params.headers;
        }
        if (params.data) {
            options.data = params.data;
        }
        // console.log('======sendRequest=====>', options);
        options.httpsAgent = agent;
        const axiosResponse = await axios(options);
        return axiosResponse;
    } catch (e) {
        throw processError(e);
    }
};

const getPaypalAccessToken = async() => {
    const paypalConfig = await getPaypalConfig();
    console.log('Getting access token from Paypal');
    const paypalUrl = (paypalConfig.value.mode && paypalConfig.value.mode === 'live') ? paypalUrlLive : paypalUrlSandbox;
    const encodedBase64Token = Buffer.from(`${paypalConfig.value.clientId}:${paypalConfig.value.secret}`).toString('base64');
    const authorization = `Basic ${encodedBase64Token}`;

    // return;
    const options = {
        method: 'POST',
        // auth: {
        //     username: paypalConfig.value.clientId,
        //     password: paypalConfig.value.secret,
        // },
        withCredentials: true,
        url: `${paypalUrl}/v1/oauth2/token`,
        data: qs.stringify({
            grant_type: 'client_credentials',
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: authorization,
        },
    };
    try {
        const response = await sendRequest(options);
        /** Sample Response data Starts
        const response = {
            scope: 'https://uri.paypal.com/services/customer/partner-referrals/readwrite https://uri.paypal.com/services/invoicing https://uri.paypal.com/services/vault/payment-tokens/read
            https://uri.paypal.com/services/disputes/read-buyer https://uri.paypal.com/services/payments/realtimepayment https://uri.paypal.com/services/customer/onboarding/user
            https://api.paypal.com/v1/vault/credit-card https://api.paypal.com/v1/payments/.* https://uri.paypal.com/services/payments/referenced-payouts-items/readwrite
            https://uri.paypal.com/services/reporting/search/read https://uri.paypal.com/services/customer/partner https://uri.paypal.com/services/vault/payment-tokens/readwrite
            https://uri.paypal.com/services/customer/merchant-integrations/read https://uri.paypal.com/services/applications/webhooks https://uri.paypal.com/services/disputes/update-seller
            https://uri.paypal.com/services/payments/payment/authcapture openid Braintree:Vault https://uri.paypal.com/services/disputes/read-seller https://uri.paypal.com/services/payments/refund
            https://uri.paypal.com/services/risk/raas/transaction-context https://uri.paypal.com/services/partners/merchant-accounts/readwrite https://uri.paypal.com/services/identity/grantdelegation
            https://uri.paypal.com/services/customer/onboarding/account https://uri.paypal.com/payments/payouts https://uri.paypal.com/services/customer/onboarding/sessions https://api.paypal.com/v1/vault/credit-card/.*
            https://uri.paypal.com/services/subscriptions',
            access_token: 'A21AAKGLxGDlE7FSS1pEsUOTFeIdYbVCsjL7X267VdRrIhDOgAYmA7omb5D7-F9LmqW4ExjPZO99LN6Lfza9LboOkuxQM40gw',
            token_type: 'Bearer',
            app_id: 'APP-80W284485P519543T',
            expires_in: 32400,
            nonce: '2022-03-07T10:32:37ZxEeh9Q3T5aAajAdEigltJb8_P6n3VwDdumD6q9aszyk',
        };
        Sample Response data Ends */
        if (!response || response.status !== 200 || !response.data) {
            throw boom.notFound('Paypal Authentication Failed.');
        }
        response.data.paypalUrl = paypalUrl;
        response.data.redirectUrl = paypalConfig.value.redirectUrl;
        return response.data;
    } catch (e) {
        console.log(e);
        console.log('Error: get_access_token');
        throw e;
    }
};

const createPayment = async(params) => {
    try {
        const tokenDetails = await getPaypalAccessToken();
        params.redirect_urls = tokenDetails.redirectUrl;
        if (tokenDetails.access_token) {
            const accessToken = tokenDetails.access_token;
            const options = {
                method: 'POST',
                url: `${tokenDetails.paypalUrl}/v1/payments/payment`,
                data: params,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            };
            const response = await sendRequest(options);
            if (response.data) {
                return response.data;
            }
        }
    } catch (e) {
        console.log('error', e);
        return e;
    }
};

const executePayment = async(params) => {
    try {
        // const paypalConfig = await getPaypalConfig();
        const tokenDetails = await getPaypalAccessToken();
        if (tokenDetails.access_token) {
            const accessToken = tokenDetails.access_token;
            const options = {
                method: 'POST',
                url: `${tokenDetails.paypalUrl}/v1/payments/payment/${params.paymentId}/execute`,
                data: {
                    payer_id: params.payerId,
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            };
            const response = await sendRequest(options);
            if (response.data) {
                return response.data;
            }
        }
    } catch (e) {
        console.log('error', e);
        return e;
    }
};

const getPaymentDetails = async(params) => {
    try {
        const tokenDetails = await getPaypalAccessToken();
        if (tokenDetails.access_token) {
            const accessToken = tokenDetails.access_token;
            const options = {
                method: 'GET',
                url: `${tokenDetails.paypalUrl}/v1/payments/payment/${params.paymentId}`,
                // data,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            };
            const response = await sendRequest(options);
            if (response.data) {
                return response.data;
            }
        }
    } catch (e) {
        console.log('error', e);
        return e;
    }
};

const refundPayment = async(params) => {
    try {
        const tokenDetails = await getPaypalAccessToken();
        const data = {
            reason: params.payerNotes,
        };
        if (params.amount) {
            data.amount = {
                total: params.amount,
                currency: params.currency,
            };
        }
        if (tokenDetails.access_token) {
            const accessToken = tokenDetails.access_token;
            const options = {
                method: 'POST',
                // url: `${tokenDetails.paypalUrl}/v1/payments/captures/${params.salesId}/refund`,
                url: params.url,
                data,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            };
            const response = await sendRequest(options);
            if (response.data) {
                return response.data;
            }
        }
    } catch (e) {
        console.log('error', e);
        return e;
    }
};

const generateInvoice = async(params) => {
    try {
        const tokenDetails = await getPaypalAccessToken();
        const data = {
            reason: params.payerNotes,
        };
        if (params.amount) {
            data.amount = {
                total: params.amount,
                currency: params.currency,
            };
        }
        if (tokenDetails.access_token) {
            const accessToken = tokenDetails.access_token;
            const options = {
                method: 'POST',
                url: `${tokenDetails.paypalUrl}/v1/payments/captures/${params.salesId}/refund`,
                // url: params.url,
                data,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            };
            const response = await sendRequest(options);
            if (response.data) {
                return response.data;
            }
        }
    } catch (e) {
        console.log('error', e);
        return e;
    }
};

module.exports = {
    createPayment,
    executePayment,
    refundPayment,
    getPaymentDetails,
    generateInvoice,
};
