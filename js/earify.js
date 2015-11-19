/*! Earify 0.1 | (c) 2013 xho | twitter: @xho | bedita.net | GNU GPL License
*/

var earify = {

	originalTweet: {},
	tweet: {},

	/**
	 * true when seqeunce is running
	 */
	sequenceRunning: false,

	/**
	 * store the last tweet id attribute
	 * to know if the tweet received is to play
	 */
	lastTweetId: null,

	/**
	 * the id created by setInterval() to poll new tweet
	 */
	pollingId: null,

	/**
	 * true when a tweet is playing
	 */
	playingMessage: false,

	storageConfigName: 'pappagallo.config',

	/**
	 * true if Favella (Speech Synthesis API) is detected
	 * @type {Boolean}
	 */
	favellaDetected: false,

	/**
	 * default config
	 */
	config: {
		user: "riotta",
		proxyURL : "http://xho.bedita.net/var/earify-twitter-proxy.php?user=",
		apiURL : "http://tts-api.com/tts.mp3?", // unused
		lang : "it",
		messageTimeout : 5000,
		autoUpdateEvery : 15000, // ms
		excludeReplies : false,
		excludeRT : false
	},

	/*
	** methods
	*/
	init: function( settings ) {

		if ('Favella' in window) {
            // Favella support!
            earify.favellaDetected = true;
        }

		var savedConfig = earify.getStorageConfig();

		// allow overriding the default config
		$.extend( earify.config, savedConfig, settings );

		earify.initUI();

		// execute on click
		$('#speech').submit(function(e) {
			e.preventDefault();
			earify.lastTweetId = null;
			earify.sequence();
		});

		// change language
		$('#language').on('change', function() {
			var l = $(this).val();
			earify.config.lang = l;
			earify.setStorageConfig(earify.config);
			earify.changeLanguage(l);
		});

		$('#polltweet').on('click', earify.togglePolling);
		$('#excludereplies').on('click', function() {
			earify.config.excludeReplies = !(earify.config.excludeReplies);
			earify.setStorageConfig(earify.config);
		});
		$('#excludert').on('click', function() {
			earify.config.excludeRT = !(earify.config.excludeRT);
			earify.setStorageConfig(earify.config);
		});

		var loadingWelcomeMsg = true;

		if (savedConfig === false) {
			savedConfig = {};
		} else if (!$.isEmptyObject(savedConfig)) {
			loadingWelcomeMsg = new $.Deferred();
			var lastVisit = twitterDateConverter(earify.config.lastVisit);
			var welcomeMsg = 'Ehi! Ciao! Ti ho parlato ' + lastVisit;
			if (savedConfig.lang == 'en') {
				welcomeMsg = 'Welcome back! I talk to you ' + lastVisit;
			}

			try {
				meSpeak.loadVoice("js/mespeak/voices/" + earify.config.lang + ".json", function() {
					earify.triggerMessage(welcomeMsg);
					loadingWelcomeMsg.resolve();
				});
			} catch (e) {
				console.error('fail to load ' + earify.config.lang);
				loadingWelcomeMsg.reject();
			}
		}

		$.when(loadingWelcomeMsg)
		.always(function() {
			earify.intro();
		});
		
		earify.setStorageConfig(earify.config);
	},


	// intro animation
	intro: function() {
		var pt = Number($("article>footer").css('padding-top').substring(0, $("article>footer").css('padding-top').length - 2)) ;
		var pb = Number($("article>footer").css('padding-top').substring(0, $("article>footer").css('padding-top').length - 2)) ;
		var h = pt + pb + $("article>footer").height() + 26;
		$("article").css('padding-bottom', h);
	},

	initUI: function() {
		if ($("body[data-get-request]").length === 0) {
			$("#user").val(earify.config.user);
		}
		$("#language option[value=" + earify.config.lang + "]").prop('selected', true);
		if (earify.config.excludeReplies) {
			$("#excludereplies").prop('checked', true);
		}
		if (earify.config.excludeRT) {
			$("#excludert").prop('checked', true);
		}
	},

	getStorageConfig: function() {
		try {
			var config = localStorage.getItem(earify.storageConfigName) || '{}';
			config = (config && JSON.parse(config)) || {};
			return config;
		} catch (e) {
			console.error('error getting localStorage item');
			return false;
		}
	},

	setStorageConfig: function(data) {
		try {
			var config = earify.getStorageConfig();
			$.extend(config, data);
			config.lastVisit = new Date();
			localStorage.setItem(earify.storageConfigName, JSON.stringify(config));
			return true;
		} catch (e) {
			console.error('error setting localStorage item');
			return false;
		}
	},

	// all sequence to play and reenable UI
	sequence: function() {
		if (!earify.sequenceRunning && !earify.isPlaying()) {
			console.log('0. start');
			earify.sequenceRunning = true;

			$('#loader').show();

			// set user
			var user = earify.setUser();
			earify.setStorageConfig({'user': user});

			// update URL & title
			if ( history.pushState ) {		
				var newurl = updateQueryString("user", user);
				var stateObj = { user: user };
				window.history.pushState(stateObj, "Pappagallo [" + user + "]", newurl);
			}
			document.title = "Pappagallo [" + user + "]";

			// deferred sequence
			var promise = earify.getTweet(user);
			promise
			.then(function() {
				if (earify.isNewTweet()) {
					earify.cleanupUI();
					return earify.setTweet()
							.then(earify.updateUI)
							.done(earify.play);
				} else {
					$('#loader').hide();
					return $.Deferred().resolve();
				}
			})
			.fail(function() {
				earify.cleanupUI();
				$('#loader').hide();
				earify.triggerError('Oops, c\'è stato un errore. Forse questo utente non esiste. Firulì.');
			})
			.always(function() {
				earify.sequenceRunning = false;
			});
		}
	},


	getTweet: function(user)  {
		console.log('2. get last tweet of ' + user);
		var deferred = $.Deferred();
	 
	 	var url = earify.config.proxyURL + user + "&excludert=" + earify.config.excludeRT.toString() + "&excludereplies=" + earify.config.excludeReplies.toString();

		$.get(url, function( response ) {
			if (response) {				
				console.log('3. success, got tweet');
				earify.originalTweet =  jQuery.parseJSON( response );
				deferred.resolve();
			} else {
				console.log('3. error, empty response to request');
				deferred.reject();
			}
		})
		.fail(function() {
			console.log( "3. Error, unable to reach twitter proxy" );
			deferred.reject();
		});
	 
		return deferred.promise();
	},


	setTweet: function() {
		console.log('4. set tweet');
		var deferred = $.Deferred();
		earify.tweet.datetime = earify.originalTweet.created_at;
		earify.tweet.text = earify.originalTweet.text;
		earify.tweet.name = earify.originalTweet.user.name;
		earify.tweet.fullname = earify.originalTweet.user.name;
		earify.tweet.bio = earify.originalTweet.user.description;
		earify.tweet.profile_image_url = earify.originalTweet.user.profile_image_url;
		earify.tweet.screen_name = earify.originalTweet.user.screen_name;
		earify.tweet.hashtags = earify.originalTweet.entities.hashtags;
		earify.tweet.urls = earify.originalTweet.entities.urls;
		
		if (earify.originalTweet.entities.media) {
			console.log ("(media detected)");
			earify.tweet.mediaurl = earify.originalTweet.entities.media[0].media_url;
			earify.tweet.text = earify.tweet.text.split(earify.originalTweet.entities.media[0].url).join(' ');
		}
		if (earify.originalTweet.entities.urls.length) {
			if (earify.originalTweet.entities.urls[0].expanded_url && earify.originalTweet.entities.urls[0].expanded_url.indexOf("youtube.com")) {
				console.log ("(youtube video detected)");
				earify.tweet.videourl = earify.originalTweet.entities.urls[0].expanded_url;
			}
		}

		deferred.resolve();
		return deferred.promise();
	},

	isNewTweet: function() {
		var isNew = false;
		if (earify.lastTweetId) {
			if (earify.lastTweetId != earify.originalTweet.id) {
				isNew = true;
			}
		} else {
			isNew = true;
		}
		return isNew;
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
		$('#tweet>p>span:last').text(twitterDateConverter(earify.tweet.datetime));
		$('#text').text(earify.tweet.text);
		$("#length").val(document.getElementById("text").innerHTML.length);

		// hashtags
		for (var i in earify.tweet.hashtags) {
			$('#hashtags .textarea').append('<a href="http://twitter.com/search?src=hash&q=%23' + earify.tweet.hashtags[i].text + '" target="_blank">#' + earify.tweet.hashtags[i].text + '</a> ');
		}
		$('#nhashtags').val(earify.tweet.hashtags.length);

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
				        if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth === 0) {
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


	play: function(t) {
		if (!t) {
			console.log("text: " + earify.tweet.text, "hashtags: " +  earify.tweet.hashtags, "URLs: " + earify.tweet.urls);
			t = cleanupText(earify.tweet.text, earify.config.lang, earify.tweet.hashtags, earify.tweet.urls);
		}
		else t = cleanupText(t, earify.config.lang);
		console.log(t);

/*	Non usato per ora, in attesa di utilizzare un API esterna (Google language, TTS o altre) non succederà perché vogliono i milioni
		var audio = new Audio();
		audio.src = earify.config.apiURL + '&q=' + encodeURIComponent(t);
		audio.play();
		console.log("6. play: " + audio.src);
*/
		earify.playingMessage = true;
		try {
			if (earify.favellaDetected) {
	            var options = {
                    lang: earify.config.lang + '-' + earify.config.lang.toUpperCase(),
                    onend: function(e) {
    	            	earify.playingMessage = false;
    					earify.lastTweetId = earify.originalTweet.id;
    	            }
                };
	        	Favella.speak(t, options);

	        // fallback to meSpeak
	        } else {
				meSpeak.speak(t, { speed: 150, pitch: 40, wordgap: 5 }, function() {
					earify.playingMessage = false;
					earify.lastTweetId = earify.originalTweet.id;
				});
			}
		} catch (e) {
			earify.playingMessage = false;
			console.error('error: ' +  e.name + " - " + e.message);
			earify.triggerError('Bourpp, ho mangiato pesante. Non riesco a ripetere il twiit.');
		}
	},


	setUser: function() {
		if (!$('#user').val()) {
			$('#user').val(earify.config.user);
			return earify.config.user;
		}
		else
			return $('#user').val();
	},

	triggerMessage: function(msg) {
		$('#error .msg').html(msg);
		$('#error').fadeIn(1000, function() {
			earify.play(msg);
			setTimeout(function() { $('#error').fadeOut(); }, earify.config.messageTimeout);
		});
	},

	triggerError: function (msg) {
		console.log('Sequence failed. Triggering error: ' + msg);
		$('#error .msg').html(msg);
		$('#error').fadeIn(1000, function() {
			earify.play(msg);
			setTimeout(function() { $('#error').fadeOut(); }, earify.config.messageTimeout);
		});
	},

	togglePolling: function(ev) {
		if (earify.pollingId === null) {
			$('#speech').slideUp();
			earify.sequence(); // start immediately
			earify.pollingId = setInterval(function() {
				earify.sequence();
			}, earify.config.autoUpdateEvery);
		} else {
			$('#speech').slideDown();
			clearInterval(earify.pollingId);
			earify.pollingId = null;
		}
	},

	isPlaying: function() {
		return earify.playingMessage;
	},

	changeLanguage: function(lang) {
		console.log ("changing language: " + lang);
		var msg = '';
		if (lang == "it") {
			msg += "Puttana galera. Soppoliglotta io.";
		} else if (lang == "es") {
			msg += "Oh puta madre...";
		} else if (lang == "en") {
			msg += "Shit...";
		} else if (lang == "fr") {
			msg += "Merd...";
		}

		if (earify.favellaDetected) {
			earify.triggerMessage(msg);
		} else {
			meSpeak.loadVoice("js/mespeak/voices/" + lang + ".json", function() {
				earify.triggerMessage(msg);
			});
		}
	}
};


$( document ).ready( earify.init() );



/*
** more function
*/

function countChars () {
	var len = document.getElementById("text").innerHTML.length;
	document.getElementById("length").value = len;
}


function cleanupText (t, lang, hashtags, URLs) {

	// replace URLs
	for (var i in earify.tweet.urls) {
		t = t.split(earify.tweet.urls[i].url).join(' a questo indirizzo web ');
	}

	// specific italian pronounce
	if (lang == "it") {
		t = replaceEmoticons(t);
		t = t.replace(/\bRT\b/gi, " retuiit ");
		t = t.replace(/\btweet\b/gi, " tuiit ");
		t = t.replace(/:/g," due punti ");
		t = t.replace(/c\u0027è/gi,"ce"); // c'è
		t = t.replace(/&lt;/g," minore ");
		t = t.replace(/&gt;/g," maggiore ");
	}

	t = t.replace(/@/g," ");
	t = t.replace(/-/g,", ");
	t = t.replace(/[.]/g,". ");
	t = t.replace(/[,]/g,", ");
	t = t.replace(/#/g,"ashtag ");
	t = t.replace(/ü/gi,"u");


	t = t.replace(/[^a-zA-Z0-9 -,Èàèéìòùç!?.\']/g,' ');
	return t;
}


function replaceEmoticons(text) {
  var emoticons = {
    ':-)' : ' faccina sorridente',
    ':)'  : ' faccina sorridente ',
    ':('  : ' faccina triste ',
    ':D'  : ' faccina grande risata ah ah ah ',
    ':-|' : ' faccina basita F4 ',
    ':|'  : ' faccina basita F4 '
  }, patterns = [],
     metachars = /[[\]{}()*+?.\\|^$\-,&#\s]/g;

  // build a regex pattern for each defined property
  for (var i in emoticons) {
    if (emoticons.hasOwnProperty(i)){ // escape metacharacters
      patterns.push('('+i.replace(metachars, "\\$&")+')');
    }
  }

  // build the regular expression and replace
  return text.replace(new RegExp(patterns.join('|'),'g'), function (match) {
    return typeof emoticons[match] != 'undefined' ?
           emoticons[match] : match;
  });
}




function updateQueryString(key, value, url) {
    if (!url) url = window.location.href;
    var re = new RegExp("([?|&])" + key + "=.*?(&|#|$)(.*)", "gi");
	var hash;

    if (re.test(url)) {
        if (typeof value !== 'undefined' && value !== null)
            return url.replace(re, '$1' + key + "=" + value + '$2$3');
        else {
            hash = url.split('#');
            url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
            if (typeof hash[1] !== 'undefined' && hash[1] !== null) 
                url += '#' + hash[1];
            return url;
        }
    }
    else {
        if (typeof value !== 'undefined' && value !== null) {
            var separator = url.indexOf('?') !== -1 ? '&' : '?';
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




function twitterDateConverter(time){
	var date = new Date(time),
		diff = (((new Date()).getTime() - date.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400);
 
	if ( isNaN(day_diff) || day_diff < 0 )
		return;
 
	return day_diff === 0 && (
			diff < 60 && "pochi secondi fa" ||
			diff < 120 && "circa un minuto fa" ||
			diff < 3600 && Math.floor( diff / 60 ) + " minuti fa" ||
			diff < 7200 && "un'ora fa" ||
			diff < 86400 && Math.floor( diff / 3600 ) + " ore fa") ||
		day_diff == 1 && "Ieri" ||
		day_diff < 7 && day_diff + " giorni fa" ||
		day_diff < 31 && Math.ceil( day_diff / 7 ) + " settimane fa" ||
		day_diff > 31 && "mesi fa";
}
