<!DOCTYPE html>
<html>
<?php
	if (empty($_GET["user"]))
		$user = "riotta";
	else
		$user = $_GET["user"];
?>
	<head>
		<title>Pappagallo (ripete <?php echo $user; ?>)</title>
		<meta charset="utf-8">
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
			<div>
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

			<div>
				Hashtags:
				<div id="hashtags" class="textarea"></div>
				<input type="text" id="nhashtags" value="0" class="counter" readonly>
			</div>

			<div>
				URLs:
				<div id="urls" class="textarea"></div>
				<input type="text" id="nurls" value="0" class="counter" readonly>
			</div>

			<footer><p>Il Pappagallo | 0.1b 2013 by <a href="http://www.twitter.com/xho" target="_blank">@xho</a> | GNU <a href="http://www.gnu.org/copyleft/gpl.html" target="_blank">GPLv3</a></p>
				<p>L'immagine di background è di <a href="http://www.flickr.com/photos/duncanbarrett/4085793930/" target="_blank">Duncan Barrett</a></p>
				<p>NB: è un esperimento beta, se non funzia #ESC</p>
			</footer>

			<section id="loader"></section>
		</article>

	</body>

	<script src="js/mespeak/mespeak.js"></script>
	<script type="text/javascript">
		meSpeak.loadConfig("js/mespeak/mespeak_config.json");
		meSpeak.loadVoice("js/mespeak/voices/it.json");
	</script>
	<script src="js/earify.js"></script>
</html>