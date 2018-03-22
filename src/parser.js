let logger = require("./logger")
let {SocketClient} = require('./socketClient')
let standards = require('./standards')
let dns = require('dns');
let config = require('../config.json')

function setUpSocketClient(socket, addressType, dstAddress, dstPort) {
    return new SocketClient(socket, addressType, dstAddress, dstPort).setUpSocketConnection()
}

//https://www.ietf.org/rfc/rfc1928.txt
module.exports = {
    parse: function (socket, data) {
        if (data[0] == 0x05)
        {
            if (socket.greeting == false)
            {
                socket.greeting = true
                /*
                 Reply
                 +----+--------+
                 |VER | METHOD |
                 +----+--------+
                 | 1  |   1    |
                 +----+--------+
                 */

                let authTypeFound = false;

                for(let authType of data.slice(2, data.length))
                {
                    switch (authType)
                    {
                        case standards.accesMethod.usernamePassword:
                            socket.authRequired = true
                            socket.write(new Buffer([0x05, standards.accesMethod.usernamePassword]))
                            authTypeFound = true
                            break;
                        case standards.accesMethod.noAuthRequired:
                            if(!config.authenticationUsernamePasswordRequired)
                                socket.write(new Buffer([0x05, standards.accesMethod.noAuthRequired]))

                            authTypeFound = true
                            break;
                    }
                }

                if(!authTypeFound)
                    socket.write(new Buffer([0x05, standards.accesMethod.noAcceptableMethods]))
            } else {
                /*
                 Request
                 +----+-----+-------+------+----------+----------+
                 |VER | CMD |  RSV  | ATYP | DST.ADDR | DST.PORT |
                 +----+-----+-------+------+----------+----------+
                 | 1  |  1  | X'00' |  1   | Variable |    2     |
                 +----+-----+-------+------+----------+----------+
                 */
                switch (data[1])
                {
                    case standards.command.connect:
                        let addressType = data[3]
                        let dstAddress = null
                        let dstPort = parseInt(data.slice(-2).toString("hex"), 16)

                        switch (addressType)
                        {
                            case standards.addressType.ipv4:
                                dstAddress = data.slice(4, data.length - 2).join(".")
                                socket.client = setUpSocketClient(socket, addressType, dstAddress, dstPort)
                                break;
                            case standards.addressType.domainName:
                                let domainName = new Buffer(data).toString("utf8", 5, data.length - 2).trim();
                                dns.lookup(domainName, (err, address, family) =>
                                {
                                    dstAddress = address
                                    socket.client = setUpSocketClient(socket, addressType, dstAddress, dstPort)
                                });
                                break;
                            case standards.addressType.ipv6:
                                dstAddress = new Buffer(data.slice(4, data.length - 2)).toString("hex").match(/.{4}/g).join(':')
                                socket.client = setUpSocketClient(socket, addressType, dstAddress, dstPort)
                                break;
                        }

                        break;
                    case standards.command.bind:
                        //todo
                        console.log("sdadas")
                        break;
                    case standards.command.udpAssociative:
                        //todo
                        break;
                }
            }
        } else if (data[0] == 0x01 && socket.greeting && socket.authRequired)
        {
            //authentication
            let username = data.toString("utf8", 2, 2 + data[1])
            let password = data.toString("utf8", 3 + data[1], 2 + data[3 + data[1]])

            if(config.authenticationUsernamePasswordRequired)
            {
                if(config.authentication.username == username && config.authentication.password == password)
                {
                    socket.write(new Buffer([0x01, 0x00])) //success
                } else {
                    socket.write(new Buffer([0x01, 0x01])) //failure
                }
            } else {
                socket.write(new Buffer([0x01, 0x00]))
            }
        } else if (data[0] == 0x04) {
            //todo throw error not supported now
            logger.log("error")
        } else {

            //packets
            try {
                if (socket.client.writable)
                    socket.client.write(data)
            } catch (e) {
                //todo log error
            }
        }
    }
}