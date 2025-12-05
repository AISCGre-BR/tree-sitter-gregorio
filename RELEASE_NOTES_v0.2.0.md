# Release Notes - Version 0.2.0

**Release Date**: December 4, 2024  
**Status**: ✅ Production Ready for Basic GABC

---

## 🎉 Major Milestone Achieved

We are proud to announce **Version 0.2.0** of tree-sitter-gregorio, marking the completion of **comprehensive basic GABC notation support**. This release represents a fully reviewed and tested parser capable of handling real-world Gregorian chant notation files.

## 📊 Key Metrics

- **138 tests passing** (100% success rate)
- **14 test files** covering all basic GABC features
- **~1,068 lines** of grammar code
- **Zero known bugs** in basic GABC parsing

## ✨ What's New

### Semantic Aliases Throughout
The parser now uses meaningful names instead of anonymous tokens:

- **Pitches**: `pitch_lowercase` and `pitch_uppercase`
- **Clefs**: `c_clef`, `f_clef`, with position tracking
- **Line breaks**: `justified_line_break`, `ragged_line_break`
- **Custos**: `custos_auto_pitch`, `custos_symbol`
- **Bars**: `virgula`, `divisio_minima`, `divisio_maior`, etc.

### Complete Feature Set

#### ✅ Headers
- Single-line and multi-line headers
- All standard GABC header fields
- Full comment support

#### ✅ Lyrics & Text
- All 6 style tags (`<b>`, `<i>`, `<c>`, `<sc>`, `<tt>`, `<ul>`)
- Nested tags (e.g., `<b><i>text</i></b>`)
- 5 syllable control types
- Translation text and lyric centering
- Verbatim mode for special characters

#### ✅ Musical Notation
- **19 note variations** (punctum, quilisma, oriscus, virga, etc.)
- **22 pitched neume types** (clivis, pes, torculus, porrectus, etc.)
- **Complete clef system**: All C-clefs (c1-c4), F-clefs (f1-f4), with flat variants for C-clefs (cb1-cb4)
- **Clef changes**: Single and multiple consecutive clef links
- **9 bar types**: From simple virgula to complex Dominican bars
- **Line breaks**: Justified/ragged with custos modifiers
- **Custos system**: Auto-pitch and manual positioning
- **Spacing controls**: Small, medium, half-space
- **Alterations**: Natural, flat, sharp
- **Attributes**: Shape, choral signs, braces, slurs, episema tuning

## 🐛 Major Fixes

### Pitch/Clef Ambiguity Resolved
Previously, single notes `(c)` and `(f)` were incorrectly recognized as clefs. Now fixed with token-based clef implementation using complete strings (`c1`, `c2`, etc.) with high precedence.

### Spacing Recognition Fixed
The parser now correctly recognizes whitespace in GABC notation, allowing proper spacing between elements.

### Punctuation Support
All punctuation marks (`,`, `.`, `;`, `:`) are now properly supported in syllable text.

## 📚 Documentation Updates

All documentation has been updated to reflect the current state:

- **[README.md](README.md)**: Complete feature list with badges
- **[STATUS.md](STATUS.md)**: Detailed status summary and metrics
- **[CHANGELOG.md](CHANGELOG.md)**: Complete version history
- **[MILESTONES.md](MILESTONES.md)**: Achievement tracking and roadmap
- **Test corpus**: 14 well-documented test files with examples

## 🚀 Usage

### Installation
```bash
npm install tree-sitter-gregorio
```

### Building
```bash
npm run generate
npm run build
```

### Testing
```bash
npm test  # All 138 tests should pass
```

### Example
```javascript
const Parser = require('tree-sitter');
const Gregorio = require('tree-sitter-gregorio');

const parser = new Parser();
parser.setLanguage(Gregorio);

const sourceCode = `
name: Example chant;
%%
Al(c)le(d)lú(e)ia.(f)
`;

const tree = parser.parse(sourceCode);
console.log(tree.rootNode.toString());
```

## 🔄 Breaking Changes

If upgrading from v0.1.0, note these changes:

1. **Pitch nodes renamed**:
   - `pitch` → `pitch_lowercase`
   - `pitch_upper` → `pitch_uppercase`

2. **Clef structure changed**:
   - Now uses complete tokens with consistent structure
   - All clefs have `name` and `position` fields

3. **Line breaks restructured**:
   - Now have `type` field (justified/ragged)
   - Optional `custos_modifier` field

4. **Custos reorganized**:
   - `z0` now has semantic alias `custos_auto_pitch`
   - Manual custos uses structured fields

## 🎯 What's Next

### Version 0.3.0 - Extended NABC Support (Planned Q1 2025)
- Complete NABC glyph descriptor support
- Tironian notes implementation
- Advanced NABC modifiers
- NABC-specific attributes

### Version 0.4.0 - Advanced Features (Planned Q2 2025)
- Performance optimizations
- Error recovery improvements
- Advanced attribute combinations

## 🙏 Acknowledgments

This parser is based on the excellent work of the [Gregorio Project](http://gregorio-project.github.io/), which provides comprehensive tools for Gregorian chant notation.

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details.

---

**Full Changelog**: [CHANGELOG.md](CHANGELOG.md)  
**Project Status**: [STATUS.md](STATUS.md)  
**Milestones**: [MILESTONES.md](MILESTONES.md)
