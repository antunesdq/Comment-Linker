import * as vscode from 'vscode';

// Decoration for the visible link text
const visibleLinkDecoration = vscode.window.createTextEditorDecorationType({
    color: '#61AFEF',
    textDecoration: 'underline',
    cursor: 'pointer'
});

// Decoration for the hidden parts (brackets and path)
const hiddenDecoration = vscode.window.createTextEditorDecorationType({
    color: 'transparent',
    textDecoration: 'none'
});

class MyLinkProvider implements vscode.DocumentLinkProvider {
    constructor(private context: vscode.ExtensionContext) {}

    provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
        const text = document.getText();
        const linkPattern = /\[([^\]]+)\]\(([^\):]+)(?::(\d+))?\)/g;
        let match;
        const links: vscode.DocumentLink[] = [];
        const visibleRanges: vscode.Range[] = [];
        const hiddenRanges: vscode.Range[] = [];

        while ((match = linkPattern.exec(text))) {
            const [fullMatch, desc, path, line] = match;
            let fullPath = path;
            
            if (!fullPath.startsWith('/')) {
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (workspaceFolder) {
                    fullPath = vscode.Uri.joinPath(workspaceFolder.uri, fullPath).fsPath;
                }
            }
            
            // Range for the visible description text
            const descStart = document.positionAt(match.index + 1); // Skip '['
            const descEnd = document.positionAt(match.index + 1 + desc.length);
            const descRange = new vscode.Range(descStart, descEnd);
            
            // Range for the hidden parts (brackets and path)
            const fullStart = document.positionAt(match.index);
            const fullEnd = document.positionAt(match.index + fullMatch.length);
            const hiddenBeforeRange = new vscode.Range(fullStart, descStart);
            const hiddenAfterRange = new vscode.Range(descEnd, fullEnd);
            
            const uri = vscode.Uri.file(fullPath);
            if (line) {
                uri.with({ fragment: line });
            }
            
            const link = new vscode.DocumentLink(descRange, uri);
            links.push(link);
            visibleRanges.push(descRange);
            hiddenRanges.push(hiddenBeforeRange, hiddenAfterRange);
        }
        
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Apply decorations
            editor.setDecorations(visibleLinkDecoration, visibleRanges);
            editor.setDecorations(hiddenDecoration, hiddenRanges);
            
            // Show full text when cursor is near
            const showFullText = vscode.window.onDidChangeTextEditorSelection(e => {
                if (e.textEditor === editor) {
                    const position = e.selections[0]?.active;
                    if (position) {
                        const shouldShow = links.some((link: vscode.DocumentLink) => {
                            const range = link.range;
                            // Show if cursor is within 5 characters of the link
                            return Math.abs(position.line - range.start.line) <= 1 && 
                                   Math.abs(position.character - range.start.character) <= 5;
                        });
                        
                        if (shouldShow) {
                            editor.setDecorations(hiddenDecoration, []);
                        } else {
                            editor.setDecorations(hiddenDecoration, hiddenRanges);
                        }
                    }
                }
            });
            
            // Clean up when editor changes
            const disposable = vscode.window.onDidChangeActiveTextEditor(e => {
                if (e !== editor) {
                    showFullText.dispose();
                    disposable.dispose();
                }
            });
            
            // Add disposables to context
            this.context.subscriptions.push(showFullText);
            this.context.subscriptions.push(disposable);
        }
        
        return links;
    }
}

class MyHoverProvider implements vscode.HoverProvider {
    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        const linkPattern = /\[([^\]]+)\]\(([^\):]+)(?::(\d+))?\)/;
        const range = document.getWordRangeAtPosition(position, linkPattern);
        if (range) {
            const linkText = document.getText(range);
            const match = linkText.match(linkPattern);
            if (match) {
                const [, desc, path, line] = match;
                const markdownString = new vscode.MarkdownString(`[${desc}](${path}${line ? `:${line}` : ''})`);
                markdownString.isTrusted = true;
                return new vscode.Hover(markdownString);
            }
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Comment Linker extension activated!');
    
    const linkProvider = new MyLinkProvider(context);
    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider({ language: 'python' }, linkProvider));
    context.subscriptions.push(vscode.languages.registerHoverProvider('python', new MyHoverProvider()));
}

export function deactivate() {}