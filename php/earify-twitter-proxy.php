<?php
	session_start();
	require_once("twitteroauth/twitteroauth/twitteroauth.php"); //Path to twitteroauth library

	$twitteruser = "user"; //user name of twitter user using this service (owner of the app)
	$notweets = 1; //how many tweets you want to retrieve
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

    if (!empty($tweets[0])) {                                                                                                                                     
        echo json_encode($tweets[0]);                                                                                                                             
        // echo "<pre>";                                                                                                                                          
        // print_r($tweets); //testing remove for production                                                                                                      
    } else {                                                                                                                                                      
        die();                                                                                                                                                    
    }  
?>
