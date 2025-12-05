# Tree-sitter Queries for GABC+NABC

This directory contains query files for Tree-sitter features like syntax highlighting and code navigation.

## Files

### `highlights.scm`

Syntax highlighting queries for GABC (Gregorio ABC) and NABC (Cardine-Based Adiastematic Notation) files.

#### Supported Highlighting Categories

**Comments:**
- `@comment` - Comments starting with `%`

**Headers:**
- `@property` - Header names (name, mode, etc.)
- `@string` - Header values
- `@punctuation.delimiter` - Terminators (`;`, `;;`)

**GABC Notation:**
- `@constant.builtin` - Pitch letters (a-n lowercase)
- `@constant.builtin.italic` - Pitch letters (A-N uppercase)
- `@keyword.directive` - Clefs (c1-c4, f1-f4, cb, fb)
- `@number` - Clef positions
- `@punctuation.special` - Bars (virgula, divisio, etc.)
- `@keyword.control` - Line breaks (z, Z)
- `@operator` - Alterations (natural, flat, sharp)
- `@attribute` - Neume modifiers (episema, ictus, mora)

**NABC Notation:**
- `@constant.builtin` - Glyph descriptors (vi, pu, ta, cl, pe, etc.)
- `@attribute` - Glyph modifiers (S, G, M, -, >, ~)
- `@operator` - Pitch descriptors (ha, hf, hn)
- `@keyword.modifier` - Significant letters (altius, celeriter, etc.)
- `@punctuation.delimiter` - NABC spacing (/, //, `, ``)

**Lyrics:**
- `@string` - Syllable text
- `@string.special` - Translation `[...]` and centering `{...}`
- `@string.escape` - Escape sequences
- `@tag` - Style tags (`<b>`, `<i>`, etc.)
- `@keyword.directive` - Control tags (elision, euouae, etc.)

**Operators:**
- `@operator` - Fusion operators (`@` for GABC, `&` for NABC)

## Usage

### In Neovim

Tree-sitter queries are automatically used by Neovim's built-in Tree-sitter integration:

```lua
-- In your Neovim config
require('nvim-treesitter.configs').setup {
  highlight = {
    enable = true,
  },
}
```

### In VSCode

For VSCode integration, you'll need a TextMate grammar that uses these Tree-sitter queries. A VSCode extension can be built on top of this parser.

### Testing Highlights

You can test the highlighting queries using the Tree-sitter CLI:

```bash
tree-sitter highlight test_file.gabc
```

## Color Scheme Mapping

Different editors will map these highlight groups to colors based on their theme. Common mappings:

| Highlight Group | Common Color | Used For |
|----------------|--------------|----------|
| `@comment` | Gray/Muted | Comments |
| `@keyword` | Purple/Magenta | Clefs, controls |
| `@constant` | Blue/Cyan | Pitches, glyphs |
| `@string` | Green | Text, lyrics |
| `@operator` | Red/Orange | Alterations, fusion |
| `@attribute` | Yellow | Modifiers, attributes |
| `@punctuation` | White/Gray | Delimiters, bars |
| `@tag` | Pink | Style tags |

## Examples

### GABC Example
```gabc
name: Kyrie;
mode: 1;
%%
(c4) KY(f)ri(gf)e(f.) *() e(f)lé(gh)i(h)son.(f.) (::)
```

### NABC Example
```gabc
name: Alleluia;
nabc-lines: 1;
%%
Al(c|vi)le(d|pu)lu(f|ta-lsal3)ia.(f.|ta) (::)
```

## Extending the Queries

To add more highlighting rules:

1. Identify the node type in the grammar (check `grammar.js`)
2. Add a capture in `highlights.scm`:
   ```scheme
   (node_name) @highlight.group
   ```
3. Test with `tree-sitter test` to ensure it works

## Contributing

When adding new grammar rules, please update the corresponding highlight queries to ensure good syntax highlighting coverage.

## Reference

- [Tree-sitter Query Syntax](https://tree-sitter.github.io/tree-sitter/using-parsers#pattern-matching-with-queries)
- [Neovim Highlight Groups](https://neovim.io/doc/user/treesitter.html#treesitter-highlight)
- [Standard Capture Names](https://github.com/nvim-treesitter/nvim-treesitter/blob/master/CONTRIBUTING.md#highlights)
