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
			apiURL : "http://tts-api.com/tts.mp3?",
			messageTimeout : 5000
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
		$('#loader').show();
		earify.cleanupUI();

		// set user
		var user = earify.setUser();

		// update URL & title
		if ( history.pushState ) {		
			var newurl = updateQueryString("user", user);
			var stateObj = { user: user };
			window.history.pushState(stateObj, "Il pappagallo (ripete " + user, newurl);
		}
		document.title = "Pappagallo (ripete " + user + ")";

		// deferred sequence
		var promise = earify.getTweet(user);
		promise
			.then(earify.setTweet)
			.then(earify.updateUI)
			.done(earify.play)
			.fail( function() { earify.cleanupUI(); $('#loader').hide(); earify.triggerError('Ops, c\'è stato un errore. Forse questo utente non esiste'); } );
	},


	getTweet: function(user)  {
		console.log('2. get last tweet of ' + user);
		var deferred = $.Deferred();
	 
		$.get(earify.config.proxyURL + user, function( response ) {
			if (response) {				
				console.log('3. success, got tweet');
				earify.tmpTweet =  jQuery.parseJSON( response );
				deferred.resolve();
			} else {
				console.log('3. error, empty response to request');
				deferred.reject();
			}
		})
		.fail(function() {
			console.log( "3. Error, unable to reach twitter proxy" );
			// todo
		});
	 
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
		if (earify.tmpTweet.entities.urls.length) {
			if (earify.tmpTweet.entities.urls[0].expanded_url && earify.tmpTweet.entities.urls[0].expanded_url.indexOf("youtube.com")) {
				console.log ("(youtube video detected)");
				earify.tweet.videourl = earify.tmpTweet.entities.urls[0].expanded_url;
			}
		}


		deferred.resolve();
		return deferred.promise();
	},


	cleanupUI: function() {
		console.log('1. cleanup UI');
		$('#text').text('');
		$('#face').hide();
		$('#tweet').hide();
		$('#media img').remove(); earify.tweet.mediaurl = '';
		$('#media object').remove(); earify.tweet.videourl = '';
		$('#media').hide();
		$('#urls .textarea').text('');
		$('#hashtags').hide();
		$('#hashtags .textarea').text('');
		$('#nhashtags').val(0);
		$('#urlss').hide();
		$('#urls .textarea').text('');
		$('#nurls').val(0);
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
		$('#nhashtags .textarea').val(earify.tweet.hashtags.length);

		// URLs
		for (i in earify.tweet.urls) {
			$('#urls .textarea').append('<a href="' + earify.tweet.urls[i].expanded_url + '" target="_blank">' + earify.tweet.urls[i].display_url + '</a><br/>');
		}
		$('#nurls').val(earify.tweet.urls.length);

		$('#tweet').slideDown('slow');
		if(earify.tweet.hashtags.length)
			$('#hashtags').slideDown('slow');
		if(earify.tweet.urls.length)
			$('#urls').slideDown('slow');

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

			// youtube video
			/* todo
			if (earify.tweet.videourl) {
				var embed = '<object width="300" height="225"><param name="movie" value="' + earify.tweet.videourl + '&amp;version=3"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="' + earify.tweet.videourl + '&amp;version=3" type="application/x-shockwave-flash" width="300" height="225" allowscriptaccess="always" allowfullscreen="true"></embed></object>';
	            $("#video").append(embed);
				$('#video').slideDown(2000);
			}
			*/
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


	setUser: function() {
		if (!$('#user').val()) {
			$('#user').val(earify.config.user);
			return earify.config.user;
		}
		else
			return $('#user').val();
	},


	triggerError: function (msg) {
		console.log('Sequence failed. Triggering error: ' + msg);
		$('#error .msg').html(msg)
		$('#error').fadeIn(1000, function() {
			setTimeout(function() { $('#error').fadeOut(); }, earify.config.messageTimeout);
		});
		
	}

	// to fix isPlaying: function(auelement) { return !auelement.paused; }
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
	t = t.replace(/:/g,", ");
	t = t.replace(/-/g,", ");
	t = t.replace(/[.]/g,". ");
	t = t.replace(/[,]/g,". ");
	t = t.replace(/#/g,"hashtag ");
	t = t.replace(/ü/g,"u");
	t = t.replace(/&lt;/g," minore ");
	t = t.replace(/&gt;/g," maggiore ");

	t = t.replace(/[^a-zA-Z0-9 -,Èàèéìòùç!?.\']/g,' ');
	return t;
}


function updateQueryString(key, value, url) {
    if (!url) url = window.location.href;
    var re = new RegExp("([?|&])" + key + "=.*?(&|#|$)(.*)", "gi");

    if (re.test(url)) {
        if (typeof value !== 'undefined' && value !== null)
            return url.replace(re, '$1' + key + "=" + value + '$2$3');
        else {
            var hash = url.split('#');
            url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
            if (typeof hash[1] !== 'undefined' && hash[1] !== null) 
                url += '#' + hash[1];
            return url;
        }
    }
    else {
        if (typeof value !== 'undefined' && value !== null) {
            var separator = url.indexOf('?') !== -1 ? '&' : '?',
                hash = url.split('#');
            url = hash[0] + separator + key + '=' + value;
            if (typeof hash[1] !== 'undefined' && hash[1] !== null) 
                url += '#' + hash[1];
            return url;
        }
        else
            return url;
    }
}