'use babel';

import { CompositeDisposable, File } from 'atom';

export default {

    subscriptions: null,
    mutationObserver: null,
    active: true,

    activate(state) {
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register commands
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'auto-hide-files:toggle': () => this.toggle()
        }));

        // Create treeview observer
        this.mutationObserver = new MutationObserver(() => {
            if (this.active) this.hide_files();
        });
        this.mutationObserver.observe(document.querySelector(".tree-view"), {childList: true, subtree: true});

        // Initial hide call
        this.hide_files();
    },

    deactivate() {
        this.subscriptions.dispose();
        this.mutationObserver.dispose();
    },

    get_regular_expressions_for_projects() {
        // Returns a promise that resolves to key-value pairs for each opened project + an array of it's regex strings from the config file.
        // {project_name_1: [regex_1, regex_2, ...], project_name_2: [regex_1, regex_2, ...], ...}
        // Will create the config file if it doesn't exist yet.
        return new Promise((resolve, reject) => {
            var projectsRegExps = {};
            var projectRoots = atom.project.getPaths();
            var finishedWorkers = 0;
    		projectRoots.forEach((rootPath) => {
                var configFile = new File(rootPath + "/.autohidefiles");
                configFile.create().then(function(didCreateFile) {
                    // Load regex strings from config file
                    // ToDo: Cache regular expressions and only read the file if it has changed since last time!
                    var regExps = [];
                    var lineReader = require('readline').createInterface({
                        input: require('fs').createReadStream(configFile.getRealPathSync())
                    });

                    lineReader.on('line', (line) => {
                        if (!line.startsWith('#')) regExps.push(new RegExp(line));
                    });

                    lineReader.on('close', () => {
                        projectsRegExps[rootPath] = regExps;

                        // Resolve promise if final worker finished (No idea if this is thread-safe)
                        finishedWorkers++;
                        if (finishedWorkers == projectRoots.length) resolve(projectsRegExps);
                    });
                });
    		});
        });
    },

    get_data_path(element) {
        // Returns the data-path value for a treeview element
        if (element.childNodes.length > 0) {
            if (element.getAttribute('is') === "tree-view-directory") {
                if (element.childNodes[0].childNodes.length > 0) {
                    return element.childNodes[0].childNodes[0].getAttribute('data-path');
                }
            } else if (element.getAttribute('is') === "tree-view-file") {
                return element.childNodes[0].getAttribute('data-path');
            }

        }
    },

    check_regex_match(value, regExps) {
        // Checks if the value matches one of the regular expressions in regExps array
        return regExps.some((regExp) => {
            return regExp.test(value);
        });
    },

    hide_files() {
        // Hides each treeview entry whichs data path matches one of the specified regular expressions for the project it's contained in
        this.get_regular_expressions_for_projects().then((projectsRegExps) => {
            var treeViewProjectRoots = document.querySelectorAll("li.project-root");
            treeViewProjectRoots.forEach((treeViewProjectRoot) => {
                var projectRootPath = this.get_data_path(treeViewProjectRoot);
                var projectRegExps = projectsRegExps[projectRootPath];

                var treeViewProjectEntries = treeViewProjectRoot.querySelectorAll("li[is='tree-view-directory'], li[is='tree-view-file']");
                treeViewProjectEntries.forEach((treeViewProjectEntry) => {
                    var entryRelativeDataPath = this.get_data_path(treeViewProjectEntry).slice(projectRootPath.length);
                    if (this.check_regex_match(entryRelativeDataPath, projectRegExps)) {
                        treeViewProjectEntry.classList.add("auto-hide-files-hide");
                    }
                });
            });
        });
    },

    unhide_files() {
        // Unhides all treeview entries which have been hidden through this extension
        var hiddenElements = document.querySelectorAll(".auto-hide-files-hide")
        hiddenElements.forEach((hiddenElement) => {
            hiddenElement.classList.remove("auto-hide-files-hide");
        });
    },

    toggle() {
        // Toggles the auto hide feature on and off
        this.active = !this.active;
        if (this.active) {
            this.hide_files();
            atom.notifications.addInfo("Auto-Hide enabled.");
        } else {
            this.unhide_files();
            atom.notifications.addInfo("Auto-Hide temporarily disabled.");
        }
    }
};
