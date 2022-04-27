// const moment = require('moment');
const mongoose = require('mongoose');
const index = require('./index');

const { ObjectId } = mongoose.Types;

const userDetails = async(params) => {
    const Model = await index.getModel();
    const result = await Model.aggregate(
        [{
            $match: params.match1,
        },
        {
            $project: {
                _id: 1,
                displayName: 1,
                countryCode: 1,
                phone: 1,
                email: 1,
                photoUrl: 1,
                likeCount: { $cond: ['$likeCount', '$likeCount', 0] },
                followerCount: { $cond: ['$followerCount', '$followerCount', 0] },
                about: {
                    $cond: [
                        '$about',
                        '$about',
                        null,
                    ],
                },
                foundingMember: 1,
                twoFactorEnable: {
                    $cond: [
                        '$twoFactorEnable',
                        '$twoFactorEnable',
                        false,
                    ],
                },
                authorizationKey: {
                    $cond: [
                        '$authorizationKey',
                        '$authorizationKey',
                        null,
                    ],
                },
                googleLinked: { $cond: ['$googleLinked', '$googleLinked', null] },
                googleToken: { $cond: ['$googleToken', '$googleToken', null] },
                grefreshToken: { $cond: ['$grefreshToken', '$grefreshToken', null] },
                googleAccess: { $cond: ['$googleAccess', '$googleAccess', null] },
                storageType: { $cond: ['$storageType', '$storageType', '1'] },
            },
        },
        {
            $lookup: {
                from: 'posts',
                let: { userId: '$_id' },
                pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ['$userId', '$$userId'],
                        },
                    },
                },
                // get comment count
                {
                    $lookup: {
                        from: 'comments',
                        let: { post_id: '$_id' },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ['$postId', '$$post_id'],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                comment: 1,
                            },
                        },
                        {
                            $group: {
                                _id: 0,
                                totalCommentCount: {
                                    $sum: 1,
                                },
                            },
                        },
                        ],
                        as: 'commentDetail',
                    },
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        postType: 1,
                        commentDetail: 1,
                        likeCount: { $cond: ['$likeCount', '$likeCount', 0] },
                        bookmarkCount: { $cond: ['$bookmarkCount', '$bookmarkCount', 0] },
                    },
                },
                // { $unwind: { path: '$likes', preserveNullAndEmptyArrays: true } },
                // { $unwind: { path: '$bookmark', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$commentDetail', preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: 0,
                        totalLikeCount: {
                            $sum: '$likeCount',
                        },
                        totalCommentCount: {
                            $sum: '$commentDetail.totalCommentCount',
                        },
                        totalBookmarkCount: {
                            $sum: '$bookmarkCount',
                        },
                        // postCount: {
                        //     $sum: 1,
                        // },
                        postCount: {
                            $sum: {
                                $cond: [
                                    { $ne: ['$postType', 3] }, 1, 0,
                                ],
                            },
                        },
                    },
                },
                ],
                as: 'userPostDetail',
            },
        },
        {
            $lookup: {
                from: 'followers',
                let: {
                    userId: '$_id',
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$userId', '$$userId'] },
                                { $eq: [ObjectId(params.loggedInUserId.toString()), '$followerId'] },
                            ],
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        followerId: 1,
                    },
                },
                ],
                as: 'followerDetails',
            },
        },
        // { $unwind: { path: '$followerDetails', preserveNullAndEmptyArrays: true } },
        // get profile like Count
        {
            $lookup: {
                from: 'profileLikes',
                let: {
                    userId: '$_id',
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$userId', '$$userId'] },
                                { $eq: [ObjectId(params.loggedInUserId.toString()), '$likedUserId'] },
                            ],
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        likedUserId: 1,
                    },
                },
                ],
                as: 'profileLikes',
            },
        },
        { $unwind: { path: '$userPostDetail', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                displayName: 1,
                countryCode: 1,
                phone: 1,
                email: 1,
                photoUrl: 1,
                followerCount: 1,
                isFollowed: {
                    $cond: [{
                        $arrayElemAt: ['$followerDetails', 0],
                    },
                    true,
                    false,
                    ],
                },
                isProfileLiked: {
                    $cond: [
                        {
                            $arrayElemAt: ['$profileLikes', 0],
                        },
                        true,
                        false,
                    ],
                },
                totalLikeCount: {
                    $add: ['$likeCount', '$userPostDetail.totalLikeCount'],
                },
                totalCommentCount: {
                    $cond: [
                        '$userPostDetail.totalCommentCount',
                        '$userPostDetail.totalCommentCount',
                        0,
                    ],
                },
                totalBookmarkCount: {
                    $cond: [
                        '$userPostDetail.totalBookmarkCount',
                        '$userPostDetail.totalBookmarkCount',
                        0,
                    ],
                },
                totalPostCount: {
                    $cond: [
                        '$userPostDetail.postCount',
                        '$userPostDetail.postCount',
                        0,
                    ],
                },
                about: 1,
                foundingMember: 1,
                twoFactorEnable: 1,
                authorizationKey: 1,
                googleLinked: 1,
                googleToken: 1,
                grefreshToken: 1,
                googleAccess: 1,
                storageType: 1,
            },
        },
        ],
    );
    return result;
};

module.exports = {
    userDetails,
};