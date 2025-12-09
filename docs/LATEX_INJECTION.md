# LaTeX Injection Support

## Overview

The tree-sitter-gregorio grammar includes **LaTeX syntax highlighting injection** for verbatim TeX elements in GABC files. This feature allows LaTeX commands to be highlighted with proper LaTeX syntax highlighting when using tree-sitter-aware editors.

## Supported Elements

LaTeX injection is enabled for all verbatim TeX contexts in GABC:

### 1. Header Fields with TeX Code

#### `annotation` Header
Annotation text displayed above the initial letter:

```gabc
annotation: \textbf{IN.};
annotation: \textit{6};
```

#### `mode-modifier` Header
Mode modifier typeset after the mode:

```gabc
mode-modifier: \textit{t.};
mode-modifier: \emph{transposed};
```

#### `mode-differentia` Header
Mode or tone differentia after the mode-modifier:

```gabc
mode-differentia: \textsc{g};
mode-differentia: \emph{variant};
```

#### `def-m0` through `def-m9` Headers
Macro definitions (0-9) for use in the score:

```gabc
def-m0: \textbf{Bold};
def-m1: \textit{Italic};
def-m2: \textcolor{red}{Red};
```

### 2. Syllable Verbatim Tag: `<v>...</v>`

Inline TeX code in syllable text:

```gabc
(c4) <v>\textit{italic}</v>(f) normal(g)
```

The LaTeX code `\textit{italic}` will receive LaTeX syntax highlighting.

### 3. Note-Level Verbatim Attribute: `[nv:...]`

TeX code attached to a single note:

```gabc
(c4) test(f[nv:\textbf{bold}]g)
```

### 4. Glyph-Level Verbatim Attribute: `[gv:...]`

TeX code attached to a glyph (multiple notes):

```gabc
(c4) test(fg[gv:\textcolor{red}{color}]h)
```

### 5. Element-Level Verbatim Attribute: `[ev:...]`

TeX code attached to an entire element (bar, clef, etc.):

```gabc
(c4) test(f) (::[ev:\hspace{1cm}]) test(g)
```

## Requirements

To enable LaTeX syntax highlighting injection, you need:

1. **Tree-sitter-gregorio grammar** installed (this grammar)
2. **Tree-sitter-latex grammar** installed in your editor
3. **Editor with injection support**:
   - ✅ Helix
   - ✅ Neovim (with nvim-treesitter)
   - ✅ Emacs (with tree-sitter support)
   - ✅ Other editors implementing tree-sitter injections

## How It Works

The grammar defines injection queries in `queries/injections.scm` that tell tree-sitter to apply LaTeX syntax highlighting to TeX code content:

```scheme
; Syllable verbatim tag: <v>TeX code</v>
(syllable_other_verbatim
  tex_code: (tex_code_verbatim) @injection.content
  (#set! injection.language "latex"))

; Note-level verbatim attribute: [nv:TeX code]
(gabc_attribute
  name: (nv)
  tex_code: (tex_code) @injection.content
  (#set! injection.language "latex"))
```

When tree-sitter parses a GABC file and encounters verbatim TeX elements, it automatically applies LaTeX syntax highlighting to the TeX code content.

## Examples

### Header Example

```gabc
name: Test Chant;
annotation: \textbf{IN.};
mode-modifier: \textit{t.};
mode-differentia: \emph{g};
def-m0: \textcolor{red}{Important};
%%
(c4) Test(f)
```

In this example:
- `\textbf{IN.}` gets LaTeX highlighting in the annotation header
- `\textit{t.}` gets LaTeX highlighting in the mode-modifier header
- `\emph{g}` gets LaTeX highlighting in the mode-differentia header
- `\textcolor{red}{Important}` gets LaTeX highlighting in the def-m0 header

### Simple Example

```gabc
name: LaTeX Injection Demo;
%%
(c4) <v>\emph{emphasis}</v>(f) test(g[nv:\textbf{bold}]h)
```

In this example:
- `\emph{emphasis}` gets LaTeX highlighting
- `\textbf{bold}` gets LaTeX highlighting

### Complex Example

```gabc
name: Complex LaTeX;
%%
(c4) <v>\begin{small}text\end{small}</v>(f) 
test(fg[gv:\textcolor{red}{colored}]h) 
(::[ev:\vspace{5mm}]) more(i)
```

All LaTeX commands receive proper syntax highlighting:
- `\begin`, `\end` environments
- `\textcolor` with arguments
- `\vspace` with measurements

## Benefits

1. **Better readability**: LaTeX commands are visually distinct from surrounding GABC code
2. **Error detection**: Syntax errors in LaTeX code are more visible
3. **Faster editing**: Easier to write and maintain TeX code in GABC files
4. **Consistent experience**: Same LaTeX highlighting as in .tex files

## Technical Details

### Grammar Changes

The grammar was modified to expose TeX content as named nodes:

- Added `tex_code` token rule for attribute content: `/[^\]]*/`
- Added `tex_code_verbatim` token rule for `<v>` content: `/[^<]+/`
- Updated verbatim element definitions to use these named nodes

This allows injection queries to target specific TeX content for highlighting.

### Parse Tree Structure

Before injection:
```
(syllable_other_verbatim)  # No child for TeX content
```

After injection:
```
(syllable_other_verbatim
  tex_code: (tex_code_verbatim))  # Named node for TeX content
```

The named `tex_code` and `tex_code_verbatim` nodes are what the injection queries capture.

## Limitations

1. **Partial TeX support**: Only basic LaTeX syntax highlighting is provided. Complex TeX macros may not be perfectly highlighted.
2. **Editor dependency**: Injection only works in editors that support tree-sitter injections.
3. **Grammar requirement**: Both tree-sitter-gregorio and tree-sitter-latex must be installed.
4. **No validation**: The LaTeX code is highlighted but not validated. Syntax errors won't be caught until compilation.

## Troubleshooting

### LaTeX code not highlighted

**Check:**
1. Is tree-sitter-latex installed in your editor?
2. Does your editor support tree-sitter injections?
3. Is the grammar properly configured in your editor settings?

### For Helix users:

```toml
# In ~/.config/helix/languages.toml
[[language]]
name = "gabc"
# ... gabc settings ...

[[language]]
name = "latex"
# ... latex settings ...
```

Ensure both language entries are present and `hx --grammar build` has been run.

## See Also

- [Tree-sitter Injections Documentation](https://tree-sitter.github.io/tree-sitter/syntax-highlighting#language-injection)
- [Helix Setup Guide](HELIX_SETUP.md)
- [Gregorio Documentation](https://gregorio-project.github.io/gregorio/dev-gabc/)
