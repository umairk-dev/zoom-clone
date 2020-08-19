const express = require('express')
var validator = require('validator');
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
var ExpressPeerServer = require('peer').ExpressPeerServer;

var options = {
    debug: true
}

//app.use('/peerjs', ExpressPeerServer(server, options));
peerServer = ExpressPeerServer(server, options)
app.use('/peerjs', peerServer);

peerServer.on('connection', function(id) {
    console.log(id)
  console.log(server._clients)
});


const { v4: uuidV4 } = require('uuid')
app.set('view engine','ejs')
app.use(express.static('public'))

app.get('/', (req,res) => {
    res.render('home')
})

app.get('/create', (req,res) =>{
    res.redirect(`/room/${uuidV4()}`)
   // res.redirect(`/room/roomid`)
})

app.get('/room/:room',(req, res) =>{
    if(validator.isUUID(req.params.room))
        res.render('room',{roomId: req.params.room})
    else
        res.render('home',{error: "Invalid Room ID " + req.params.room})
 
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected',userId)
        console.log(roomId, userId);
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})


server.listen(3000)