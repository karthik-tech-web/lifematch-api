const mongoose = require('mongoose');
const userIndex = require('../User/index');

const { ObjectId } = mongoose.Types;

const createUserService = async(tenantId, params) => {
    if (params.email) {
        params.email = params.email.toLowerCase();
    }
    const userModel = await userIndex.getModel(tenantId);
    const newUser = new userModel(params);
    const saveUser = await newUser.save();
    return saveUser;
};

const getUserDetailService = async(tenantId, params) => {
    if (params.email) {
        params.email = params.email.toLowerCase();
    }
    const userModel = await userIndex.getModel(tenantId);
    const result = await userModel.aggregate([{
        $match: {
            email: {
                $eq: params.email,
            },
        },
    },
    {
        $lookup: {
            from: 'country_masters',
            let: {
                countryId: '$nationality',
            },
            pipeline: [{
                $match: {
                    $expr: {
                        $eq: ['$_id', '$$countryId'],
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    code: 1,
                    name: 1,
                },
            },

            ],
            as: 'country_details',
        },
    },
    {
        $project: {
            _id: 1,
            first_name: 1,
            last_name: 1,
            email: 1,
            tenant_id: 1,
            status: 1,
            nric_id: 1,
            passport_number: 1,
            password: 1,
            is_mobile_app: 1,
            guest_user: 1,
            country_code: 1,
            phone_number: 1,
            profile_image_url: 1,
            createdAt: 1,
            updatedAt: 1,
            nationality: 1,
            authorization_key: 1,
            two_factor_enable: 1,
            social_auth: 1,
            nationality_id: '$nationality',
            nationality_name: {
                $cond: [{
                    $arrayElemAt: ['$country_details.name', 0],
                }, {
                    $arrayElemAt: ['$country_details.name', 0],
                }, 0],
            },
        },
    },
]);
    return result;
};

const checkUserExists = async(tenantId, params) => {
    if (params.email) {
        params.email = params.email.toLowerCase();
    }
    const userModel = await userIndex.getModel(tenantId);
    const result = await userModel.findOne({
        email: params.email,
    });
    return result;
};

const updateUserService = async(tenantId, pathParams, params) => {
    if (params.email) {
        params.email = params.email.toLowerCase();
    }
    if (pathParams.email) {
        pathParams.email = pathParams.email.toLowerCase();
    }
    const userModel = await userIndex.getModel(tenantId);
    const result = await userModel.findOneAndUpdate(pathParams, params);
    return result;
};

module.exports = {
    createUserService,
    getUserDetailService,
    updateUserService,
    checkUserExists,
};