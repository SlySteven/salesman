var socket;
socket = io('http://localhost:5000/');
//socket = io('https://steven-express-test.herokuapp.com/');

socket.on('connect', function () {
	console.log("Socket established.");
});

var room_code;

$('#button-join').click(function(e){
	room_code = $('#button-join').val()
	socket.emit('join game', room_code, function (msg) {
		if (msg == -1) {
			console.log("Error joining game.")
		}
		else if (msg == -2) {
			console.log("No room exists.")
		}
		else {
			console.log("Joining room: " + msg);
			createGame(room_code);
		}
	});
	return false;
});
$('#button-create').click(function(e){
	socket.emit('create game', function (msg) {
		if (msg == -1) {
			console.log("Error creating game.")
			return false;
		}
		else {
			console.log("Creating game under room: " + msg);
			createGame(msg);
		}
	});
	return false;
});
socket.on('next customer', function(msg){
	if (msg == -1) {
		console.log("Error getting next customer.")
	}
	var cust = $('#customer');
	fade(cust, msg);
});
