# tree-sitter-gregorio

Tree-sitter grammar for GABC+NABC notation (Gregorian chant).

## Overview

This project provides a [tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for parsing GABC (Gregorio ABC) files with NABC (Cardine-Based Adiastematic Notation) extensions. GABC is a text-based notation system for Gregorian chant, and NABC extends it with support for adiastematic neumes.

## Features

- Full support for GABC syntax:
  - Header section with metadata
  - Notation section with notes, neumes, and musical elements
  - Style tags, syllable controls, and special elements
  - Bars, clefs, line breaks, and spacing
  - Translation text and lyric centering
  
- Full support for NABC syntax:
  - Complex neume descriptors
  - Basic glyph descriptors (St. Gall and Laon styles)
  - Glyph modifiers and pitch descriptors
  - Subpunctis and prepunctis descriptors
  - Significant letter descriptors
  - Tironian notes (Laon)

- Syntax validation:
  - Detects common syntax errors
  - Validates header structure
  - Checks note and neume syntax
  - Validates NABC code combinations

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

## Test Files

The `test/corpus/` directory contains test files covering:

- **Valid syntax**: Basic examples, complex neumes, NABC codes, style tags, etc.
- **Error cases**: Missing headers, invalid syntax, unclosed tags, etc.
- **Warning cases**: Multiple header definitions, etc.

## References

This grammar is based on:
- [GABC Syntax Specification](docs/GABC_SYNTAX_SPECIFICATION.md)
- [NABC Syntax Specification](docs/NABC_SYNTAX_SPECIFICATION.md)
- [Gregorio Compiler Errors and Warnings](docs/GREGORIO_COMPILER_ERRORS_AND_WARNINGS.md)

See also:
- [Project Structure](docs/PROJECT_STRUCTURE.md) - Detailed project structure overview

Official Gregorio documentation:
- [Gregorio project website](http://gregorio-project.github.io/)
- [GitHub repository](http://github.com/gregorio-project/gregorio)

## License

MIT

