# tree-sitter-gregorio

Tree-sitter grammar for GABC+NABC notation (Gregorian chant).

[![Tests](https://img.shields.io/badge/tests-226%20passing-brightgreen)](test/corpus/)
[![Grammar](https://img.shields.io/badge/grammar-GABC%2BNABC%20complete-blue)](#features)
[![Compatibility](https://img.shields.io/badge/gregorio-6.1.0-blue)](https://gregorio-project.github.io/)

## Overview

This project provides a [tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for parsing GABC (Gregorio ABC) files with NABC (Cardine-Based Adiastematic Notation) extensions. GABC is a text-based notation system for Gregorian chant, and NABC extends it with support for adiastematic neumes.

**Current Status**: ✅ **Complete GABC+NABC support** - The parser has been fully reviewed and tested for core GABC notation and comprehensive NABC (adiastematic notation) support including all glyph descriptors, modifiers, spacing, and significant letters.

**Target Compatibility**: [Gregorio 6.1.0](https://gregorio-project.github.io/) — This parser targets full compatibility with the GABC+NABC specification from Gregorio version 6.1.0. This compatibility target will be maintained for the future 1.0.0 release.

## Features

### ✅ Complete GABC+NABC Support (221 tests passing)

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
  - **Clefs**: C-clefs (c1-c4), F-clefs (f1-f4), with flat variant for C-clef only (cb1-cb4)
  - **Clef changes**: Single and multiple clef links (`::`)
  - **Bars**: Virgula, divisio minima/minor/maior/finalis, Dominican bars
  - **Line breaks**: Justified (`z`), ragged (`Z`), with custos modifiers (`+`, `-`)
  - **Custos**: Auto-pitch (`z0`), manual pitch with `+`
  - **Spacing**: Small (`/`), medium (`//`), half-space (`/[`)
  - **Alterations**: Natural (`x`), flat (`y`), sharp (`#`)
  - **Attributes**: `[nocustos]`, shape, choral signs, braces, slurs, episema tuning
  - **Extra symbols**: Asterisk, cross variants, R/, V/, A/

- **NABC Support** (complete):
  - **31 basic glyph descriptors** (St. Gall and Laon styles: vi, pu, ta, cl, pe, etc.)
  - **6 glyph modifier types** with variant support (S, G, M, -, >, ~)
  - **Pitch descriptors** (ha, hf, hn for all pitch letters a-n)
  - **Glyph fusion** with binary operator support
  - **9 subpunctis/prepunctis modifiers** (tractulus, gravis, stropha, etc.)
  - **4 spacing types** (larger/inter-element, left/right)
  - **82 significant letter codes**:
    - 45 St. Gall shorthands (altius, celeriter, tenere, etc.)
    - 22 Laon shorthands (augete, humiliter, etc.)
    - 15 Tironian note shorthands (iusum, deorsum, sursum, etc.)
  - **Alternation with GABC** using `|` separator

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
- **31 glyph descriptors**: Complete St. Gall and Laon repertoire
- **6 glyph modifier types**: S, G, M, -, >, ~ with variant numbers
- **Pitch descriptors**: ha, hf, hn for all pitch letters (a-n)
- **Glyph fusion**: Binary operator for connecting glyphs
- **9 subpunctis/prepunctis modifiers**: Tractulus, gravis, stropha, etc.
- **4 spacing types**: Larger/inter-element space, left/right positioning
- **82 significant letters**: Unified St. Gall (45) + Laon (22) + Tironian (15)

## Test Coverage

The parser is validated with **221 comprehensive tests** covering:

### Core Tests (21 test files)
#### GABC Tests (12 files, 139 tests)
1. **00-basics.txt** (4 tests): Basic structure, headers, multiline headers
2. **01-lyrics-notation.txt** (6 tests): Style tags, syllable controls, nested tags, verbatim
3. **02-gabc-neumes.txt** (12 tests): All neume types and modifiers
4. **03-gabc-alterations.txt** (10 tests): Natural, flat, sharp with variations
5. **04-gabc-complex-neumes.txt** (6 tests): Pitched complex neumes
6. **05-gabc-neume-fusions.txt** (13 tests): Simple and multiple fusions
7. **06-gabc-spacing.txt** (12 tests): All spacing types
8. **07-gabc-extra-symbols.txt** (23 tests): Asterisk, cross, R/, V/, A/, mora, ictus, episema
9. **08-gabc-separation-bars.txt** (16 tests): All bar types with modifiers
10. **09-gabc-clefs.txt** (21 tests): All clef types and links
11. **10-gabc-custos.txt** (3 tests): Auto-pitch and manual custos
12. **11-gabc-attributes.txt** (7 tests): All attribute types
13. **12-gabc-line-breaks.txt** (5 tests): Line breaks with modifiers

#### NABC Tests (8 files, 82 tests)
14. **13-nabc-basic-glyph-descriptors.txt** (3 tests): Basic glyphs and alternation
15. **14-nabc-glyph-modifiers.txt** (10 tests): All modifier types with variants
16. **15-nabc-pitch-descriptors.txt** (5 tests): Pitch descriptors for all letters
17. **16-nabc-glyph-descriptors.txt** (7 tests): Complex glyph descriptors
18. **17-nabc-glyph-fusion.txt** (18 tests): Binary glyph fusion
19. **18-nabc-subpunctis-prepunctis-descriptors.txt** (15 tests): All subpunctis/prepunctis modifiers
20. **19-nabc-spacing.txt** (11 tests): All NABC spacing types
21. **20-nabc-significant-letters.txt** (14 tests): St. Gall, Laon, and Tironian letters

### Test Statistics
- Total tests: **221**
- Pass rate: **100%**
- Coverage: **Complete GABC+NABC notation**
- GABC tests: 139 (63%)
- NABC tests: 82 (37%)

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

