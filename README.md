# tree-sitter-gregorio

Tree-sitter grammar for GABC+NABC notation (Gregorian chant).

[![Tests](https://img.shields.io/badge/tests-138%20passing-brightgreen)](test/corpus/)
[![Grammar](https://img.shields.io/badge/grammar-GABC%20basic%20support-blue)](#features)

## Overview

This project provides a [tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for parsing GABC (Gregorio ABC) files with NABC (Cardine-Based Adiastematic Notation) extensions. GABC is a text-based notation system for Gregorian chant, and NABC extends it with support for adiastematic neumes.

**Current Status**: ✅ **Complete basic GABC support** - The parser has been fully reviewed and tested for core GABC notation including headers, lyrics, notes, neumes, clefs, bars, spacing, and all basic musical elements.

## Features

### ✅ Complete GABC Basic Support (138 tests passing)

- **Header Section**:
  - Single-line headers (`name: value;`)
  - Multi-line headers (`commentary: text...;;`)
  - All standard header fields
  - Comment support (`%`)

- **Lyrics and Text**:
  - Syllable text with punctuation
  - Style tags: `<b>`, `<i>`, `<c>`, `<sc>`, `<tt>`, `<ul>`
  - Nested tags support
  - Syllable controls: `<e>`, `<eu>`, `<nlba>`, `<pr>`, `<clear>`
  - Special tags: `<alt>`, `<sp>`, `<v>` (verbatim)
  - Translation text `[...]`
  - Lyric centering `{...}`
  - Escape sequences `$`

- **Musical Notation (GABC)**:
  - **Notes and Neumes**:
    - Simple notes with pitch (a-n, A-N)
    - Pitched neumes (clivis, pes, torculus, porrectus, etc.)
    - Special neumes (oriscus, quilisma, stropha, virga, etc.)
    - Liquescent variants
    - Neume modifiers (episema, ictus, dot, etc.)
    - Neume fusion with `@`
  - **Clefs**: C-clefs (c1-c4), F-clefs (f1-f4), with flat variants (cb1-cb4, fb1-fb4)
  - **Clef changes**: Single and multiple clef links (`::`)
  - **Bars**: Virgula, divisio minima/minor/maior/finalis, Dominican bars
  - **Line breaks**: Justified (`z`), ragged (`Z`), with custos modifiers (`+`, `-`)
  - **Custos**: Auto-pitch (`z0`), manual pitch with `+`
  - **Spacing**: Small (`/`), medium (`//`), half-space (`/[`)
  - **Alterations**: Natural (`x`), flat (`y`), sharp (`#`)
  - **Attributes**: `[nocustos]`, shape, choral signs, braces, slurs, episema tuning
  - **Extra symbols**: Asterisk, cross variants, R/, V/, A/

- **NABC Support** (partial):
  - Basic glyph descriptors (St. Gall and Laon styles)
  - Glyph modifiers and pitch descriptors
  - Subpunctis and prepunctis descriptors
  - Significant letter descriptors
  - Alternation with GABC (`|` separator)

## Installation

```bash
npm install
```

## Building

```bash
npm run generate
npm run build
```

## Testing

```bash
npm test
```

## Grammar Structure

The grammar recognizes the following main structures:

### Header Section
- Headers with `name: value;` syntax
- Multiline headers ending with `;;`
- Special headers: `name`, `mode`, `nabc-lines`, etc.

### Notation Section
- Syllables with text and note groups
- GABC snippets: notes, clefs, bars, spacing, etc.
- NABC snippets: complex neume descriptors
- Mixed GABC|NABC patterns

### GABC Elements
- Notes with pitches and modifiers
- Complex neumes (clivis, pes, torculus, etc.)
- Bars and clefs
- Line breaks and spacing
- Style tags and special elements

### NABC Elements
- Basic glyph descriptors (vi, pu, ta, cl, etc.)
- Glyph modifiers (S, G, M, -, >, ~)
- Subpunctis/prepunctis (su/pp with modifiers)
- Significant letters (ls/lt codes with positions)

## Test Coverage

The parser is validated with **138 comprehensive tests** covering:

### Core Tests (14 test files)
1. **00-basic-no-notes.txt** (4 tests): Basic structure, headers, multiline headers
2. **01-lyrics-notation.txt** (6 tests): Style tags, syllable controls, nested tags, verbatim
3. **02-gabc-neumes.txt** (19 tests): All neume types and modifiers
4. **03-gabc-alterations.txt** (3 tests): Natural, flat, sharp
5. **04-gabc-complex-neumes.txt** (22 tests): Pitched complex neumes
6. **05-gabc-neume-fusions.txt** (3 tests): Simple and multiple fusions
7. **06-gabc-spacing.txt** (9 tests): All spacing types
8. **07-gabc-extra-symbols.txt** (8 tests): Asterisk, cross, R/, V/, A/
9. **08-gabc-separation-bars.txt** (9 tests): All bar types with modifiers
10. **09-gabc-clefs.txt** (22 tests): All clef types and links
11. **10-gabc-custos.txt** (3 tests): Auto-pitch and manual custos
12. **11-gabc-line-breaks.txt** (5 tests): Line breaks with modifiers
13. **13-gabc-attributes.txt** (7 tests): All attribute types
14. **14-multiline-header.txt** (18 tests): NABC alternation patterns

### Test Statistics
- Total tests: **138**
- Pass rate: **100%**
- Coverage: Basic GABC notation fully covered

## References

This grammar is based on:
- [GABC Syntax Specification](docs/GABC_SYNTAX_SPECIFICATION.md)
- [NABC Syntax Specification](docs/NABC_SYNTAX_SPECIFICATION.md)
- [Gregorio Compiler Errors and Warnings](docs/GREGORIO_COMPILER_ERRORS_AND_WARNINGS.md)

Project Documentation:
- [Project Status](STATUS.md) - Complete status summary and metrics
- [Changelog](CHANGELOG.md) - Version history and changes
- [Development Milestones](MILESTONES.md) - Roadmap and achievements
- [Project Structure](docs/PROJECT_STRUCTURE.md) - Architecture overview

Official Gregorio documentation:
- [Gregorio project website](http://gregorio-project.github.io/)
- [GitHub repository](http://github.com/gregorio-project/gregorio)

## License

MIT

