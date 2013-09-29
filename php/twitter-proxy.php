<?php
	session_start();
	require_once("twitteroauth/twitteroauth/twitteroauth.php"); //Path to twitteroauth library you downloaded in step 3

	$twitteruser = "bedita3"; //user name you want to reference
	$notweets = 30; //how many tweets you want to retrieve
	$consumerkey = "12345"; //Noted keys from step 2
	$consumersecret = "123456789"; //Noted keys from step 2
	$accesstoken = "123456789"; //Noted keys from step 2
	$accesstokensecret = "12345"; //Noted keys from step 2

	function getConnectionWithAccessToken($cons_key, $cons_secret, $oauth_token, $oauth_token_secret) {
	  $connection = new TwitterOAuth($cons_key, $cons_secret, $oauth_token, $oauth_token_secret);
	  return $connection;
	}

	$connection = getConnectionWithAccessToken($consumerkey, $consumersecret, $accesstoken, $accesstokensecret);

	$tweets = $connection->get("https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=".$twitteruser."&count=".$notweets);

	echo json_encode($tweets);
	echo $tweets; //testing remove for production
?>