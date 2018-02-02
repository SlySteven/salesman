var customers;
var ingredients;
var next_customer = 0;
var next_ingredient = 0;
var ing_count = 6;
var fade_speed = 250;
var highlighted = [];

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

$.ajax({
	url: 'customers.txt'
}).done(function(content) {

	// normalize the line breaks, then split into lines
		customers = content.replace(/\r\n|\r/g, '\n').trim().split('\n');
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

$.ajax({
	url: 'ingredients.txt'
}).done(function(content) {

	// normalize the line breaks, then split into lines
	ingredients = content.replace(/\r\n|\r/g, '\n').trim().split('\n');
	shuffle(ingredients);
	console.log(ingredients);
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
});

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
	$("#overlay").show(1000, function () {
		$("#submission-text").bigText();
	});
}

function removeSubmission () {
	$("#overlay").hide(1000, function () {
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