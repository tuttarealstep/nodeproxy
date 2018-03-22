let net = require("net")
let logger = require("./logger")
let standards = require('./standards')

class SocketClient
{
    constructor(socket, aType, dstAddr, dstPort)
    {
        this.socket = socket
        this.aType = aType
        this.dstAddr = dstAddr
        this.dstPort = dstPort
    }

    setUpSocketConnection()
    {
        return net.createConnection({ host: this.dstAddr, port: this.dstPort }, () =>
        {
            this.socket.client.id = this.dstAddr + ":" + this.dstPort
            logger.log("Request to: " + this.socket.client.id);
            /*
             Reply
             +----+-----+-------+------+----------+----------+
             |VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
             +----+-----+-------+------+----------+----------+
             | 1  |  1  | X'00' |  1   | Variable |    2     |
             +----+-----+-------+------+----------+----------+
             */
            if(this.socket.writable)
                this.socket.write(new Buffer([0x05, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))
        }).on('data', (data) => {
            if(this.socket.writable)
                this.socket.write(data)
        }).on('end', () => {
            logger.log("Disconnected from: " + this.socket.client.id);
        }).on('error', (error) => {

            if (!this.socket.client.writable)
                return
            //better support for this
            /*
             o  REP    Reply field:
             o  X'00' succeeded
             o  X'01' general SOCKS server failure
             o  X'02' connection not allowed by ruleset
             o  X'03' Network unreachable
             o  X'04' Host unreachable
             o  X'05' Connection refused
             o  X'06' TTL expired
             o  X'07' Command not supported
             o  X'08' Address type not supported
             o  X'09' to X'FF' unassigned
             */

            logger.error("[SOCKET.CLIENT][0] " + error.toString())
            let errorBuffer = new Buffer([0x05, standards.reply.generalServerFailure, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])

            switch (error.code)
            {
                case 'ENOENT':
                case 'ENOTFOUND':
                case 'ETIMEDOUT':
                case 'EHOSTUNREACH':
                    errorBuffer[1] = standards.reply.hostUnreachable;
                    break;
                case 'ENETUNREACH':
                    errorBuffer[1] = standards.reply.networkUnreachable;
                    break;
                case 'ECONNREFUSED':
                    errorBuffer[1] = standards.reply.connectionRefused;
                    break;
            }

            logger.debug(error)

            this.socket.client.write(errorBuffer)
            this.socket.client.end()
            //this.socket.end()
            //todo check this close or leave open?
        })
    }
}

exports.SocketClient = SocketClient