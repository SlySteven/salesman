io.on("connect", function() {
	console.log("Socket established.");
	hookRefresh();
});
io.on("disconnect", reason => {
	disconnect(reason);
});
io.on("reconnect", attemptNumber => {
	console.log("Reconnecting.");
	joinRoom(true);
});

var room_code;

$("#button-join").click(function(e) {
	joinRoom();
});
function disconnect(reason) {
	console.log("Disconnected: " + reason);
	if (!submissionVisible) {
		showLoader();
	}
}

function joinRoom(reconnect) {
	room_code = $("#room-input")
		.val()
		.toUpperCase();
	io.emit("join game", room_code, function(msg) {
		if (msg == -1) {
			console.log("Error joining game " + msg);
		} else if (msg == -2) {
			console.log("No room exists for " + msg);
		} else {
			console.log("Joining room: " + msg);
			if (!reconnect) {
				console.log("First time setup, not a reconnect.");
				startGame(msg);
			} else {
				console.log("This was a reconnect.");
				hideLoader();
			}
		}
	});
	window.scrollTo(0, 0);
	return false;
}
$("#button-create").click(function(e) {
	fetchOptions();
	io.emit("create game", deck_id, function(msg) {
		if (msg == -1) {
			console.log("Error creating game.");
			return false;
		} else {
			console.log("Creating game under room: " + msg);
			startGame(msg);
		}
	});
	return false;
});

function hookRefresh() {
	if (initialized) {
		// This might be the first time we're loading the customer since a disconnect, so hide the loader. They likely don't need it.
		hideLoader();
		return false;
	}
	io.on("next customer", function(msg) {
		if (msg == -1) {
			console.log("Error getting next customer.");
		}
		console.log("Received customer " + msg);
		var cust = $("#customer");
		fade(cust, msg);
		cust_ready = true;
		initCheck();
	});
}

function convertDBDeck(deck) {
	return deck.get("deck").split("\t");
}
