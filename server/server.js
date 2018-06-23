const express = require("express");
const path =  require("path");
const http = require("http");
const socketIO = require("socket.io");

var {generateMessage, generateLocationMessage} = require("./utils/utils");
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();

var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

io.on("connection", (socket) => {
	console.log("New connection established");

	/**moved in room**/
	// socket.emit("newMessage", generateMessage("Gossip's Ruler", "Welcome to Gossips"));
	// socket.broadcast.emit("newMessage", generateMessage("Gossip's Ruler", "User has joined"));

	socket.on('join', (params, callback) => {
	  if (!isRealString(params.name) || !isRealString(params.room)) {
	    callback('Name and room name are required.');
	  }

      socket.join(params.room);
      users.removeUser(socket.id);
  	  users.addUser(socket.id, params.name, params.room);

      // socket.leave('The Office Fans');

      // io.emit -> io.to('The Office Fans').emit
      // socket.broadcast.emit -> socket.broadcast.to('The Office Fans').emit
      // socket.emit

       io.to(params.room).emit('updateUserList', users.getUserList(params.room));
       socket.emit("newMessage", generateMessage("TeamAdmin", "Welcome to Gossips"));
  	   socket.broadcast.to(params.room).emit("newMessage", generateMessage("TeamAdmin", `${params.name} has joined.`));   
	   callback();
	});

	socket.on("createMessage", (message) => {
	 console.log("New Daak", message);
     var user = users.getUser(socket.id);

     if (user && isRealString(message.text)) {
       io.to(user.room).emit("newMessage", generateMessage(user.name, message.text));
     }

	 // socket.broadcast.emit("newMessage", {
	 // 	from: message.from,
	 // 	text: message.text,
	 // 	on: new Date().getTime()
	 // });

	});

	socket.on('createLocationMessage', (coords) => {
	  var user = users.getUser(socket.id);

	  if (user) {
	    io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));  
	  }
	});

	socket.on("disconnect", () => {
		console.log("oops!! Client disconnected")
		var user = users.removeUser(socket.id);

	    if (user) {
	      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
	      io.to(user.room).emit('newMessage', generateMessage('TeamAdmin', `${user.name} has left.`));
	    }
	});
});

app.use(express.static(publicPath));

server.listen(port, () => {
	console.log(`Server is running on port: ${port}`);
});