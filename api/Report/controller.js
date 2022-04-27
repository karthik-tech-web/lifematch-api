const boom = require('@hapi/boom');
const dbService = require('../../system/db/dbService');
const sendMail = require('../../system/sendmail/index');
const activity = require('../ActivityLog/controller');
// const utilsChecks = require('../../system/utils/checks');

const getReport = async(params) => {
    const getParams = {};
    getParams.key = (params.reportType === 1) ? 'REPORT_USER' : 'REPORT_VIDEO';
    const getReportDetails = await dbService.checkExists('Config', getParams);
    if (!getReportDetails || !getReportDetails._id || !getReportDetails.value || !getReportDetails.value.reportList) {
        throw boom.badRequest('Something went wrong. Please try again.');
    }
    const result = {
        status: 200,
        message: 'Report List',
    };
    result.detail = getReportDetails.value.reportList;
    return result;
};

const sendReport = async(params) => {
    const getReporterParams = {
        _id: params.reporterId,
    };
    const reporterDetails = await dbService.checkExists('User', getReporterParams);
    if (!reporterDetails || !reporterDetails._id) {
        throw boom.notFound('Invalid Reporter Id');
    }
    const reportedUserParams = {
        _id: params.reportedUserId,
    };
    const reportedUserDetails = await dbService.checkExists('User', reportedUserParams);
    if (!reportedUserDetails || !reportedUserDetails._id) {
        throw boom.notFound('Invalid Uploader Id');
    }
    let postType = 'User';
    if (params.postType) {
        if (params.postType === 1) { postType = 'Event'; } else if (params.postType === 2) { postType = 'Video'; } else if (params.postType === 3) { postType = 'Feed'; }
    }
    const reporterContent = `Dear ${reporterDetails.displayName},<br> As per your request ${postType} has beeen reported Successfully. <br><br>Regards,<br> Gigavus Admin Team`;
    const adminReportContent = `Dear Admin,<br> As per ${reporterDetails.displayName} request, ${postType} has beeen reported against ${reportedUserDetails.displayName} Successfully. <br><br>Regards,<br> Gigavus Admin Team`;
    const checkReport = await await dbService.addService('Report', params);
    if (checkReport && checkReport._id) {
        throw boom.badRequest(`${postType} has been Reported Already`);
    }
    const addReport = await await dbService.addService('Report', params);
    if (!addReport || !addReport._id) {
        throw boom.badRequest('Something went wrong. Please try again');
    }
    const mailConfigDetails = await dbService.checkExists('Config', { key: 'APP_INFO_AND_MAIL_CONFIG' });
    if (!mailConfigDetails || !mailConfigDetails._id) {
        throw boom.badRequest('Something went wrong. Please try again');
    }
    const adminReportParams = {
        mailSettings: mailConfigDetails.value.MAIL_SETTINGS,
        from: mailConfigDetails.value.DEFAULT_FROM_MAIL,
        to: mailConfigDetails.value.ADMIN_MAIL,
        subject: 'Report Mail',
        data: adminReportContent,
    };
    await sendMail.sendMail(adminReportParams);

    const userReportParams = {
        mailSettings: mailConfigDetails.value.MAIL_SETTINGS,
        from: mailConfigDetails.value.DEFAULT_FROM_MAIL,
        to: reporterDetails.email,
        subject: 'Report Mail',
        data: reporterContent,
    };
    await sendMail.sendMail(userReportParams);
    /** activity Log starts */
    const logParams = {
    // logModel: 'post',
        logType: 'report',
        userId: params.reporterId,
    // logModelId: params.postId,
    };
    logParams.logModel = (params.reportType === 1) ? 'user' : 'post';
    logParams.logModelId = (params.reportType === 1) ? params.reportedUserId : params.postId;
    await activity.activityLog(logParams);
    /** activity Log Ends */
    const result = {
        status: 200,
        message: `${postType} has been Reported Succesfully`,
    };
    return result;
};

module.exports = {
    getReport,
    sendReport,
};