var socket = io();

function scrollToBottom () {
  // Selectors
  var messages = jQuery('#messages');
  var newMessage = messages.children('li:last-child')
  // Heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}

socket.on("connect", function() {
	console.log("connected to Srvr");

  var params = jQuery.deparam(window.location.search);

  socket.emit('join', params, function (err) {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error');
    }
  });

	socket.on("newMessage", function(newMessage){
		console.log("New Tapaal", newMessage);

    var formattedTime = moment(newMessage.on).format("h:mm a");
    var template = $("#message-template").html();
    var html = Mustache.render(template, {
      text: newMessage.text,
      from: newMessage.from,
      on: formattedTime
    });
		// var li = $('<li></li>');
		// li.text(`${newMessage.from} ${formattedTime}: ${newMessage.text}`);
		$("#messages").append(html);
    scrollToBottom();
	});
});

socket.on("disconnect", function() {
	console.log("oops!! disconnected");
});

socket.on('updateUserList', function (users) {
  var ol = $('<ol></ol>');

  users.forEach(function (user) {
    ol.append($('<li></li>').text(user));
  });

  $('#users').html(ol);
});


socket.on('newLocationMessage', function (message) {
  var formattedTime = moment(message.on).format("h:mm a");
  var template = $("#link-message-template").html();
  var html = Mustache(template, {
    from: message.from,
    url: message.url,
    on: formattedTime
  });

  // var li = jQuery('<li></li>');
  // var a = jQuery('<a target="_blank">My current location</a>');
  // var formattedTime = moment(message.on).format("h:mm a");

  // li.text(`${message.from}: ${formattedTime}`);
  // a.attr('href', message.url);
  // li.append(a);
  jQuery('#messages').append(html);
  scrollToBottom();
});

$("#message-form").on("submit", function(e) {
	e.preventDefault();

	socket.emit("createMessage", {
	//	from: "Roy",  /**As collecting data from join page, no need to pass user name from here**/
		text: $("[name=message]").val()
	}, function(){
		console.log("Got it !!!");
    $("[name=message]").val('');
	});
})

var locationButton = jQuery('#send-location');
locationButton.on('click', function () {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser.');
  }

  locationButton.attr('disabled', 'disabled').text('Sending location...');

  navigator.geolocation.getCurrentPosition(function (position) {
    locationButton.removeAttr('disabled').text('Send location');
    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  }, function () {
    locationButton.removeAttr('disabled').text('Send location');
    alert('Unable to fetch location.');
  });
});
