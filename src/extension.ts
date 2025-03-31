import * as vscode from 'vscode';
import * as path from 'path';

// Decoration for the visible link text
const visibleLinkDecoration = vscode.window.createTextEditorDecorationType({
    color: '#61AFEF',
    textDecoration: 'underline',
    cursor: 'pointer'
});

// Decoration for the hidden parts (brackets and path)
const hiddenDecoration = vscode.window.createTextEditorDecorationType({
    textDecoration: 'none; display: none'
});

class MyLinkProvider implements vscode.DocumentLinkProvider {
    constructor(private context: vscode.ExtensionContext) {}

    private resolvePath(document: vscode.TextDocument, rawPath: string): string {
        // Handle absolute paths
        if (path.isAbsolute(rawPath)) {
            return rawPath;
        }

        // Handle root-relative paths (starting with /)
        if (rawPath.startsWith('/')) {
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
            if (workspaceFolder) {
                return path.join(workspaceFolder.uri.fsPath, rawPath.substring(1));
            }
            return rawPath;
        }

        // Handle relative paths (from current file's directory)
        const currentFileDir = path.dirname(document.uri.fsPath);
        return path.join(currentFileDir, rawPath);
    }

    provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
        const text = document.getText();
        const linkPattern = /\[([^\]]+)\]\(([^\):]+)(?::(\d+))?\)/g;
        let match;
        const links: vscode.DocumentLink[] = [];
        const visibleRanges: vscode.Range[] = [];
        const hiddenRanges: vscode.Range[] = [];
        const fullLinkRanges: vscode.Range[] = [];

        while ((match = linkPattern.exec(text))) {
            const [fullMatch, desc, path, line] = match;
            
            // Resolve the path (handling both relative and absolute paths)
            const resolvedPath = this.resolvePath(document, path);
            
            // Range for the visible description text
            const descStart = document.positionAt(match.index + 1); // Skip '['
            const descEnd = document.positionAt(match.index + 1 + desc.length);
            const descRange = new vscode.Range(descStart, descEnd);
            
            // Range for the hidden parts (brackets and path)
            const fullStart = document.positionAt(match.index);
            const fullEnd = document.positionAt(match.index + fullMatch.length);
            const hiddenBeforeRange = new vscode.Range(fullStart, descStart);
            const hiddenAfterRange = new vscode.Range(descEnd, fullEnd);
            const fullRange = new vscode.Range(fullStart, fullEnd);
            
            const uri = vscode.Uri.file(resolvedPath);
            // Create URI with line number if specified
            const targetUri = line ? uri.with({ fragment: `L${line}` }) : uri;
            
            const link = new vscode.DocumentLink(descRange, targetUri);
            links.push(link);
            visibleRanges.push(descRange);
            hiddenRanges.push(hiddenBeforeRange, hiddenAfterRange);
            fullLinkRanges.push(fullRange);
        }
        
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document === document) {
            // Apply initial decorations (show only link text)
            editor.setDecorations(visibleLinkDecoration, visibleRanges);
            editor.setDecorations(hiddenDecoration, hiddenRanges);
            
            // Track which lines have links
            const linkLines = new Set(fullLinkRanges.map(range => range.start.line));
            
            // Update visibility based on cursor position
            const updateLinkVisibility = () => {
                const position = editor.selection?.active;
                if (position && linkLines.has(position.line)) {
                    // Cursor is on a line with links - show full markup
                    editor.setDecorations(hiddenDecoration, []);
                    editor.setDecorations(visibleLinkDecoration, []);
                } else {
                    // Cursor is not on a line with links - show only link text
                    editor.setDecorations(hiddenDecoration, hiddenRanges);
                    editor.setDecorations(visibleLinkDecoration, visibleRanges);
                }
            };
            
            // Set up event listeners
            const selectionDisposable = vscode.window.onDidChangeTextEditorSelection(updateLinkVisibility);
            const textChangeDisposable = vscode.window.onDidChangeTextEditorSelection(updateLinkVisibility);
            
            // Initial update
            updateLinkVisibility();
            
            // Clean up when editor changes
            const editorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(e => {
                if (e !== editor) {
                    selectionDisposable.dispose();
                    textChangeDisposable.dispose();
                    editorChangeDisposable.dispose();
                }
            });
            
            // Add disposables to context
            this.context.subscriptions.push(selectionDisposable);
            this.context.subscriptions.push(textChangeDisposable);
            this.context.subscriptions.push(editorChangeDisposable);
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
                const markdownString = new vscode.MarkdownString(`Go to: ${path}${line ? ` (line ${line})` : ''}`);
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