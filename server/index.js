var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, { path: '/salesman/socket.io'});
var firebase = require('firebase/app');
require('firebase/firestore');
const PORT = process.env.PORT || 5000;

var firebase_config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: "",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
};
firebase.initializeApp(firebase_config);
var db = firebase.firestore();

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
var customerDecks = {};
io.on('connection', function(socket){
    console.log("user connected");
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('join game', function(room_code, callback){
        // New room
        console.log("join game");
        room_code = room_code.toUpperCase();
        if (!customerDecks[room_code]) {
            console.log("No room exists at " + room_code);
            callback(-1);
            return false;
        }

        var customer = customerDecks[room_code]['customer'];
        console.log("Player joining room " + room_code + " with current customer " + customer);
        socket.join(room_code);
        socket.emit('next customer', customer);
        callback(room_code);
    });
    socket.on('create game', function(deck_id, callback){
        var room_code = createGame(deck_id);
        // If we can't generate a room
        if (!room_code) {
            callback(-1);
            return false;
        }
        // Let creator know what room code they are
        callback(room_code);
        socket.join(room_code);
    });
    socket.on('next customer', function(room_code){
        // Get new customer
        console.log("Getting new customer for " + room_code);
        var deck_pos_new = customerDecks[room_code]['deck_pos'] + 1;
        customerDecks[room_code]['deck_pos'] = deck_pos_new;
        var cust = customerDecks[room_code]['deck'][deck_pos_new];
        customerDecks[room_code]['customer'] = cust;
        sendCustomer(cust, room_code);
    });
});
function sendCustomer(cust, room_code) {
    console.log("Sending new customer " + cust + " to room " + room_code);
    //io.to(room_code).emit('next customer', cust);
    io.to(room_code).emit('next customer', cust);
}

function createGame (deck_id) {
    // Keep generating room IDs until you get a new one
    var room_code = makeid();
    while (customerDecks[room_code]) {
        room_code = makeid();
    }

    // Set up room
    console.log("Creating new room: " + room_code + " with deck " + deck_id);
    customerDecks[room_code] = {};

    // Get deck
    var customers = [];
    db.collection("customers").doc(deck_id).get().then((doc) => {
        if (doc.exists) {
            customers = convertDBDeck(doc);
        }
        else {
            console.log("Could not fetch customer deck " + deck_id);
            return -1;
        }
        console.log("Done fetching customer deck, size " + customers.length);
        customers = shuffle(customers);
        var cust = customers[0];
        customerDecks[room_code]['deck'] = customers;
        customerDecks[room_code]['deck_pos'] = 0;
        customerDecks[room_code]['customer'] = cust;
        sendCustomer(cust, room_code);
    });

    return room_code;
}

function convertDBDeck (deck) {
    return deck.get('deck').split("\t");
}

http.listen(PORT, function(){
    console.log('listening on *:' + PORT);
});

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(original) {
    var j, x, i;
    var a = original.slice(0);
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

// Generate random 4-letter code
function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < 4; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
