const AWS = require('aws-sdk');
const fs = require('fs');
const fileUtil = require('../../utils/file');
const dbService = require('../../db/dbService');

const createFileURL = async(params) => {
    try {
        const awsConfig = await dbService.checkExists('Config', { key: 'AWS_CONFIG' });
        AWS.config.update({
            accessKeyId: awsConfig.value.access_key_id,
            secretAccessKey: awsConfig.value.secret_access_Key,
        });
        const s3 = new AWS.S3({
            endpoint: awsConfig.value.endpoint,
            signatureVersion: awsConfig.value.signature_version,
            region: awsConfig.value.region,
        });
        const keyName = params.keyId ? params.keyId : params.filename;
        const awsParams = {
            Bucket: awsConfig.value.bucket,
            Key: keyName,
            Body: fs.readFileSync(params.path),
            ContentType: params.mimetype,
        };
        return new Promise((resolve, reject) => {
            s3.upload(awsParams, (err, data) => {
                if (err) {
                    return reject(err);
                }
                fileUtil.deleteFileByPath(params.path);
                return resolve(data);
            });
        });
    } catch (err) {
        fileUtil.deleteFileByPath(params.path);
        return err;
    }
};

const getFileURL = async(keyValue) => {
    try {
        const awsConfig = await dbService.checkExists('Config', { key: 'AWS_CONFIG' });
        AWS.config.update({
            accessKeyId: awsConfig.value.access_key_id,
            secretAccessKey: awsConfig.value.secret_access_Key,
        });
        const s3 = new AWS.S3({
            endpoint: awsConfig.value.endpoint,
            signatureVersion: awsConfig.value.signature_version,
            region: awsConfig.value.region,
        });
        const awsParams = {
            Bucket: awsConfig.value.bucket,
            Key: keyValue,
        };
        const url = s3.getSignedUrl('getObject', awsParams);
        return url;
    } catch (err) {
        return err;
    }
};

const deleteFileURL = async(keyValue) => {
    try {
        const awsConfig = await dbService.checkExists('Config', { key: 'AWS_CONFIG' });
        const s3Client = new AWS.S3({
            accessKeyId: awsConfig.value.access_key_id,
            secretAccessKey: awsConfig.value.secret_access_Key,
            endpoint: awsConfig.value.endpoint,
            // sslEnabled: false,
            // s3ForcePathStyle: true
        });
        const awsParams = {
            Bucket: awsConfig.value.bucket,
            Key: keyValue,
        };
        const response = await s3Client.deleteObject(awsParams).promise();
        return response;
    } catch (err) {
        console.log('=======err====>', err);
        return err;
    }
};

module.exports = {
    getFileURL,
    deleteFileURL,
    createFileURL,
};