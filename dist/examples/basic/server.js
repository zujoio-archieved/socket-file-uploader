const uploader = require('@zujo/socket-file-uploader');

const {Server} = require('http');
const socket = require('socket.io');

var server = new Server();
var io = socket(server);


io.on('connect', (socket) => {
    console.log('user connected');
    
    var upload = new uploader(socket);          //make new instance of uploader provide socket as an Arguments
    upload.uploadPath =  __dirname + '/files/'; //set the path of directory where files being saved

})


server.listen(3000, () => {
    console.log('server is up');
})