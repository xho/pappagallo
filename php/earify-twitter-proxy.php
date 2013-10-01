<?php
	if (empty($_GET["excludereplies"]) || $_GET["excludereplies"] == "false") {
		$excludereplies = "false"; 
	} else {
		$excludereplies = "true"; 
	}

	if (empty($_GET["excludert"]) || $_GET["excludert"] == "false") {
		$includeReplies = "true"; 
	} else {
		$includeReplies = "false"; 
	}

	if (empty($_GET["user"])) {
		$twitteruser = "riotta"; 
	} else {
		$twitteruser = $_GET["user"];
	}



	session_start();
	require_once("twitteroauth/twitteroauth/twitteroauth.php"); //Path to twitteroauth library you downloaded in step 3

	// $twitteruser = "riotta"; //user name you want to reference
	$notweets = 1; //how many tweets you want to retrieve
	$consumerkey = "haudswXMv6tFaPzHB26w"; //Noted keys from step 2
	$consumersecret = "ksPKVKBcccLYaGHf5NE1i8DeBuWEkLsUn3yY7Nb9HZY"; //Noted keys from step 2
	$accesstoken = "81815107-paAJK4ne226KBMqjL9HPDVzALKm2R66LhVQKBZLID"; //Noted keys from step 2
	$accesstokensecret = "5IxBdbQsOAbxpFxQHPPmMjDS5dmwenXSpE834pSqbE"; //Noted keys from step 2

	function getConnectionWithAccessToken($cons_key, $cons_secret, $oauth_token, $oauth_token_secret) {
	  $connection = new TwitterOAuth($cons_key, $cons_secret, $oauth_token, $oauth_token_secret);
	  return $connection;
	}

	$connection = getConnectionWithAccessToken($consumerkey, $consumersecret, $accesstoken, $accesstokensecret);

	$getURL = "https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=" . $twitteruser .
			"&count=" . $notweets .
			"&include_rts=" . $includeReplies .
			"&exclude_replies=" . $excludereplies;

	$tweets = $connection->get($getURL);

	if (!empty($tweets[0])) {
		echo json_encode($tweets[0]);
		// echo "<pre>";
		// print_r($tweets); //testing remove for production
	} else {
		die();
	}
?>

