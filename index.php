<!DOCTYPE html>
<html>
<?php
	if (empty($_GET["user"]))
		$user = "riotta";
	else
		$user = $_GET["user"];
?>
	<head>
		<title>Pappagallo [<?php echo $user; ?>]</title>
		<meta charset="utf-8">
		<link href="favicon.png" rel="shortcut icon" type="image/x-icon">
		<link href="favicon.png" rel="icon" type="image/png">
<!--		<script src="http://code.jquery.com/jquery-1.10.1.min.js"></script> -->
		<script src="js/jquery-1.10.1.min.js"></script>
		<link rel='stylesheet' href='css/earify.css'/>
	</head>

	<body>
		<article>

			<header>
			</header>

			<div>
				<form id="speech" action=""><span id="at">@</span> <input type="text" id="user" value="<?php echo $user; ?>"> <input type="submit" value="Pappagallo"></form>
			</div>
<!-- da implementare 
			<div>
				<input type="checkbox" id="includerrt" name="includerrt"> <label for="includerrt">Includi reply e RT</label> 
			</div>
-->
			<div id="tweet">
				Ultimo tweet:
				<div id="text" class="textarea"></div>
				<input type="text" id="length" value="0" class="counter" readonly>
				<div id="face"><img src="img/baloon-arrow.png" id="baloon-arrow"><div id="namebio"></div></div>
			</div>

			<div id="media">
				<p>Fotina allegata:</p>
			</div>

			<div id="video">
				<p>Video Youtube allegato:</p>
			</div>

			<div id="hashtags">
				Hashtags:
				<div class="textarea"></div>
				<input type="text" id="nhashtags" value="0" class="counter" readonly>
			</div>

			<div id="urls">
				URLs:
				<div class="textarea"></div>
				<input type="text" id="nurls" value="0" class="counter" readonly>
			</div>

			<footer>
				<p style="font-weight: bold;">Il Pappagallo v0.1b</p>
				<p>(ɔ) 2013 by <a href="http://www.twitter.com/xho" target="_blank">@xho</a> and <a href="http://www.twitter.com/batopa" target="_blank">@bato</a>
					| GNU <a href="http://www.gnu.org/copyleft/gpl.html" target="_blank">GPLv3</a></p>
				<p>Immagine di background di <a href="http://www.flickr.com/photos/duncanbarrett/4085793930/" target="_blank">Duncan Barrett</a></p>
				<p class="note">NB: app HTML5 sperimentale, se non funzia #ESC</p>
			</footer>

			<section id="error"><img src="img/baloon-arrow-lx.png"><div class="msg">Errore</div></section>

		</article>
		<section id="loader"></section>

		<!-- fork on github banner -->
		<a href="https://github.com/xho/pappagallo" title="Fork this project on Github" target="_blank"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_white_ffffff.png" alt="Fork me on GitHub"></a>
	</body>


	<script src="js/mespeak/mespeak.js"></script>
	<script type="text/javascript">
		meSpeak.loadConfig("js/mespeak/mespeak_config.json");
		meSpeak.loadVoice("js/mespeak/voices/it.json");
	</script>
	<script src="js/earify.js"></script>
</html>