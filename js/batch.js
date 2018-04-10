var db = firebase.firestore();

var decks = {
	"classic": {
		"customers": "customers-classic.txt",
		"ingredients": "ingredients-classic.txt"
	},
	"olympics-winter-2018": {
		"customers": "customers-olympics-winter-2018.txt",
		"ingredients": "ingredients-classic.txt"
	},
	"superbowl-2018": {
		"customers": "customers-superbowl-2018.txt",
		"ingredients": "ingredients-superbowl-2018.txt"
	}
};
var custURL = decks['classic']['ingredients'];
var deckname = "Classic";

$.ajax({
	url: custURL
}).done(function(content) {

	// normalize the line breaks, then split into lines
	customers = content.replace(/\r\n|\r/g, '\n').trim().split('\n');
	db.collection("ingredients").doc(deckname).set({
		name: deckname,
	})

	var custname;
	for (var i = 0; i < customers.length; i++) {
		custname = customers[i];
		db.collection("ingredients").doc(deckname).collection("deck").doc(custname).set({
		    name: custname,
		})
		.then(function() {
		    console.log("Wrote: " + custname);
		})
		.catch(function(error) {
		    console.error("Error writing document (" + custname + "): ", error);
		});
	}

})

/*
// Commit the batch
	 db.collection("customers").get().then((querySnapshot) => {
	    querySnapshot.forEach((doc) => {
	        console.log(`${doc.id} => ${doc.data()}`);
	    });
	});
*/