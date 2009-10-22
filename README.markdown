# Gritter for jQuery

A small growl-like notification plugin for jQuery

## Change Log

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
