const path = require('path');

/**
 * @param name {string}
 * @returns {string}
 */
const resolve = (name) => {
    return path.resolve(__dirname, '../..', name);
};
module.exports = { resolve };
