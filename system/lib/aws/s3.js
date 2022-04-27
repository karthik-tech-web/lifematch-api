const { S3 } = require('aws-sdk');
const dbService = require('../../db/dbService');
// const configController = require('../../../api/Config/controller');
const utilsChecks = require('../../utils/checks');

module.exports = class AwsS3 {
    constructor(s3ClientConfig, s3Config, bucket = '') {
        if (process.env.USE_LOCAL_AWS_CREDS === 'true') {
            s3ClientConfig.accessKeyId = process.env.accessKeyId;
            s3ClientConfig.secretAccessKey = process.env.secretAccessKey;
        }
        this.config = s3Config;
        this.client = new S3(s3ClientConfig);
        this.bucket = bucket;
    }

    static async initialize() {
        const config = await dbService.checkExists('Config', { key: 'GOOGLE_SYNC_SETTING' });
        const s3Config = {
            apiVersion: config.apiVersion,
            region: config.region,
            signatureVersion: config.signatureVersion,
            endpoint: config.endpoint,
        };
        return new AwsS3(s3Config, config, bucket);
    }

    static getBucketnameFromConfig(bucketCode, config) {
        const test = config.bucket.filter((val) => val.code === bucketCode).map((s) => s.name);
        return test[0];
    }

    async upload(keyName, body, contentType, aclPermission) {
        try {
            const params = {
                Bucket: this.bucket,
                Key: keyName,
                Body: body,
                ContentType: contentType,
            };
            if (aclPermission && aclPermission !== '' && aclPermission !== null) {
                params.ACL = aclPermission;
            }
            return new Promise((resolve, reject) => {
                this.client.upload(params, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(data);
                });
            });
        } catch (err) {
            return err;
        }
    }

    async getFileURL(keyName, extName, openInNewTab) {
        const params = {
            Bucket: this.bucket,
            Key: keyName,
            Expires: this.config.fileURLExpires,
        };
        if (extName && !utilsChecks.isEmptyString(extName) && !utilsChecks.isNull(extName)) {
            if (openInNewTab) {
                params.ResponseContentDisposition = `inline; filename ="${extName}"`;
            } else {
                params.ResponseContentDisposition = `attachment; filename ="${extName}"`;
            }
        }
        const url = await this.client.getSignedUrlPromise('getObject', params);
        return url;
    }

    async delete(keyName) {
        const params = {
            Bucket: this.bucket,
            Key: keyName,
        };
        const response = await this.client.deleteObject(params).promise();
        return response;
    }

    async cloneObject(file, aclPermission) {
        const copyBucketName = this.config.bucket.filter((val) => val.code === file.copyBucketCode).map((s) => s.name)[0];
        const params = {
            Bucket: this.bucket,
            Key: file.fileName,
            CopySource: `${copyBucketName}/${file.copyFileName}`,
        };
        if (aclPermission && aclPermission !== '' && aclPermission !== null) {
            params.ACL = aclPermission;
        }
        const url = this.client.copyObject(params).promise();
        if (url) {
            return { fileName: file.fileName };
        }
        return 'error in copying object';
    }
};