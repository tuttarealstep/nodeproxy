var net = require('net')
var logger = require('./src/logger')
var parser = require('./src/parser')
var config = require('./config')

var clients = []


var server = net.createServer(function (socket)
{
    //Additional info for socket
    socket.id = socket.remoteAddress + ":" + socket.remotePort //socketId remoteAddress:remotePort
    socket.greeting = false //check for client greeting
    socket.client = null //value for store connection from the socket

    logger.debug("[CLIENT][" + socket.id + "]  Connected!")
    clients.push(socket)

    socket.on('data', function (data) {
        logger.debug(data)
        parser.parse(clients[clients.indexOf(socket)], data)
    });

    socket.on('end', function () {
        clients.splice(clients.indexOf(socket), 1);
        logger.debug("[CLIENT][" + socket.id + "]  Disconnected!")
    });

    socket.on('error', function (error) {
        logger.error("[SOCKET][0] " + error.toString())
        logger.debug(error)
        socket.end()
    });

}).listen({
    port: config.port
});

console.log("Proxy server started on: " + server.address().port)