# Gritter for jQuery

A small growl-like notification plugin for jQuery
- http://boedesign.com/blog/2009/07/11/growl-for-jquery-gritter/

## Change Log

### Changes in 1.7.1 (March 29, 2011)

* Dropped IE6 support
* Added position option to global options (bottom-left, top-left, top-right, bottom-right)

### Changes in 1.7 (March 25, 2011)

* Fixed 404 issue in the css when fetching '.' as an image
* Added callback parameter in before_close and after_close callbacks to determine whether it was closed manually by clicking the (X)

### Changes in 1.6 (December1, 2009)

* Commented code using JSDOC
* Major code cleanup/re-write
* Made it so when you hit the (X) close button, the notification slides up and vanishes instead of just vanishing
* Added optional "class_name" option for $.gritter.add() to apply a class to a specific notification
* Fixed IE7 issue pointed out by stoffel (http://boedesign.com/blog/2009/07/11/growl-for-jquery-gritter/) 

### Changes in 1.5 (October 21, 2009)

* Renamed the global option parameters to make more sense
* Made it so the global options are only being ran once instead of each $.gritter.add() call

### Changes in 1.4 (October 20, 2009)

* Added callbacks (before_open, before_close, after_open, after_close) to the gritter notifications
* Added callbacks (before_close, after_close) to the removeAll() function
* Using 1 image for the CSS instead of 5 (Thanks to Ozum Eldogan)
* Added option to over-ride gritter global options with $.extend

### Changes in 1.3 (August 1, 2009)

* Fixed IE6 positioning bug

### Changes in 1.2 (July 13, 2009)

* Fixed hover bug (pointed out by Beel & tXptr on the comments)
