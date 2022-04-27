const FileUploader = require('../utils/file-uploader');
const dbService = require('../db/dbService');

function processUpload(uploadType = 'file', uploadField = null) {
    // eslint-disable-next-line func-names
    return async function (req, res, next) {
        try {
            // const configKey = `${uploadType}_UPLOAD_CONFIG`;
            const getParams = {
                key: `${uploadType}_UPLOAD_CONFIG`,
            };
            let uploadConfig = await dbService.checkExists('Config', getParams);
            uploadConfig = JSON.parse(JSON.stringify(uploadConfig));
            const fileUploader = FileUploader.initialize(uploadConfig.value, uploadField);
            await fileUploader(req, res);
            next();
        } catch (err) {
            next(err);
        }
    };
}

module.exports = processUpload;