const vscode = require('vscode');

// Map to store state for files/folders
const fileStates = new Map();

function activate(context) {
    const emitter = new vscode.EventEmitter();

    const provider = {
        onDidChangeFileDecorations: emitter.event,
        provideFileDecoration(uri) {
            const state = fileStates.get(uri.fsPath);
            if (!state) return;

            switch (state) {
                case 'read':
                    return {
                        badge: '✔️',
                        tooltip: 'Marked as Read',
                        color: new vscode.ThemeColor('charts.green')
                    };
                case 'unread':
                    return {
                        badge: '🆕',
                        tooltip: 'Marked as Unread',
                        color: new vscode.ThemeColor('charts.red')
                    };
                case 'updated':
                    return {
                        badge: '✏️',
                        tooltip: 'Marked as Updated',
                        color: new vscode.ThemeColor('charts.yellow')
                    };
            }
        }
    };

    vscode.window.registerFileDecorationProvider(provider);

    /**
     * Set the marking state for a file or folder.
     * If no URI is passed (e.g. from context menu), prompt user to pick one.
     */
    function setState(state, uriFromContextMenu) {
        const uri = uriFromContextMenu || vscode.window.activeTextEditor?.document.uri;

        if (uri) {
            fileStates.set(uri.fsPath, state);
            emitter.fire(uri);
        } else {
            vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: `Mark as ${state}`
            }).then((uris) => {
                if (uris && uris[0]) {
                    fileStates.set(uris[0].fsPath, state);
                    emitter.fire(uris[0]);
                } else {
                    vscode.window.showInformationMessage('No file or folder selected.');
                }
            });
        }
    }

    context.subscriptions.push(
        vscode.commands.registerCommand('marker.markRead', (uri) => setState('read', uri)),
        vscode.commands.registerCommand('marker.markUnread', (uri) => setState('unread', uri)),
        vscode.commands.registerCommand('marker.markUpdated', (uri) => setState('updated', uri))
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
