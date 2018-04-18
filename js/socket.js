var io;
//io = io('http://localhost:5000/');
io = io('https://steven-express-test.herokuapp.com/');

io.on('connect', function () {
	console.log("Socket established.");
});

var room_code;

$('#button-join').click(function(e){
	room_code = $('#room-input').val()
	io.emit('join game', room_code, function (msg) {
		if (msg == -1) {
			console.log("Error joining game " + msg)
		}
		else if (msg == -2) {
			console.log("No room exists for " + msg)
		}
		else {
			console.log("Joining room: " + msg);
			startGame(msg);
		}
	});
	window.scrollTo(0,0);
	return false;
});
$('#button-create').click(function(e){
	fetchOptions();
	io.emit('create game', deck_id, function (msg) {
		if (msg == -1) {
			console.log("Error creating game.")
			return false;
		}
		else {
			console.log("Creating game under room: " + msg);
			startGame(msg);
		}
	});
	return false;
});
io.on('next customer', function(msg){
	if (msg == -1) {
		console.log("Error getting next customer.")
	}
	console.log("Received customer " + msg);
	var cust = $('#customer');
	fade(cust, msg);
	cust_ready = true;
	if (!initialized) {
		initCheck();
	}
});
