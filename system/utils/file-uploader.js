/* eslint-disable no-param-reassign */
const multer = require('multer');
const boom = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const stringConfig = require('./config');

class FileUploader {
    constructor(config) {
        this.multerConfig = {
            storage: multer.diskStorage({
                destination(req, file, cb) {
                    const uploadFolder = config.uploadFolder ? `${path.resolve(__dirname, '../..')}/${config.uploadFolder}` : process.env.FILE_UPLOAD_FOLDER;
                    if (!fs.existsSync(uploadFolder)) {
                        fs.mkdirSync(uploadFolder);
                        cb(null, uploadFolder);
                    } else {
                        cb(null, uploadFolder);
                    }
                },
                filename(req, file, cb) {
                    const name = file.originalname;
                    const newName = stringConfig.generateUniqueString() + name.substr(name.lastIndexOf('.'), name.length - 1);
                    cb(null, newName);
                },
            }),
            limits: { fileSize: config.maxFileSize },
            fileFilter(req, file, cb) {
                if (!(config.allowedFileTypes.indexOf(file.mimetype) > -1)) {
                    cb(boom.badRequest(`File should be of type ${config.allowedFileTypes.join(', ')}`), false);
                }
                cb(null, true);
            },
        };
    }

    static initialize(config, fieldData = null) {
        const uploader = new FileUploader(config);
        const uploadFields = fieldData || [{ name: 'file', maxCount: 10 }];
        const multerObj = multer(uploader.multerConfig).fields(uploadFields);
        return (req, res) => new Promise((resolve, reject) => multerObj(req, res, (err) => {
            if (err && err.code && err.code === 'LIMIT_FILE_SIZE') {
                reject(boom.badRequest(`File size exceeds limit of ${config.maxFileSize / (1024 * 1024)} MB`));
            } else {
                const errorField = (err && err.code && err.code === 'LIMIT_UNEXPECTED_FILE') ? err.field : '';
                if (err && err.name && err.message) {
                    reject(boom.badRequest(`${err.name}--${err.message} ${errorField}`));
                } else {
                    reject(err);
                }
            }
        }));
    }
}

module.exports = FileUploader;