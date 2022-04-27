const {
    DateTime,
} = require('luxon');
const boom = require('@hapi/boom');

const getCurrentUnixTimestamp = () => Math.floor((DateTime.local().valueOf()) / 1000);

const convertStringToUnixTimestamp = (timeString, format, timezone) => Math.floor((DateTime.fromFormat(timeString, format, {
    zone: timezone,
}).valueOf()) / 1000);

const getStartOfDay = (timestamp, timezone) => (DateTime.fromMillis(timestamp * 1000).setZone(timezone).startOf('day').valueOf()) / 1000;

const getEndOfDay = (timestamp, timezone) => Math.floor((DateTime.fromMillis(timestamp * 1000).setZone(timezone).endOf('day').valueOf()) / 1000);

const formatUnixTimestamp = (timestamp, timezone, format) => DateTime.fromMillis(timestamp * 1000).setZone(timezone).toFormat(format);

const mongoFormatedDateTime = (dateTime, dateFormat = '%d/%m/%Y', timeZoneEnable = false, timeZoneType = 'Asia/Singapore') => {
    const convertFormat = {
        format: dateFormat,
        date: dateTime,
    };
    if (timeZoneEnable === true) {
        convertFormat.timezone = timeZoneType;
    }
    return {
        $dateToString: convertFormat,
    };
};

const mongoDateDiff = (startDate = null, endDate = null, unitType = 'minute') => {
    const unitTypeArray = ['millisecond', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'];
    if (!startDate || !endDate) {
        throw boom.badRequest('Invalid Date');
    } else if (unitTypeArray.indexOf(unitType) === -1) {
        throw boom.badRequest('Invalid unitType');
    }
    const datediff = {
        format: startDate,
        date: endDate,
        unit: unitType,
    };

    return {
        $dateDiff: datediff,
    };
};

const convertTimestampToFormat = (timestamp, timezone, format) => DateTime.fromMillis(timestamp * 1000).setZone(timezone).toFormat(format);

module.exports = {
    getCurrentUnixTimestamp,
    convertStringToUnixTimestamp,
    getStartOfDay,
    getEndOfDay,
    formatUnixTimestamp,
    mongoFormatedDateTime,
    convertTimestampToFormat,
    mongoDateDiff,
};