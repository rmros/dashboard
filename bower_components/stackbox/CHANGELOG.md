#Stackbox Changelog

##0.3.4 (February 7, 2015)
* Updated dependencies.

##0.3.2 (February 6, 2015)
* Use documentElement instead of body to detect css3 animations

##0.3.1 (January 16, 2015)
* Fixed a bug where the close animation failed, because the animation end event handlers were registered twice.

##0.3.0 (November 5, 2014)
* Follow semantic versioning.

##0.2.10 (November 5, 2014)
* Added a 'whitelist' global option. This will allow one to supply a list of class names that should be whitelisted when checking if a modal should be closed when clicking on an element. If an element is clicked, and one of its parents has a class name matching one in the whitelist, the modal won't get closed.

##0.2.9 (November 3, 2014)
* If a modal's content changes, thereby affecting its width and/or height, its position is also automatically updated (providing the 'autoadjust' options is set to true.)

##0.2.8 (October 21, 2014)
* Body's overflow now gets reset to 'auto' when closing the last modal.

##0.2.7 (October 17, 2014)
* Fixed issue where the modal's content was hidden below the browser window.

##0.2.6 (July 11, 2014)
* Fixed positioning bug when using animation on open.
* Added animation end detection support for Opera.
* QUnit tests are now running properly on Travis CI.
* .editorconfig added to project.

##0.2.5 (July 03, 2014)
* Fixed bug where modal was positioning itself above offspring element even if without checking if there actually was any room for it.

##0.2.4 (June 27, 2014)
* Fixed width options (width/minWidth/maxWidth/respectBrowserWidth)

##0.2.3 (June 27, 2014)
* Added docs

##0.2.2 (June 26, 2014)
* Fixed z-index bug
* Fixed bug where hitting Esc to soon (before close anim finished) caused ordering and re-insertion of DOM issues.

##0.2.1 (June 26, 2014)
* Added jQuery package manifest

##0.2.0 (June 26, 2014)

* Added two global options: 'spinnerClass' and 'closeButtonIcon'.
