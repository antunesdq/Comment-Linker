// Import the vscode module
import * as vscode from 'vscode';

// Create a TextEditorDecorationType that underlines text and changes its color
const linkDecoration = vscode.window.createTextEditorDecorationType({
    textDecoration: 'underline',
    color: '#61AFEF'
});

// Define a class that implements the DocumentLinkProvider interface
class MyLinkProvider implements vscode.DocumentLinkProvider {
    // The provideDocumentLinks method is called when VS Code needs to get the document links for a text document
    provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
        // Get the text of the document
        const text = document.getText();
        // Define a regular expression that matches links in the form [description](path)
        const linkPattern = /\[[^\]]+\]\([^\)]+\)/g;
        let match;
        const links = [];
        const decorations = [];
        // Find all matches of the regular expression in the text
        while (match = linkPattern.exec(text)) {
            // Extract the description and the path from the match
            const descMatch = match[0].match(/\[(.*?)\]/);
            const pathMatch = match[0].match(/\((.*?)\)/);
            if (descMatch && pathMatch) {
                let path = pathMatch[1];
                // If the path is not absolute, make it relative to the workspace folder
                if (!path.startsWith('/')) {
                    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                    if (workspaceFolder) {
                        path = vscode.Uri.joinPath(workspaceFolder.uri, path).fsPath;
                    }
                }
                // Get the start and end positions of the description
                const descStart = document.positionAt(match.index + 1); // 1 is for '['
                const descEnd = document.positionAt(match.index + descMatch[0].length - 1); // -1 is for ']'
                const range = new vscode.Range(descStart, descEnd);
                // Create a DocumentLink for the match
                const link = new vscode.DocumentLink(range, vscode.Uri.file(path));
                links.push(link);
                decorations.push(range);
            }
        }
        // Underline the links in the active text editor
        if (vscode.window.activeTextEditor) {
            vscode.window.activeTextEditor.setDecorations(linkDecoration, decorations);
        }
        // Return the links
        return links;
    }
}

// Define a class that implements the HoverProvider interface
class MyHoverProvider implements vscode.HoverProvider {
    // The provideHover method is called when VS Code needs to show a hover
    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        // Get the range of the word at the position where the hover was invoked
        const range = document.getWordRangeAtPosition(position, /\[[^\]]+\]\([^\)]+\)/);
        if (range) {
            // Get the text of the word
            const linkText = document.getText(range);
            // Parse the text to get the description and the path
            const descMatch = linkText.match(/\[(.*?)\]/);
            const pathMatch = linkText.match(/\((.*?)\)/);
            if (descMatch && pathMatch) {
                const description = descMatch[1];
                const path = pathMatch[1];
                // Create a MarkdownString for the hover
                const markdownString = new vscode.MarkdownString(`[${description}](file://${path})`);
                markdownString.isTrusted = true;
                // Return a Hover
                return new vscode.Hover(markdownString);
            }
        }
    }
}

// The activate function is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "Comment Linker" is nowactive!');

    // Show a message that the extension is active
    vscode.window.showInformationMessage('Comment Linker is active!');

    // Register the DocumentLinkProvider for Python files
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider({ language: 'python' }, new MyLinkProvider()));
    // Register the HoverProvider for Python files
    context.subscriptions.push(vscode.languages.registerHoverProvider('python', new MyHoverProvider()));
    // Register a command that opens a document
    context.subscriptions.push(vscode.commands.registerCommand('extension.openLink', ({ path }) => {
        vscode.workspace.openTextDocument(path).then(doc => {
            vscode.window.showTextDocument(doc);
        });
    }));
}

// The deactivate function is called when your extension is deactivated
export function deactivate() {}
