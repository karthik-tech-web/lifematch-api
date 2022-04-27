module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: [
        'airbnb-base',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    rules: {
        'linebreak-style': 0,
        indent: ['error', 4],
        'no-multiple-empty-lines': [1, {
            max: 1,
        }],
        'no-underscore-dangle': [
            'error',
            {
                allow: [
                    '_id',
                ],
            },
        ],
        'import/newline-after-import': ['error', {
            count: 1,
        }],
        'eol-last': 0,
        'space-before-function-paren': ['error', {
            anonymous: 'always',
            named: 'never',
            asyncArrow: 'never',
        }],
        'no-param-reassign': ['error', {
            props: false
        }],
        'new-cap': 0,
        'max-len': ['error', {
            code: 300
        }],
        'no-plusplus': ['error', {
            allowForLoopAfterthoughts: true
        }],
    },
};