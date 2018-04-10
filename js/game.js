var customers = [];
var ingredients = [];
var deck_id = 'classic';
var next_customer = 0;
var next_ingredient = 0;
var ing_count = 6;
var fade_speed = 250;
var highlighted = [];

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

$('.score-add').on('click', function () {
	var score = $('#score');
	fade(score, function () {
		score.text(parseInt(score.text())+1)
	});
});
$('.score-sub').on('click', function () {
	var score = $('#score');
	fade(score, function () {
		score.text(Math.max(parseInt(score.text())-1, 0));
	});
});
$('.submission-close').on('click', function () {
	removeSubmission();
});

$("#button-start").on('click', function() {
	  var options_valid = fetchOptions();
	  if (!options_valid) {
		return;
	  }
	  startGame();
});

var dropdown_deck_id = $("#deck-id");
deck_id = readCookie("deck_id");
if (deck_id != null) {
  dropdown_deck_id.val(deck_id);
}

function fetchOptions() {
  deck_id = $("#deck-id").val();
  console.log("Picking deck " + deck_id);

  var no_errors = 1;

  if (no_errors) {
	document.cookie = "deck_id=" + deck_id;
  }

  return no_errors;
}
function startGame () {
	initializeDeck(deck_id);
	$(".main-game").show();
	$(".deck-picker").hide();
}

function initializeDeck(deck) {
	db.collection("customers").doc(deck).collection("deck").get().then((querySnapshot) => {
	    querySnapshot.forEach((doc) => {
	        customers.push(doc.id);
	    });

		shuffle(customers);
		$('#customer').text(getNextCustomer());

		// only set up the click handler if there were lines found
		if (customers && customers.length) {
			$('.refresh-customer').on('click', function () {
				// show the corresponding line
				var cust = $('#customer');
				fade(cust, getNextCustomer());
			});
		}
	});

console.log("Checking ingredients for: " + deck);
	db.collection("ingredients").doc(deck).collection("deck").get().then((querySnapshot) => {
		// If a custom ingredient list exists, use that.
		console.log(querySnapshot);
		if (!querySnapshot.empty) {
		    console.log("Finished adding deck-specific.");
		    prepIngredients(querySnapshot);
		}
		// Else use Classic list.
		else {
			console.log("No deck-specific ingredients. Defaulting to Classic.");
			querySnapshot = db.collection("ingredients").doc("Classic").collection("deck").get().then((querySnapshot) => {
			    console.log("Finished adding classic ingredients.");
			    prepIngredients(querySnapshot);
			});
		}

	});
} // fn.initializeDeck

function prepIngredients (querySnapshot) {
	console.log("Prepping ingredients.");
    querySnapshot.forEach((doc) => {
        ingredients.push(doc.id);
    });
	shuffle(ingredients);
	for (var i = 1; i <= ing_count; i++) {
		$('#ing-' + i).text(getNextIngredient());
	}

	// only set up the click handler if there were lines found
	if (ingredients && ingredients.length) {
		$('.refresh-ingredient').on('click', function () {
			var index = $(this).data('index');
			// show the corresponding line
			var ing = $('#ing-' + index);
			refresh(ing);
		});
		$(".ingredient").on('click', function (){
			highlight($(this));
		});
	}
}

function refresh (ing) {
			dehighlight(ing);
			fade(ing, getNextIngredient());
}

function fade (e, f) {
			e.fadeOut(fade_speed, function () {
				e.text(f);
			});
			e.fadeIn(fade_speed);
}

function highlight (ing) { 
	// console.log("Highlighting " + $(ing).text());
	highlighted.push(ing);
	if (highlighted.length >= 2) {
		setSubmission();
	}
	ing.addClass('highlighted');
	ing.off('click');
	ing.on('click', function (){ 
		dehighlight(ing)
	});
}

function dehighlight (ing) { 
	// console.log("Dehighlighting " + $(ing).text());
	if (highlighted.length == 1 && highlighted[0].text() === ing.text()) {
		// console.log("Removing dupe item.");
		highlighted.pop();
	}
	ing.removeClass('highlighted');
	ing.off('click');
	ing.on('click', function (){ 
		highlight(ing)
	});
}

function setSubmission () {
	if (highlighted.length < 2) {return;}
	var submission = highlighted[0].text() + "<br>" + highlighted[1].text();

	$("#submission-text").html(submission);
	$("#overlay-submission").show(1000, function () {
		$("#submission-text").bigText();
	});
}

function removeSubmission () {
	$("#overlay-submission").hide(1000, function () {
		$("#submission-text").hide();
		refresh(highlighted[0]);
		refresh(highlighted[1]);
		highlighted = [];
	});
}

function getNextCustomer () {
	console.log("Next customer: " + next_customer);
	if (customers.length == next_customer) {
		next_customer = 0;
	}
	return customers[next_customer++];
}
function getNextIngredient () {
	console.log("Next ingredient: " + next_ingredient);
	if (ingredients.length == next_ingredient) {
		next_ingredient = 0;
	}
	return ingredients[next_ingredient++];
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items The array containing the items.
 */
 function shuffle(a) {
	for (let i = a.length; i; i--) {
		let j = Math.floor(Math.random() * i);
		[a[i - 1], a[j]] = [a[j], a[i - 1]];
	}
}
function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}
