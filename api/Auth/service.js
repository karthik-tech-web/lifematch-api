const mongoose = require('mongoose');
const userIndex = require('../Users/index');
const surveyIndex = require('../Survey/index');
const locationIndex = require('../Location/index');
const utils = require('../System/utils/datetime');

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

const viewSurveyService = async(tenantId, params) => {
    const surveyModel = await surveyIndex.getModel(tenantId);
    const list = await surveyModel.aggregate(
        [{
            $match: {
                _id: {
                    $eq: ObjectId(params.survey_id.toString()),
                },
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                theme: 1,
                data: 1,
            },
        },
        ],
    );
    return list[0];
};

const locationDetailService = async(tenantId, params) => {
    const locationModel = await locationIndex.getModel(tenantId);
    const list = await locationModel.aggregate(
        [{
            $match: {
                _id: {
                    $eq: ObjectId(params.location_id.toString()),
                },
            },
        },
        {
            $sort: {
                name: 1,
            },
        },
        {
            $lookup: {
                from: 'surveys',
                localField: 'survey_id',
                foreignField: '_id',
                as: 'survey_details',
            },
        },
        {
            $unwind: {
                path: '$survey_details',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                email_subject: 1,
                email_body: 1,
                location_name: {
                    $cond: ['$name', '$name', 'N/A'],
                },
                allow_preview: {
                    $cond: ['$allow_preview', '$allow_preview', false],
                },
                allow_email: {
                    $cond: ['$allow_email', '$allow_email', false],
                },
                allow_ack_email: {
                    $cond: ['$allow_ack_email', '$allow_ack_email', false],
                },
                logo_url: {
                    $cond: ['$logo_url', '$logo_url', 'N/A'],
                },
                address: {
                    $cond: ['$address', '$address', 'N/A'],
                },
                qr_description: {
                    $cond: ['$qr_description', '$qr_description', 'N/A'],
                },
                latlong: {
                    $cond: ['$latlong', '$latlong', 'N/A'],
                },
                zoom: {
                    $cond: ['$zoom', '$zoom', 'N/A'],
                },
                survey_id: 1,
                survey_name: {
                    $cond: ['$survey_details.name', '$survey_details.name', 'N/A'],
                },
                status: 1,
                created_by: 1,
                updated_by: 1,
                visit_date: utils.getFormattedDatetime('$createdAt'),
                visit_time: { $dateToString: { format: '%H:%M:%S', date: '$createdAt', timezone: 'Asia/Singapore' } },
                preview_message: {
                    $cond: ['$preview_message', '$preview_message', 'N/A'],
                },
            },
        },
        ],
    );
    return list;
};

module.exports = {
    createUserService,
    getUserDetailService,
    updateUserService,
    checkUserExists,
    viewSurveyService,
    locationDetailService,
};