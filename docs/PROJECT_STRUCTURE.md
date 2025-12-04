# Project Structure

```
tree-sitter-gregorio/
├── grammar.js                          # Main grammar definition
├── package.json                        # Node.js package configuration
├── README.md                           # Main documentation
├── CONTRIBUTING.md                     # Contribution guidelines
├── example.js                          # Usage example
├── test_summary.md                     # Test files summary
├── .gitignore                          # Git ignore rules
├── .editorconfig                       # Editor configuration
├── .tree-sitter-config.json           # Tree-sitter configuration
│
├── bindings/
│   └── node/
│       ├── binding.gyp                 # Node.js binding configuration
│       └── index.js                    # Node.js binding entry point
│
├── test/
│   └── corpus/                         # Test files directory (14 files, 138 tests)
│       ├── 00-basic-no-notes.txt      # Basic structure and headers (4 tests)
│       ├── 01-lyrics-notation.txt     # Text, styles, and tags (6 tests)
│       ├── 02-gabc-neumes.txt         # All neume types (19 tests)
│       ├── 03-gabc-alterations.txt    # Accidentals (3 tests)
│       ├── 04-gabc-complex-neumes.txt # Pitched neumes (22 tests)
│       ├── 05-gabc-neume-fusions.txt  # Neume fusion (3 tests)
│       ├── 06-gabc-spacing.txt        # Spacing control (9 tests)
│       ├── 07-gabc-extra-symbols.txt  # Extra symbols (8 tests)
│       ├── 08-gabc-separation-bars.txt# All bar types (9 tests)
│       ├── 09-gabc-clefs.txt          # Clefs and links (22 tests)
│       ├── 10-gabc-custos.txt         # Custos (3 tests)
│       ├── 11-gabc-line-breaks.txt    # Line breaks (5 tests)
│       ├── 13-gabc-attributes.txt     # Attributes (7 tests)
│       └── 14-multiline-header.txt    # NABC alternation (18 tests)
│
└── docs/                               # Documentation directory
    ├── PROJECT_STRUCTURE.md            # This file
    ├── GABC_SYNTAX_SPECIFICATION.md    # GABC syntax reference
    ├── NABC_SYNTAX_SPECIFICATION.md    # NABC syntax reference
    └── GREGORIO_COMPILER_ERRORS_AND_WARNINGS.md  # Error/warning reference
```

## Key Files

### Grammar Definition
- **grammar.js**: Defines the complete grammar for GABC+NABC syntax using tree-sitter DSL

### Test Files
- **test/corpus/**: Contains 14 test files with 138 comprehensive tests covering:
  - Complete GABC basic notation (headers, lyrics, notes, neumes, clefs, bars, spacing)
  - Style tags and nested tags
  - Syllable controls and special elements
  - All neume types and modifiers
  - NABC alternation patterns
  - Edge cases and special characters

### Documentation
- **README.md**: Project overview and usage (root directory)
- **CONTRIBUTING.md**: Development guidelines (root directory)
- **docs/**: Documentation directory containing:
  - **PROJECT_STRUCTURE.md**: This file - project structure overview
  - **GABC_SYNTAX_SPECIFICATION.md**: Complete GABC syntax specification
  - **NABC_SYNTAX_SPECIFICATION.md**: Complete NABC syntax specification
  - **GREGORIO_COMPILER_ERRORS_AND_WARNINGS.md**: Compiler error and warning reference

## Development Status

### ✅ Completed
- **Basic GABC Support**: Fully implemented and tested (138 tests passing)
  - Headers (single and multi-line)
  - Lyrics with style tags and controls
  - All note and neume types
  - Clefs, bars, spacing, line breaks
  - Attributes and special elements
  - Semantic aliases for improved AST readability

### 🔄 In Progress
- NABC extended support
- Advanced attribute combinations
- Performance optimizations

### 📋 Future
- Language server protocol integration
- Syntax highlighting extensions
- Advanced error recovery

## Usage

1. Generate parser: `npm run generate`
2. Build bindings: `npm run build`
3. Run tests: `npm test` (all 138 tests should pass)
4. Use parser: See `example.js`

