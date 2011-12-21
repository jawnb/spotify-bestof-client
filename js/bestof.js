sp = getSpotifyApi(1);
var m = sp.require("sp://import/scripts/api/models");
var v = sp.require("sp://import/scripts/api/views");
var dnd = sp.require('sp://import/scripts/dnd');

exports.init = init;
exports.login_fb = login_fb;
var History = window.History;

function sort_by_karma(a, b){
  var aKarma = a.karma;
  var bKarma = b.karma; 
  return ((aKarma > bKarma) ? -1 : ((aKarma < bKarma) ? 1 : 0));
}

function get_username() {
  // THIS METHOD IS HACKY AS FUCK AND WILL BREAK IN ALL SORTS OF SCENARIOS
  // ... NEED TO FIND  AWAY TO RELIABLY PULL USERNAME/FB INFO AND AUTH

  return "jawnb";
}
function login_fb() {
	var sp = getSpotifyApi(1);
	var appID = "1234567890";
	var path = 'https://www.facebook.com/dialog/oauth?';
	var successUrl = "https://www.facebook.com/connect/login_success.html";
	var queryParams = [
	    'client_id=' + appID,
	    'redirect_uri=' + successUrl,
	    'display=popup',
	    'scope=email,read_stream',
	    'response_type=token'
	    ];

	var query = queryParams.join('&');
	var url = path + query;         

	sp.core.showAuthDialog(url, successUrl, {                   
	    onSuccess : function(response) {
	        console.log('success', response);

	        // response contains access token in hashstring
	        var queryPart = response.split("#")[1];
	        var queryStrings = queryPart.split("&");
	        accessToken = queryStrings[0].split('=')[1];

	        // we will use the token to get the rest of the user data                                   
	        $.getJSON('https://graph.facebook.com/me?access_token=' + accessToken + '&callback=?', function(facebookUser){
	            console.log('logged in user: ', facebookUser);                          
	            // TODO: add logic to handle the user here
	        });
		    }
		});	   
	
	
	
}
function get_genres(user) {
	var json_list = '[{"name": "Metal"}, {"name": "Dubstep"}, {"name": "EDM"}, {"name": "Metal"}, {"name": "Polka"}, {"name": "Hip-Hop"}]';
	var genres = JSON.parse(json_list);
	return genres;
}
function get_tracks(genre) {
	console.debug(genre)
	var json_list = '[  {"id": 1, "uri":  "spotify:track:7u5lbovDG8IdClakH40wJB", "by": "test123", "date": "2011-11-17T09:24:17Z", "rank": 1, "genre": "edm", "karma": 9001}, {"uri": "spotify:track:1ZAtCoDHeYdMIYTaj9FpXB", "by": "metalfan970", "date": "2011-12-1", "rank": 2, "genre": "Metal", "karma": 31337}, {"uri": "spotify:track:63FmCXIc4lmEq9fNqGkQ57", "by": "dubsteppin", "date": "2011-12-4", "rank": 3, "genre": "dubstep", "karma": 1234} ]';

	if (genre == "Metal") {
		var json_list = '[ {"uri": "spotify:track:1ZAtCoDHeYdMIYTaj9FpXB", "by": "metalfan970", "date": "2011-12-1", "rank": 2, "genre": "metal", "karma": 31337} ]';
		
	}

	var submissions = JSON.parse(json_list);
	submissions.sort(sort_by_karma);
	return submissions;
}

function build_page(user, genre) {
	var genres = get_genres(1);
	var submissions = build_submissions(genre);
	var context = {genres: genres, track_list: submissions};
	var track_template = document.getElementById('track-template').innerHTML;
	var html = Mustache.to_html(track_template, context);
	document.getElementById('track_list').innerHTML = html;
}
function build_nav(){
	
	var genres = get_genres(get_username());
	var context = {genres: genres};
	var nav_template = document.getElementById('nav-template').innerHTML;
	var html = Mustache.to_html(nav_template, context);
	document.getElementById('topbar-nav').innerHTML = html;
	
}
function build_submissions(genre){
	var submissions = get_tracks(genre);
	for (var i in submissions) {
		
		var submission = submissions[i];
		submissions[i].sp_track = m.Track.fromURI(submission.uri);
		submissions[i].cleaned_date = jQuery.timeago(submission.date);

	}
	return submissions;
	
}
function new_genre() { 
	var state = History.getState();
	var genre = state.data.genre;
	build_page(1, genre);
	
}

function init() {
	var state = {genre: "all"};
	History.pushState({state: 1, genre: "all"}, "index", "?genre=all");
	build_nav();
    build_page();

	History.Adapter.bind(window,'statechange',function(){ new_genre(); });
	sp.trackPlayer.addEventListener("playerStateChanged", function (event) {

		// Only update the page if the track changed
		if (event.data.curtrack == true) {
			build_nav();
			build_page();
		}
	});
}
