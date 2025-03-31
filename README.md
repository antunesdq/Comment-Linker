# Comment Linker Extension

The **Comment Linker** extension for Visual Studio Code allows you to create clickable links within comments in Python files. It enhances code documentation by providing an easy way to reference other files, locations, or specific lines in your codebase.

## Features

- Automatically detects and highlights links within comments in Python files.
- Supports absolute paths, relative paths, and links to specific line numbers.
- Clicking on a link opens the corresponding file, location, or line within Visual Studio Code.
- Markdown-like experience where after aditing the link, only the link's text will be available, without the url itself.

## Installation

1. Launch Visual Studio Code.
2. Go to the Extensions view (Ctrl+Shift+X).
3. Search for "Comment Linker" and click **Install**.
4. Reload Visual Studio Code to activate the extension.

## Usage

1. Open a Python file in Visual Studio Code.
2. Write comments containing links using the following format: 
    ```
    [link description](link target)
    ```
    Examples:
    - Absolute path: 
      ```
      # Refer to the [config file](/absolute/path/to/config.py).
      ```
      ![Absolute Path Example](img/Absolute%20Path.gif)
    - Relative path:
      ```
      # Check the [helper script](../relative/path/to/helper.py).
      ```
      ![Relative Path Example](img/Relative%20Path.gif)
    - Line number:
      ```
      # See the [function definition](../relative/path/to/file.py#L42).
      ```
      ![Line Path Example](img/Line%20Path.gif)

3. Save the file. The links will be detected and highlighted automatically.
4. Hover over a link to view its description in a tooltip.
5. Click on a link to open the corresponding file, location, or line within Visual Studio Code.
6. When the file is closed or not being worked on, the link highlighting will be removed, leaving only the plain text.

## Configuration

The Comment Linker extension does not require any additional configuration. It automatically detects and highlights links within comments in Python files.

## Known Issues

- Currently, the extension only supports Python files.
- Links are only recognized within comments and not within other parts of the code.

## Feedback and Contributions

If you encounter any issues, have suggestions, or would like to contribute to the Comment Linker extension, please visit the [GitHub repository](https://github.com/antunesdq/Comment-Linker). Contributions, bug reports, and feature requests are welcome.

## Release Notes

### Version 1.1.0

- Added support for linking to specific line numbers.
- Enhanced support for absolute and relative paths.
- Implemented automatic link removal when the file is not being worked on.

### Version 1.0.0

- Initial release of the Comment Linker extension.

## License

This extension is released under the MIT License. See [LICENSE](https://github.com/antunesdq/Comment-Linker/blob/main/LICENSE) for details.

---

Feel free to modify and expand upon this template to include more specific details about your extension, such as additional features, supported languages, or any customization options available.