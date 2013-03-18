myMplayer
========

myMplayer is a webinterface for mplayer. It's still in an early development stage.

Requirements
============

Server
------

 * [mplayer](http://mplayerhq.hu/) or [mplayer2](http://mplayer2.org/)
 * [Python](http://www.python.org/)
 * [jsonrpclib](https://github.com/joshmarshall/jsonrpclib)
 * [jquery](http://jquery.com/)
 * [jquery-ui](http://jqueryui.com/)

Client
------

 + Webbrowser with JavaScript and CSS3 Support e.g. [Firefox](https://www.mozilla.org/firefox)


Usage
=====

Server
------

Put `jquery-1.9.0.js` and `jquery-ui-1.10.0.custom.js` in `htdocs/moep/js/` 
and your favorite jquery-ui theme in `htdocs/moep/css` and change the paths 
in `htdocs/moep/index.htm`.  
Then run `./start_server [Address] [Port]` to start server.

Client
------

Open your webbrowser and go to `http://address:port/`.  
The usage of the Webinterface should be pretty intuitive.  
Enjoy the bugs or fix them (or write your own web interface).

Screenshot
==========

![myMplayer screenshot with dark-hive theme](http://dingensundso.de/screenshots/mymplayer.jpg)
