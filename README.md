pappagallo
==========

Pappagallo (Parrot in english) is a HTML 5 concept app.

Repeats the very last tweet of a chosen user.

Defaults to @riotta.



INSTALL
-------

1. create a Twitter application (http://dev.twitter.com) for the proxy and obtain consumer key, secret, access token key, access token secret (generate the last two)

2. upload the content of the "php" folder on a public server and modify "twitter-proxy" updating user (the user which created the twitterapp), consumer key, consumer secret, access token and access token secret

3. install the rest of the app on a web server, editing configuration in js/earify.js (the twitter proxy URL installed before at #2 is mandatory)



USAGE
-----

Click "pappagallo".

For devs: in browser console (such as in Chrome developer tool) you have some log.



LICENSE
-------

GNU GPLv3 - http://www.gnu.org/copyleft/gpl.html



THIRD PARTY SOFTWARE USED
-------------------------

* meSpeak.js - temporary, may change in the future - http://www.masswerk.at/mespeak/
* twitteroauth - for proxy autenthication on twitter



ONLINE EXAMPLE
--------------

http://xho.bedita.net/pappagallo/



CONTRIBUTORS
------------

xho - http://twitter.com/xho

bato - http://twitter.com/batopa
