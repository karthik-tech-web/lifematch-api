const index = require('./index');

const listService = async(params) => {
    const model = await index.getModel();
    const list = await model.aggregate(
        [{
            $match: params.matchCondition1,
        },
        {
            $project: {
                _id: 1,
                logModel: 1,
                logType: 1,
                logModelId: 1,
                userId: 1,
                createdAt: 1,
            },
        },
        {
            $lookup: {
                from: 'posts',
                let: {
                    postId: '$logModelId',
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ['$_id', '$$postId'],
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        postType: 1,
                        userId: 1,
                    },
                },
                ],
                as: 'activityPost',
            },
        },
        { $unwind: { path: '$activityPost', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'users',
                let: {
                    userId: '$logModelId',
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ['$_id', '$$userId'],
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        displayName: 1,
                        online: 1,
                        photoUrl: 1,
                    },
                },
                ],
                as: 'activityUser',
            },
        },
        { $unwind: { path: '$activityUser', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'users',
                let: {
                    userId: '$userId',
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ['$_id', '$$userId'],
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        displayName: 1,
                        online: 1,
                        photoUrl: 1,
                    },
                },
                ],
                as: 'userDetails',
            },
        },
        { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                logModel: 1,
                logType: 1,
                // logModelId: 1,
                // userId: 1,
                // activityPost: 1,
                // activityUser: 1,
                // userDetails: 1,
                createdAt: 1,
                logPostTitle: {
                    $cond: ['$activityPost.title', '$activityPost.title', 'NA'],
                },
                postType: {
                    $cond: ['$activityPost.postType', '$activityPost.postType', 3],
                },
                logUserName: {
                    $cond: ['$activityUser.displayName', '$activityUser.displayName', null],
                },
                logUserOnline: {
                    $cond: ['$activityUser.online', '$activityUser.online', false],
                },
                logUserPhotoUrl: {
                    $cond: ['$activityUser.photoUrl', '$activityUser.photoUrl', null],
                },
                userName: {
                    $cond: ['$userDetails.displayName', '$userDetails.displayName', null],
                },
                userOnline: {
                    $cond: ['$userDetails.online', '$userDetails.online', false],
                },
                userPhotoUrl: {
                    $cond: ['$userDetails.photoUrl', '$userDetails.photoUrl', null],
                },
            },
        },
        // {
        //     $match: params.matchCondition2,
        // },
        {
            $sort: params.sortCondition,
        },
        {
            $facet: {
                paginatedResults: [{
                    $skip: params.skipCondition,
                }, {
                    $limit: params.limitCondition,
                }],
                totalCount: [{
                    $count: 'count',
                }],
            },
        },
        ],
    );
    return list;
};

module.exports = {
    listService,
};