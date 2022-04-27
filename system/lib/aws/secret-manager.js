const {
    SecretsManager
} = require('aws-sdk');
const configController = require('../../../api/Config/controller');
const logger = require('../../utils/logger');

module.exports = class AwsSecretsManager {
    constructor(config) {
        if (process.env.USE_LOCAL_AWS_CREDS === 'true') {
            config.accessKeyId = process.env.accessKeyId;
            config.secretAccessKey = process.env.secretAccessKey;
        }
        this.client = new SecretsManager(config)
    }

    static async initialize(configName) {
        const config = await configController.getValueByKey(configName, {
            apiVersion: '2017-10-17',
            region: 'ap-southeast-1'
        });
        return new AwsSecretsManager(config);
    }

    async get(secretName) {
        try {
            const result = await this.client.getSecretValue({
                SecretId: secretName
            }).promise();
            return result.SecretString
        } catch (err) {
            logger(err);
            throw err;
        }

    }
}