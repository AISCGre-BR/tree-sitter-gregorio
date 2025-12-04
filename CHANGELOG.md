# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Token-based clef implementation with complete strings (`c1`, `c2`, `c3`, `c4`, `f1-f4`, `cb1-cb4`, `fb1-fb4`)
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

[0.2.0]: https://github.com/AISCGre-BR/tree-sitter-gregorio/releases/tag/v0.2.0
[0.1.0]: https://github.com/AISCGre-BR/tree-sitter-gregorio/releases/tag/v0.1.0
