# tree-sitter-gregorio

Tree-sitter grammar for GABC/NABC (Gregorian Chant notation) used by the [Gregorio project](https://gregorio-project.github.io/).

## Features

- ✅ Complete GABC format support (headers + score sections)
- ✅ **Stateful GABC/NABC alternation** tracking
- ✅ All GABC elements: pitches, modifiers, bars, custos, line breaks
- ✅ Markup tags with support for LaTeX embedding
- ✅ Specialized attributes (choral signs, braces, slurs, etc.)
- ✅ Macro expansion support
- ✅ Proper comment handling
- 🚧 Full NABC (St. Gall neumes) grammar (in progress)

## Why Tree-sitter?

Traditional regex-based syntax highlighting (Vim, VS Code TextMate) cannot handle **stateful alternation** in GABC patterns like `(gabc1|nabc1|gabc2|nabc2|...)` where odd positions are GABC and even positions are NABC. Tree-sitter provides a full parser with state management, enabling accurate parsing of complex patterns.

See [Research: Vim Syntax Limitations](docs/VIM_SYNTAX_LIMITATIONS.md) for detailed analysis.

## Installation

### Prerequisites

- Node.js (v14+)
- C/C++ compiler (gcc, clang, or MSVC)
- tree-sitter CLI

```bash
npm install -g tree-sitter-cli
```

### Building

```bash
# Clone repository
git clone https://github.com/AISCGre-BR/tree-sitter-gregorio.git
cd tree-sitter-gregorio

# Install dependencies
npm install

# Generate parser
npm run generate

# Run tests
npm test
```

## Usage

### Neovim (nvim-treesitter)

Add to your nvim-treesitter configuration:

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.gregorio = {
  install_info = {
    url = "https://github.com/AISCGre-BR/tree-sitter-gregorio",
    files = {"src/parser.c"},
    branch = "main",
  },
  filetype = "gabc",
}

require('nvim-treesitter.configs').setup {
  highlight = {
    enable = true,
    additional_vim_regex_highlighting = false,
  },
}
```

Install with `:TSInstall gregorio`

### Helix Editor

Add to `~/.config/helix/languages.toml`:

```toml
[[language]]
name = "gregorio"
scope = "source.gabc"
file-types = ["gabc"]
roots = []

[[grammar]]
name = "gregorio"
source = { git = "https://github.com/AISCGre-BR/tree-sitter-gregorio", rev = "main" }
```

### Emacs (tree-sitter-mode)

```elisp
(add-to-list 'tree-sitter-languages
  '(gregorio . ("https://github.com/AISCGre-BR/tree-sitter-gregorio")))
```

## GABC Format Overview

GABC files have two sections separated by `%%`:

```gabc
name: Kyrie XVII;
mode: 6;
%%
KY(f)ri(f)e(dc~) *() e(f)lé(hg)i(fe)son.(e.) <i>bis</i>(::)
```

### Structure

1. **Headers**: Key-value pairs (`name: value;`)
2. **Separator**: Exactly `%%` on its own line
3. **Score**: Syllables with notation `text(notes)`

### Musical Notation

Pattern: `(gabc1|nabc1|gabc2|nabc2|...)`
- Odd positions: GABC (standard notation)
- Even positions: NABC (St. Gall neumes)

Example:
```gabc
(e|````vi-lse4|fgFE|pehhsu2)
```
- `e` - GABC
- ````vi-lse4` - NABC
- `fgFE` - GABC
- `pehhsu2` - NABC

## Grammar Development

### Current Status

- ✅ Phase 1: Basic structure (headers, separator, score)
- ✅ Phase 2: GABC elements (pitches, modifiers, bars)
- ✅ Phase 3: Markup tags and attributes
- 🚧 Phase 4: Complete NABC grammar
- ⏳ Phase 5: Optimization and error recovery

### Running Tests

```bash
# Parse a single file
tree-sitter parse examples/kyrie.gabc

# Run test corpus
npm test

# Interactive playground
npm run playground
```

### Test Corpus Structure

```
test/
├── corpus/
│   ├── headers.txt          # Header parsing tests
│   ├── pitches.txt          # Pitch notation tests
│   ├── alternation.txt      # GABC/NABC alternation tests
│   └── ...
└── highlight/
    └── gabc.gabc            # Syntax highlighting tests
```

## Contributing

We welcome contributions! Areas needing work:

1. **NABC Grammar**: Complete St. Gall neume parsing
2. **Error Recovery**: Improve handling of malformed input
3. **Test Coverage**: Add more test cases
4. **Documentation**: Usage examples and tutorials
5. **Queries**: Highlight queries for different editors

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Related Projects

- [gregorio.nvim](https://github.com/AISCGre-BR/gregorio.nvim) - Neovim plugin with Vim syntax (fallback)
- [Gregorio](https://github.com/gregorio-project/gregorio) - Reference compiler
- [GABC Specification](https://gregorio-project.github.io/gabc/)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- **Gregorio Project**: Reference implementation and specification
- **Tree-sitter Community**: Parser generator and tooling
- Research into Vim syntax limitations led to this project

## References

- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)
- [GABC Tutorial](https://gregorio-project.github.io/gabc/index.html)
- [Gregorio Source (Parser)](https://github.com/gregorio-project/gregorio/blob/develop/src/gabc/gabc-score-determination.y)
- [NABC Codes Reference](https://gregorio-project.github.io/gabc/details.html#nabc)

---

**Status**: 🚧 Early Development  
**Version**: 0.1.0  
**Maintainer**: AISCGre-BR
