const ejs = require('ejs');
const sendGridMailService = require('../lib/sendgrid/index');

// path of email template, dynamic parameters, mail options like from address to address
const sendMail = async(mailOptions) => {
    const mailSettings = (mailOptions.mailSettings) ? mailOptions.mailSettings : null;
    const msg = {
        to: mailOptions.to,
        from: (mailOptions.from) ? mailOptions.from : null,
        cc: (mailOptions.cc) ? mailOptions.cc : null,
        bcc: (mailOptions.bcc) ? mailOptions.bcc : null,
        subject: mailOptions.subject,
        text: mailOptions.data,
        html: mailOptions.data,
    };
    const response = await sendGridMailService.sendMail(msg, mailSettings);
    return response;
};

const sendMailWithejs = async(path, params, mailOptions) => {
    await ejs.renderFile(path, { tempdata: params }, async(err, data) => {
        if (err) {
            console.log(err);
        } else {
            mailOptions.data = data;
            const response = await sendMail(mailOptions);
            return response;
        }
    });
};

module.exports = {
    sendMail,
    sendMailWithejs,
};