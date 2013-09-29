/*! Earify 0.1 | (c) 2013 xho | twitter: @xho | bedita.net | GNU GPL License
*/

var earify = {

	tmpTweet: {},
	tweet: {},

	/*
	** methods
	*/
	init: function( settings ) {
		earify.config = {
			user: "riotta",
			proxyURL : "http://xho.bedita.net/var/earify-twitter-proxy.php?user=",
			lang : "it",
			apiURL : "http://tts-api.com/tts.mp3?"
		};

		// allow overriding the default config
		$.extend( earify.config, settings );

		// execute on click
		//$('#speech').on('click', earify.sequence);
		$('#speech').submit(function(e) {
			e.preventDefault();
			earify.sequence();
		});
	},


	// all sequence to play and reenable UI
	sequence: function() {
		console.log('0. start');
		earify.cleanupUI();

		if (!$('#user').val())
			var user = earify.config.user;
		else
			var user = $('#user').val();

		// deferred sequence
		var promise = earify.getTweet(user);
		promise
			.then(earify.setTweet)
			.then(earify.updateUI)
			.done(earify.play);
	},


	getTweet: function(user)  {
		console.log('2. get tweet');
		var deferred = $.Deferred();
	 
		$.get(earify.config.proxyURL + user, function( response ) {
			console.log('3. success, got tweet');
			earify.tmpTweet =  jQuery.parseJSON( response );
			deferred.resolve();
		})
	 
		return deferred.promise();
	},


	setTweet: function() {
		console.log('4. set tweet');
		var deferred = $.Deferred();
		earify.tweet.text = earify.tmpTweet.text;
		earify.tweet.name = earify.tmpTweet.user.name;
		earify.tweet.fullname = earify.tmpTweet.user.name;
		earify.tweet.bio = earify.tmpTweet.user.description;
		earify.tweet.profile_image_url = earify.tmpTweet.user.profile_image_url;
		earify.tweet.screen_name = earify.tmpTweet.user.screen_name;
		earify.tweet.hashtags = earify.tmpTweet.entities.hashtags;
		earify.tweet.urls = earify.tmpTweet.entities.urls;
		if (earify.tmpTweet.entities.media) {
			console.log ("(media detected)");
			earify.tweet.mediaurl = earify.tmpTweet.entities.media[0].media_url;
			earify.tweet.text = earify.tweet.text.split(earify.tmpTweet.entities.media[0].url).join(' ');
		}

		deferred.resolve();
		return deferred.promise();
	},


	cleanupUI: function() {
		console.log('1. cleanup UI');
		$('#text').text('');
		$('#face').hide();
		$('#media img').remove(); earify.tweet.mediaurl = '';
		$('#media').hide();
		$('#urls').text('');
		$('#hashtags').text('');
		$('#nhashtags').val(0);
		$('#urls').text('');
		$('#nurls').val(0);
		$('#loader').show();
	},


	updateUI: function() {
		console.log('5. update UI');
		var deferred = $.Deferred();

		// text
		$('#text').text(earify.tweet.text);
		countChars();

		// hashtags
		for (i in earify.tweet.hashtags) {
			$('#hashtags').append('<a href="http://twitter.com/search?src=hash&q=%23' + earify.tweet.hashtags[i].text + '" target="_blank">#' + earify.tweet.hashtags[i].text + '</a> ');
		}
		$('#nhashtags').val(earify.tweet.hashtags.length);

		// URLs
		for (i in earify.tweet.urls) {
			$('#urls').append('<a href="' + earify.tweet.urls[i].expanded_url + '" target="_blank">' + earify.tweet.urls[i].display_url + '</a><br/>');
		}
		$('#nurls').val(earify.tweet.urls.length);

		// hide loader
		$('#loader').fadeOut(4000, function() {
			// face
			$('#face').css('background', 'transparent url("' + earify.tweet.profile_image_url + '") top left no-repeat');
			$('#face #namebio').html('<p><span style="font-weight: bold;">' + earify.tweet.fullname + '</span><br/>' + earify.tweet.bio + '</p>');
			$('#face').slideDown('slow');

			// photo
			if (earify.tweet.mediaurl) {
				var img = $("<img />").attr('src', earify.tweet.mediaurl)
				    .load(function() {
				        if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
				            console.log('broken image!');
				            return false;
				        } else {
				            $("#media").append(img);
							$('#media').slideDown(2000);
				        }
				    });
			}
		});



		deferred.resolve();
		return deferred.promise();
	},


	play: function() {
		var audio = new Audio();
		var t = cleanupText(earify.tweet.text, earify.tweet.hashtags, earify.tweet.urls);
		console.log(t);
		audio.src = earify.config.apiURL + '&q=' + encodeURIComponent(t);
		//audio.play();
		meSpeak.speak(t, { speed: 150, pitch: 40, wordgap: 5 });
		console.log("6. play: " + audio.src);
	},

	isPlaying: function(auelement) { return !auelement.paused; }
}


$( document ).ready( earify.init() );


function countChars () {
	var len = document.getElementById("text").innerHTML.length;
	document.getElementById("length").value = len;
}


function cleanupText (t, hashtags, URLs) {
	console.log("text: " + text, "hashtags: " +  hashtags, "URLs: " + URLs);
	for (i in earify.tweet.urls) {
		t = t.split(earify.tweet.urls[i].url).join(' a questo indirizzo web ');
	}
	t = t.replace(/\bRT\b/, " retuit ");
	t = t.replace(/\btweet\b/, " tuiit ");
	t = t.replace(/@/g," ");
	t = t.replace(/:/g,",");
	t = t.replace(/-/g,",");
	t = t.replace(/#/g,"hashtag ");
	t = t.replace(/ü/g,"u");
	t = t.replace(/&lt;/g," minore ");
	t = t.replace(/&gt;/g," maggiore ");

	t = t.replace(/[^a-zA-Z0-9 -,Èàèéìòùç\']/g,' ');
	return t;
}


