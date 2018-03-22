var config = require('../config.json')

module.exports = {
    log: function (message) {
        console.log(`[*] ${message}`)
    },
    error: function (message) {
        console.log(`[*][ERROR] ${message}`)
    },
    debug: function (message) {
        if(config.debug)
            console.log(message)
    },
    logObj: function (obj) {
        console.log(`[*] `, obj)
    }
}