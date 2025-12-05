# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2024-12-05

### 🎉 Major Milestone: Complete NABC Support & Grammar Refactoring

This release marks the completion of comprehensive NABC (adiastematic notation) support and significant grammar improvements through anonymization and enhanced fields.

### Added

#### Complete NABC Implementation (82 tests)
- **31 basic glyph descriptors**: Full St. Gall and Laon repertoire (vi, pu, ta, cl, pe, to, po, etc.)
- **6 glyph modifier types**: S (mark), G (grouping), M (melodic), - (episema), > (augmentive), ~ (diminutive)
  - Variant support with numbers (S2, G3, etc.)
  - Multiple modifiers per glyph
- **Pitch descriptors**: ha, hf, hn for all pitch letters (a-n)
- **Glyph fusion**: Binary operator for connecting glyphs with full modifier support
- **9 subpunctis/prepunctis modifiers**: 
  - Tractulus (t), Tractulus episema (te), Tractulus double episema (tee)
  - Gravis (g), Gravis episema (ge)
  - Liquescens stropha cephalicus (ls)
  - Laon-specific: Uncinus (u), Quilisma (q), Virga (v)
- **4 spacing types**: Larger space (//), Inter-element space (/), with left/right variants
- **82 significant letter codes** with semantic aliases:
  - **45 St. Gall shorthands**: altius, celeriter, tenere, equaliter, levare, etc.
  - **22 Laon shorthands**: augete, humiliter, mediocriter, levate, etc.
  - **15 Tironian note shorthands**: iusum, deorsum, sursum, etc.
  - Position tracking with field support

#### Grammar Refactoring
- **16 rules anonymized** for cleaner AST:
  - Text content rules: syllable_verbatim_text, syllable_translation_text, syllable_centering_text
  - Attribute values: choral_sign_text, nabc_choral_sign_code, above_lines_text, verbatim_tex_code
  - Numeric values: syllable_control_protrusion_value, dominican_bar_position, scale_factor
  - Helper rules: shape_hint, brace_size
  - Header terminators: single_line_header_value_terminated, multiline_header_value_terminated
- **Enhanced field structure**:
  - Added `field('content', $.syllable)` to 11 syllable tags
  - Added `field('terminator', choice(';', ';;'))` to headers
  - Moved dominican_bar_position to field for consistency
  - Removed unnecessary `field('single')` from snippet_list
- **Grammar size reduced**: 1163 → 1121 lines (-42 lines, -3.6%)

#### Test Coverage Expansion
- **221 comprehensive tests** (+83 from v0.2.0)
- **21 test files** (+7 NABC-specific files)
- **8 new NABC test files**:
  - 14-nabc-glyph-modifiers.txt (10 tests)
  - 16-nabc-glyph-descriptors.txt (7 tests)
  - 17-nabc-glyph-fusion.txt (18 tests)
  - 18-nabc-subpunctis-prepunctis-descriptors.txt (15 tests)
  - 19-nabc-spacing.txt (11 tests)
  - 20-nabc-significant-letters.txt (14 tests)
  - Plus updates to existing NABC files

### Changed

#### Significant Letters Refactoring
- **Unified St. Gall and Laon rules**: Merged separate implementations into single anonymous rule with `significant_letter` alias
- **Separated Tironian letters**: Kept as distinct `tironian_letter` type
- **Made sequence anonymous**: Integrated `nabc_significant_letter_sequence` directly into parent rule
- **Consistent fields**: type, shorthand, position across all variants

#### NABC Structure Improvements
- Complex glyph descriptor now includes all components in single rule
- Consistent field naming across all NABC elements
- Improved semantic clarity with comprehensive aliases

### Fixed
- **NABC spacing disambiguation**: Added `ta` prefix to avoid GABC/NABC ambiguity where `//` could be misinterpreted
- **Significant letter parsing**: Fixed ERROR nodes in complex patterns by forcing NABC context
- **Test consistency**: Updated 146 tests to reflect cleaner AST structure

### Technical Details
- Grammar size: 1121 lines (from 1163)
- Test count: 221 (from 138)
- Test files: 21 (from 14)
- Pass rate: 100%
- Net code reduction: 528 lines across test files

### Breaking Changes
- Anonymous rules no longer appear as nodes in AST
- Header structure changed with new `terminator` field
- snippet_list no longer has `single` field for non-alternating cases
- NABC significant letters unified under `significant_letter` alias (was separate st_gall/laon)

## [0.2.0] - 2024-12-04

### 🎉 Major Milestone: Complete Basic GABC Support

This release marks the completion of comprehensive basic GABC notation support with full test coverage.

### Added

#### Grammar Improvements
- **Semantic Aliases**: Introduced meaningful aliases for literal tokens to improve AST readability
  - Pitch rules: `pitch_lowercase` and `pitch_uppercase` (replacing generic `pitch`)
  - Clef types: `c_clef`, `f_clef`, `c_clef_flat`, `f_clef_flat` with position indicators
  - Line breaks: `justified_line_break`, `ragged_line_break`, `force_custos`, `disable_custos`
  - Custos: `custos_auto_pitch`, `custos_symbol`
  - Bar types: `virgula`, `divisio_minima`, `divisio_minor`, `divisio_maior`, `divisio_finalis`, etc.

#### Clef System Refactoring
- Token-based clef implementation with complete strings (`c1`, `c2`, `c3`, `c4`, `f1-f4`, `cb1-cb4`)
- High precedence (20) to avoid ambiguity with pitch recognition
- Proper clef position tracking with empty string aliases
- Full clef link support with multiple consecutive links

#### Custos Improvements
- Auto-pitch custos (`z0`) with semantic alias
- Manual custos with pitch and symbol fields
- Moved `[nocustos]` to attribute system for consistency
- Clear separation between custos types

#### Line Breaks Enhancement
- Structured line breaks with `type` field (justified/ragged)
- Optional `custos_modifier` field (force/disable)
- Support for all combinations: `z`, `Z`, `z+`, `z-`, `Z+`, `Z-`

#### Test Coverage Expansion
- **138 comprehensive tests** across 14 test files
- New test categories:
  - Multiline headers validation
  - Nested tags testing
  - Verbatim special characters (validates `<v>(</v>` vs `(` differentiation)
  - Line breaks with all modifier combinations
  - Custos variations
  - All clef types and links

### Fixed
- **Pitch/Clef Ambiguity**: Resolved critical bug where single notes `(c)` and `(f)` were not recognized due to conflict with clef prefixes
- **Spacing Recognition**: Fixed issue where `token()` wrapper prevented whitespace recognition in pitch rules
- **Punctuation Support**: Ensured all punctuation marks (`,`, `.`, `;`, `:`) are correctly allowed in `syllable_text`

### Changed
- Grammar structure improved with field-based organization for better AST navigation
- Test files reorganized with descriptive names and comprehensive coverage
- Documentation updated to reflect complete basic GABC support

### Technical Details
- Grammar size: ~1068 lines
- Test count: 138 (100% pass rate)
- Test files: 14
- Supported features:
  - ✅ Headers (single and multi-line)
  - ✅ Lyrics with all style tags and controls
  - ✅ All GABC neume types and modifiers
  - ✅ Complete clef system with links
  - ✅ All bar types with modifiers
  - ✅ Spacing and line breaks
  - ✅ Custos system
  - ✅ Attributes and special elements
  - ✅ NABC alternation patterns (basic)

## [0.1.0] - Initial Release

### Added
- Initial tree-sitter grammar for GABC+NABC notation
- Basic header section support
- Core GABC notation elements
- Initial NABC support
- Basic test coverage

---

[0.3.0]: https://github.com/AISCGre-BR/tree-sitter-gregorio/releases/tag/v0.3.0
[0.2.0]: https://github.com/AISCGre-BR/tree-sitter-gregorio/releases/tag/v0.2.0
[0.1.0]: https://github.com/AISCGre-BR/tree-sitter-gregorio/releases/tag/v0.1.0
