'use babel';

import AtomAutoHideFilesView from './atom-auto-hide-files-view';
import { CompositeDisposable } from 'atom';

export default {

  atomAutoHideFilesView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomAutoHideFilesView = new AtomAutoHideFilesView(state.atomAutoHideFilesViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomAutoHideFilesView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-auto-hide-files:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomAutoHideFilesView.destroy();
  },

  serialize() {
    return {
      atomAutoHideFilesViewState: this.atomAutoHideFilesView.serialize()
    };
  },

  toggle() {
    console.log('AtomAutoHideFiles was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
