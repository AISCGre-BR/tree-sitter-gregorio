# Header Syntax Highlighting

## Overview

The tree-sitter-gregorio grammar provides **specialized syntax highlighting** for specific GABC headers based on their expected content type. This enhances readability and helps catch errors when writing GABC files.

## Header Types

### 1. Numeric Headers

Headers that expect numeric values receive **number highlighting** for their values:

#### `mode` Header
The mode of the piece, normally an Arabic number between 1 and 8:

```gabc
mode: 5;
mode: 8;
mode: 1 or 8;  // Can also contain text
mode: VIII;    // Can be Roman numerals
```

The value `5`, `8`, `1 or 8`, or `VIII` will be highlighted as a number.

#### `staff-lines` Header
Number of lines in the staff:

```gabc
staff-lines: 4;
staff-lines: 5;
```

The value will be highlighted as a number.

#### `nabc-lines` Header
Number of NABC (adiastematic notation) lines:

```gabc
nabc-lines: 1;
nabc-lines: 0;
```

The value will be highlighted as a number.

**Note**: The `mode` header is flexible and can contain text (like "1 or 8" or "VIII"), but it's still treated as a numeric header for syntax highlighting purposes.

### 2. TeX Headers (with LaTeX Injection)

Headers that accept TeX code receive **LaTeX syntax highlighting injection**:

#### `annotation` Header
Text to appear above the initial letter:

```gabc
annotation: \textbf{IN.};
annotation: \textit{6};
```

LaTeX commands like `\textbf{IN.}` receive LaTeX syntax highlighting.

#### `mode-modifier` Header
Mode modifier typeset after the mode:

```gabc
mode-modifier: \textit{t.};
mode-modifier: \emph{transposed};
```

#### `mode-differentia` Header
Mode or tone differentia:

```gabc
mode-differentia: \textsc{g};
mode-differentia: \emph{variant};
```

#### `def-m0` through `def-m9` Headers
Macro definitions (0-9) containing TeX code:

```gabc
def-m0: \textbf{Bold};
def-m1: \textit{Italic};
def-m2: \textcolor{red}{Red};
```

See [LaTeX Injection Documentation](LATEX_INJECTION.md) for more details on TeX headers.

### 3. Generic Headers

All other headers use standard attribute highlighting for the header name:

```gabc
name: Kyrie VIII;
office-part: Kyriale;
book: Graduale Romanum;
transcriber: John Doe;
commentary: This is a comment;;
```

The header names (`name`, `office-part`, etc.) are highlighted as attributes, while values remain plain text.

## Example GABC File

Here's an example showing all header types with syntax highlighting:

```gabc
name: Example Chant;                        // Generic header
mode: 5;                                     // Numeric header (5 highlighted)
mode-modifier: \textit{t.};                  // TeX header (LaTeX highlighted)
mode-differentia: \emph{g};                  // TeX header (LaTeX highlighted)
annotation: \textbf{IN.};                    // TeX header (LaTeX highlighted)
staff-lines: 4;                              // Numeric header (4 highlighted)
nabc-lines: 1;                               // Numeric header (1 highlighted)
def-m0: \textcolor{red}{Important};          // TeX header (LaTeX highlighted)
office-part: Antiphona;                      // Generic header
transcriber: Jane Smith;                     // Generic header

%%

(c4) Example(f) chant(g)
```

## Benefits

### For Numeric Headers
- **Visual distinction**: Numbers stand out from text
- **Quick validation**: Easy to spot non-numeric values where numbers are expected
- **Consistency**: Same highlighting used for all numeric values in the file

### For TeX Headers
- **LaTeX syntax**: Full LaTeX highlighting within header values
- **Error detection**: Syntax errors in LaTeX code are more visible
- **Better editing**: Same experience as editing .tex files
- **Macro support**: All 10 macro definitions (def-m0 through def-m9) supported

### For Generic Headers
- **Clarity**: Header names are visually distinct from their values
- **Flexibility**: Works with any header name, including user-defined ones

## Implementation Details

### Grammar Structure

The grammar defines specific node types for each header category:

```
header
├── header_generic          // Standard headers
├── header_numeric_mode     // mode: number;
├── header_numeric_staff_lines  // staff-lines: number;
├── header_numeric_nabc_lines   // nabc-lines: number;
├── header_tex_annotation   // annotation: TeX code;
├── header_tex_mode_modifier    // mode-modifier: TeX code;
├── header_tex_mode_differentia // mode-differentia: TeX code;
└── header_tex_def_macro    // def-m0: TeX code; ... def-m9: TeX code;
```

### Highlighting Queries

The `queries/highlights.scm` file contains:

```scheme
; Header names
(header_name) @attribute

; Numeric values
(header_value_numeric) @number

; TeX content is handled by injection queries in queries/injections.scm
```

### Injection Queries

The `queries/injections.scm` file defines LaTeX injection for TeX headers:

```scheme
; annotation: TeX code;
(header_tex_annotation
  value: (tex_code_header) @injection.content
  (#set! injection.language "latex"))

; Similar patterns for mode-modifier, mode-differentia, and def-m0-9
```

## Editor Support

Syntax highlighting works in any editor with tree-sitter support:

- ✅ **Helix** - Full support for both highlighting and injection
- ✅ **Neovim** (with nvim-treesitter) - Full support
- ✅ **Emacs** (with tree-sitter) - Full support
- ✅ **Other tree-sitter-aware editors** - Should work out of the box

### Requirements

For LaTeX injection in TeX headers:
1. Both `tree-sitter-gregorio` and `tree-sitter-latex` must be installed
2. Editor must support tree-sitter language injection

For numeric highlighting:
1. Only `tree-sitter-gregorio` is needed
2. Works immediately with any tree-sitter-aware editor

## See Also

- [LaTeX Injection Documentation](LATEX_INJECTION.md) - Detailed information about TeX headers
- [GABC Syntax Specification](GABC_SYNTAX_SPECIFICATION.md) - Complete header reference
- [Helix Setup Guide](HELIX_SETUP.md) - Editor configuration
