'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {

    const formatUris = async (uris: vscode.Uri[]) => {
        const forDemo = 0;
        const formatAfterSave = vscode.workspace.getConfiguration().get('formatContextMenu.saveAfterFormat') as boolean;
        for (let i = 0; i < uris.length; i++) {
            const uri = uris[i];
            try {
                await vscode.window.showTextDocument(uris[i], { preserveFocus: false, preview: true });
                await vscode.commands.executeCommand('editor.action.formatDocument', uri);
                if (formatAfterSave) {
                    await vscode.commands.executeCommand('workbench.action.files.save', uri);
                }
            } catch (exception) {
                vscode.window.showWarningMessage(`Could not format file ${uri}`);
            }
        }
    };

    const getRecursiveUris = async (uris: vscode.Uri[]) => {
        let outputUris: vscode.Uri[] = [];
        for (let i = 0; i < uris.length; i++) {
            if (fs.lstatSync(uris[i].fsPath).isDirectory()) {
                outputUris = [...outputUris, ...await vscode.workspace.findFiles({
                    base: uris[i].path,
                    pattern: '**/*'
                })];
            } else {
                outputUris.push(uris[i]);
            }
        }
        return outputUris;
    };

    context.subscriptions.push(...[

        vscode.commands.registerCommand('extension.formatSelectedFilesFromScmContext', async (...selectedFiles: vscode.SourceControlResourceState[]) => {
            const uris = await getRecursiveUris(selectedFiles.map(x => x.resourceUri));
            await formatUris(uris);
        }),

        vscode.commands.registerCommand('extension.formatSelectedFileFromEditorTileContext', async (clickedFile: vscode.Uri) => {
            await formatUris([clickedFile]);
        }),

        vscode.commands.registerCommand('extension.formatSelectedFilesFromExplorerContext', async (clickedFile: vscode.Uri, selectedFiles: vscode.Uri[]) => {
            const uris = await getRecursiveUris(selectedFiles ? selectedFiles : [clickedFile]);
            await formatUris(uris);
        })

    ]);

}

export function deactivate() {
}