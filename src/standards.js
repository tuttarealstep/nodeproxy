const accesMethod = {
    noAuthRequired: 0x00,
    gssApi: 0x01,
    usernamePassword: 0x02,
    noAcceptableMethods: 0xFF
}

const command = {
    connect: 0x01,
    bind: 0x02,
    udpAssociative: 0x03
}

const addressType = {
    ipv4: 0x01,
    domainName: 0x03,
    ipv6: 0x04
}

const reply = {
    succeeded: 0x00,
    generalServerFailure: 0x01,
    connectionNotAllowed: 0x02,
    networkUnreachable: 0x03,
    hostUnreachable: 0x04,
    connectionRefused: 0x05,
    ttlExpired: 0x06,
    commandNotSupported: 0x07,
    addressTypeNotSupported: 0x09
}

module.exports.accesMethod = accesMethod
module.exports.command = command
module.exports.addressType = addressType
module.exports.reply = reply
