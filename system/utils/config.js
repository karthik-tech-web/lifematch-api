const uniqid = require('uniqid');

const generateUniqueString = (prefix = '') => uniqid(prefix);

const passwordValidation = (value) => {
    // eslint-disable-next-line no-useless-escape
    const re = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/;
    return re.test(value);
};
const jwtSecretSalt = 'L!FeMaTcH$@123';
const jwtEmailVerifySecretSalt = 'L!FeMaTcH$@123';
const jwtResetPasswdSecretSalt = 'L!FeMaTcH$@123';
const PawwordsaltRounds = 10;

const indexObj = Object.freeze({
    bookmark: 'bookmarks',
    cart: 'Cart',
    comment: 'comments',
    commentLike: 'commentLikes',
    contact: 'Contact',
    follower: 'followers',
    like: 'likes',
    post: 'posts',
    postView: 'postView',
    profileLike: 'profileLikes',
    unlike: 'unlikes',
});

const paymentMethodObj = Object.freeze({
    1: 'DebitCard',
    2: 'CreditCard',
    3: 'Netbanking',
    4: 'upi',
    5: 'others',
});

const paymentGatewayObj = Object.freeze({
    1: 'Payoneer',
    2: 'Stripe',
});

const storageTypeObj = Object.freeze({
    1: 'server',
    2: 'aws',
    // 3: 'Netbanking',
    // 4: 'upi',
    // 5: 'others',
});

const chatSecret = 'HYDRA!@#$meet$#@!';

// eslint-disable-next-line no-nested-ternary
const getPostType = (postType = 1) => ((postType === 1) ? 'Event' : (postType === 2) ? 'Video' : 'Feed');

const searchIndexObj = Object.freeze({
    User: 'users_search_index',
    posts: 'title_and_description',
});

const stopWords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its',
    'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this',
    'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because',
    'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
    'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
    'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just',
    'don', 'should', 'now'];

module.exports = {
    generateUniqueString,
    passwordValidation,
    jwtEmailVerifySecretSalt,
    jwtResetPasswdSecretSalt,
    indexObj,
    paymentMethodObj,
    paymentGatewayObj,
    chatSecret,
    getPostType,
    searchIndexObj,
    stopWords,
    storageTypeObj,
    PawwordsaltRounds,
    jwtSecretSalt,
};