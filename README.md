# Auto-Hide Files
This extensions allows to specify a set of regular expression rules to automatically hide files and folders from the tree view.

![Demonstration](https://i.imgur.com/8XCTPKL.gif)

Rules are stored per project in a '.autohidefiles' file.<br>
Each line is one regular expression.<br>
Each file/folder which's path (relative to project folder) matches an expression will be hidden.

## Features
* Automatically hide specified files/folders from the treeview
* Define regular expressions in configuration file to specify which files/folders to hide
* Supports multiple opened projects (one configuration file per project folder)
* Toggle auto-hide on and off for the current session

## Known Issues
* Hidden files/folders sometimes blink into existence when expanding a closed folder
