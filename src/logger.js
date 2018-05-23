var config = require('../config.json')

module.exports = {
    log: function (message) {
        if(!config.disableOutput)
            console.log(`[*] ${message}`)
    },
    error: function (message) {
        if(!config.disableOutput)
            console.log(`[*][ERROR] ${message}`)
    },
    debug: function (message) {
        if(config.debug)
            console.log(message)
    },
    logObj: function (obj) {
        if(!config.disableOutput)
            console.log(`[*] `, obj)
    }
}