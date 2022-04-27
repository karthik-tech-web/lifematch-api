/* eslint-disable no-console */
const sgMail = require('@sendgrid/mail');

const sendMail = async(msg, mailSettings) => {
    try {
        const apiKey = mailSettings.API_KEY;
        sgMail.setApiKey(apiKey);
        (async() => {
            try {
                await sgMail.send(msg, (err) => {
                    console.log(err);
                });
            } catch (err) {
                console.log(err.toString());
            }
        })();
        return true;
    } catch (err) {
        return err;
    }
};
module.exports = {
    sendMail,
};