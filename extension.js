const vscode = require('vscode');

// Track both files and folders
const fileStates = new Map();

function activate(context) {
    const emitter = new vscode.EventEmitter();

    const provider = {
        onDidChangeFileDecorations: emitter.event,
        provideFileDecoration(uri) {
            const state = fileStates.get(uri.fsPath);

            if (!state) return;

            if (state === 'read') {
                return {
                    badge: '✔️',
                    tooltip: 'Marked as Read',
                    color: new vscode.ThemeColor('charts.green')
                };
            } else if (state === 'unread') {
                return {
                    badge: '🆕',
                    tooltip: 'Marked as Unread',
                    color: new vscode.ThemeColor('charts.red')
                };
            } else if (state === 'updated') {
                return {
                    badge: '✏️',
                    tooltip: 'Marked as Updated',
                    color: new vscode.ThemeColor('charts.yellow')
                };
            }
        }
    };

    vscode.window.registerFileDecorationProvider(provider);

    function setState(state) {
        const selected = vscode.window.activeTextEditor?.document.uri;

        // fallback: get from File Explorer selection (files or folders)
        vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: `Mark as ${state}`
        }).then((uris) => {
            const targetUri = uris?.[0] ?? selected;
            if (targetUri) {
                fileStates.set(targetUri.fsPath, state);
                emitter.fire(targetUri);
            } else {
                vscode.window.showInformationMessage('No file or folder selected.');
            }
        });
    }

    context.subscriptions.push(
        vscode.commands.registerCommand('marker.markRead', () => setState('read')),
        vscode.commands.registerCommand('marker.markUnread', () => setState('unread')),
        vscode.commands.registerCommand('marker.markUpdated', () => setState('updated'))
    );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
