# Helix Editor Setup for tree-sitter-gregorio

This guide explains how to configure [Helix editor](https://helix-editor.com/) to use the tree-sitter-gregorio grammar for GABC files.

## Prerequisites

- Helix editor installed (version 23.10 or newer recommended)
- tree-sitter-gregorio grammar built

## Setup Instructions

### 1. Build the Grammar

First, ensure the grammar is built:

```bash
cd tree-sitter-gregorio
npm install
npm run generate
npm run build
```

### 2. Configure Helix

Create or edit your Helix languages configuration file at `~/.config/helix/languages.toml`:

```toml
# GABC (Gregorian Chant Notation)
[[language]]
name = "gabc"
scope = "source.gabc"
injection-regex = "^(gabc|gregorio)$"
file-types = ["gabc"]
comment-token = "%"
indent = { tab-width = 2, unit = "  " }
roots = []

[language.auto-pairs]
'(' = ')'
'[' = ']'
'{' = '}'
'<' = '>'

[[grammar]]
name = "gabc"
source = { path = "/path/to/tree-sitter-gregorio" }
```

**Important**: Replace `/path/to/tree-sitter-gregorio` with the actual absolute path to your tree-sitter-gregorio directory.

### 3. Build Grammar in Helix

After configuring, build the grammar for Helix:

```bash
hx --grammar fetch
hx --grammar build
```

### 4. Copy Queries

Helix uses the `queries/` directory from the grammar. The tree-sitter-gregorio repository already includes a complete `highlights.scm` file with syntax highlighting for:

- Headers and comments
- Musical notation (pitches, clefs, bars, neumes)
- Alterations and spacing
- Style tags with markup highlighting:
  - `<b>text</b>` - Bold markup
  - `<i>text</i>` - Italic markup
  - `<ul>text</ul>` - Underline markup
- NABC notation (glyphs, modifiers, significant letters)

The queries are automatically used by Helix once the grammar is built.

### LaTeX Injection

The grammar includes **LaTeX syntax highlighting injection** for verbatim TeX elements:

- **`<v>TeX code</v>`** - Syllable verbatim tag
- **`[nv:TeX code]`** - Note-level verbatim attribute
- **`[gv:TeX code]`** - Glyph-level verbatim attribute  
- **`[ev:TeX code]`** - Element-level verbatim attribute

When you write LaTeX commands inside these elements, they will be highlighted with LaTeX syntax highlighting, making it easier to write and maintain TeX code in your GABC files.

Example:
```gabc
(c4) <v>\textit{italic text}</v>(f) test(g[nv:\textbf{bold}])
```

## Syntax Highlighting Features

### Headers

Header names are highlighted as attributes:

```gabc
name: Test Chant;
mode: 1;
```

- `name:` and `mode:` are highlighted as attributes
- Header values remain plain text

### Style Tags with Markup

Text inside style tags will be highlighted with appropriate markup in **both complete and cross-syllable tags**:

```gabc
(c4) <b>Pa</b>(f) <i>ter</i>(g) <ul>nos</ul>(h)
```

Supported style tags:
- `<b>...</b>` → **bold** markup
- `<i>...</i>` → *italic* markup  
- `<ul>...</ul>` → <u>underline</u> markup
- `<sc>...</sc>` → small caps (heading markup)
- `<tt>...</tt>` → teletype/monospace (raw markup)
- `<c>...</c>` → colored text (link markup)

**Note**: Plain syllable text (without style tags) has no special highlighting and appears as regular text.

### Cross-Syllable Tags

The grammar fully supports cross-syllable tags that span multiple notation items, **with proper syntax highlighting applied to all text within the tag boundaries**:

```gabc
(c4) <b>Pa(f) ter</b>(g)
```

This will correctly parse and highlight:
- "Pa" as bold text (with `<b>` opening tag)
- "ter" as bold text (with `</b>` closing tag)

The markup highlighting is automatically applied to syllables containing either:
- The opening tag: `<b>text`
- The closing tag: `text</b>`
- A complete tag: `<b>text</b>`

### GABC Elements

- **Pitches**: Lowercase (a-n) and uppercase (A-N) notes
- **Clefs**: c1-c4, f1-f4, cb1-cb4
- **Bars**: `,`, `;`, `:`, `::`, etc.
- **Spacing**: `/`, `//`, `!/`, etc.
- **Alterations**: `x`, `y`, `#`

### NABC Elements

- **Glyphs**: vi, pu, cl, pe, to, etc.
- **Modifiers**: S, G, M, -, >, ~
- **Significant letters**: a (altius), c (celeriter), t (tenere), etc.

## Testing

To test if the setup is working:

1. Create a test file `test.gabc`:
```gabc
name: Test;
%%
(c4) Ký(f)ri(g)e(h) e(g)lé(f)i(e)son.(d.) (::)
```

2. Open it in Helix:
```bash
hx test.gabc
```

You should see syntax highlighting for all GABC elements.

## Troubleshooting

### Grammar not found

If Helix can't find the grammar, ensure:
- The `source.path` in `languages.toml` is correct and absolute
- You ran `hx --grammar build` after configuration

### No syntax highlighting

If you see no highlighting:
- Check that the file extension is `.gabc`
- Verify the grammar built successfully: `hx --grammar build`
- Check Helix logs: `hx --health gabc`

### Queries not loading

The queries directory structure should be:
```
tree-sitter-gregorio/
├── queries/
│   └── highlights.scm
├── src/
│   ├── parser.c
│   └── ...
└── grammar.js
```

## Additional Configuration

### Custom Theme Colors

You can customize the colors for GABC elements by editing your Helix theme. Common scopes used:

- `@attribute` - Header names (name:, mode:, etc.)
- `@constant` - Pitches and NABC glyphs
- `@keyword` - Clefs and control elements
- `@punctuation.special` - Bars and section separator
- `@operator` - Alterations
- `@markup.bold` - Bold text
- `@markup.italic` - Italic text
- `@markup.underline` - Underlined text
- `@markup.heading` - Small caps text
- `@markup.raw` - Teletype/monospace text
- `@markup.link` - Colored text
- `@string.special` - Verbatim and special syllable elements
- `@comment` - Comments

Note: Plain syllable text has no highlight scope and appears as default text color.

### File Association

To ensure `.gabc` files are always opened with the correct grammar, the configuration above includes:

```toml
file-types = ["gabc"]
```

This automatically applies the grammar to any file with the `.gabc` extension.

## Version Information

- Grammar version: 0.3.0
- Helix compatibility: 23.10+
- Tree-sitter ABI: 15
- Tests: 231 passing (100%)

## References

- [Helix Documentation](https://docs.helix-editor.com/)
- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)
- [GABC Syntax Specification](GABC_SYNTAX_SPECIFICATION.md)
- [NABC Syntax Specification](NABC_SYNTAX_SPECIFICATION.md)

## Support

For issues with the grammar itself, please open an issue on the [tree-sitter-gregorio repository](https://github.com/AISCGre-BR/tree-sitter-gregorio).

For Helix-specific issues, consult the [Helix documentation](https://docs.helix-editor.com/) or [Helix discussions](https://github.com/helix-editor/helix/discussions).
