# Tree-sitter Grammar Development Guide for GABC/NABC

**Project**: tree-sitter-gregorio  
**Target**: Tree-sitter parser for GABC (Gregorian Chant) notation  
**Language**: JavaScript (grammar.js)  
**Date**: October 16, 2024

---

## Table of Contents

1. [Overview](#overview)
2. [Development Philosophy](#development-philosophy)
3. [Grammar Structure](#grammar-structure)
4. [Implementation History](#implementation-history)
   - [Phase 1: Initial Setup](#phase-1-initial-setup)
   - [Phase 2: NABC Neume Codes](#phase-2-nabc-neume-codes)
5. [Parser Rules Reference](#parser-rules-reference)
6. [Testing Strategy](#testing-strategy)
7. [Comparison with Vim Syntax](#comparison-with-vim-syntax)
8. [Future Roadmap](#future-roadmap)

---

## Overview

This document chronicles the development of a Tree-sitter parser for GABC (Gregorian Chant) notation. Unlike regex-based syntax highlighting (Vim, TextMate), Tree-sitter provides:

- **Stateful parsing**: Can track context across tokens
- **Incremental parsing**: Only re-parses changed sections
- **Error recovery**: Continues parsing despite syntax errors
- **Complete AST**: Full Abstract Syntax Tree for analysis tools

### Why Tree-sitter for GABC?

The primary motivation is **stateful GABC/NABC alternation**. The pattern `(gabc1|nabc1|gabc2|nabc2|...)` requires counting pipe delimiters to determine context—impossible with regex, trivial with a parser.

See [TREE_SITTER_ROADMAP.md](TREE_SITTER_ROADMAP.md) for full rationale and [gregorio.nvim/docs/SYNTAX_DEVELOPMENT.md](https://github.com/AISCGre-BR/gregorio.nvim/blob/syntax-bootstrap/docs/SYNTAX_DEVELOPMENT.md#bug-2-desafio-da-alternância-gabcnabc) for Vim syntax limitations.

---

## Development Philosophy

### Incremental Implementation

The grammar is built incrementally, mirroring the feature set of the Vim syntax highlighter:

1. **Parse First, Optimize Later**: Get working parser before worrying about performance
2. **Test-Driven**: Each feature has corpus tests validating AST structure
3. **Parallel Development**: Sync with gregorio.nvim Vim syntax implementation
4. **Real-World Validation**: Test with actual GABC files from Gregorio project

### Grammar Design Principles

1. **Explicit over Implicit**: Prefer `token(choice('a', 'b', 'c'))` over `/[abc]/`
2. **Avoid Greedy Fallbacks**: Use specific patterns; fallbacks hide bugs
3. **Semantic Grouping**: Group related rules (e.g., all bars together)
4. **Clear Naming**: Rule names match GABC terminology where possible

---

## Grammar Structure

### Top-Level Organization

```javascript
module.exports = grammar({
  name: 'gregorio',
  
  extras: $ => [/\s/],  // Whitespace is implicit
  
  conflicts: $ => [
    [$.syllable],      // Syllable vs notation ambiguity
    [$.lyric_text]     // Text vs tag ambiguity
  ],
  
  rules: {
    source_file: $ => seq(
      optional($.headers),
      $.section_separator,
      optional($.score)
    ),
    // ... rest of rules
  }
});
```

### Rule Categories

| Category | Rules | Purpose |
|----------|-------|---------|
| **File Structure** | `source_file`, `headers`, `score` | Top-level document organization |
| **Headers** | `header_field`, `field_name`, `field_value` | Metadata parsing |
| **Separators** | `section_separator`, `comment` | Structural markers |
| **Score Elements** | `syllable`, `lyric_text`, `notation` | Musical content |
| **Lyric Content** | `text_content`, `markup_tag`, `lyric_centering`, `translation` | Text formatting |
| **Clefs** | `clef`, `clef_type` | Staff configuration |
| **Notation** | `notation`, `snippet_list`, `gabc_snippet`, `nabc_snippet` | Musical notation |
| **GABC Elements** | `pitch`, `accidental`, `modifier`, `bar`, `custos`, etc. | Standard notation components |
| **NABC Elements** | `nabc_neume`, `nabc_modifier` | St. Gall/Laon neumes |

---

## Implementation History

### Phase 1: Initial Setup

**Date**: October 16, 2024  
**Commit**: `3c73899` (initial structure)

**Implemented**:
- Basic file structure (headers → %% → score)
- Header field parsing (name:value;)
- Section separator (standalone %%)
- Comment handling (% lines)
- Clef notation ((c4), (f3), etc.)
- Lyric text with markup tags (<b>, <i>, etc.)
- Musical notation container ((...)
- GABC snippet with pitches, modifiers, bars
- Alternation structure (first=GABC, rest alternating)

**Key Decisions**:

1. **`section_separator: $ => '%%'`**: Simple string, not regex `/^%%$/`
   - Reason: Tree-sitter doesn't support line anchors (^, $) in rules
   - Solution: Rely on context (between headers and score)

2. **`comment: $ => token(seq('%', /.*/))`**: Token-based for speed
   - Reason: Comments are leaf nodes, don't need sub-parsing
   - Effect: Comments parsed as single tokens

3. **`syllable: $ => choice(...)`**: Explicit choices, not optional sequence
   - Reason: `seq(optional(A), optional(B))` can match empty string (error)
   - Solution: `choice(seq(A, optional(B)), B)` - always matches something

4. **`conflicts: [$.syllable, $.lyric_text]`**: Declared ambiguity
   - Reason: GLR parser can't decide: is `(` start of notation or part of text?
   - Solution: Conflict resolution lets parser use lookahead

**Example Parse Tree**:

```gabc
name: Test;
%%
Ky(f)ri(g)e
```

```
(source_file
  (headers
    (header_field
      name: (field_name)
      value: (field_value)))
  (section_separator)
  (score
    (syllable
      (lyric_text (text_content))
      (notation
        (snippet_list
          first: (gabc_snippet (pitch)))))
    (syllable
      (lyric_text (text_content))
      (notation
        (snippet_list
          first: (gabc_snippet (pitch)))))
    (syllable
      (lyric_text (text_content)))))
```

---

### Phase 2: NABC Neume Codes

**Date**: October 16, 2024  
**Commit**: `e37ee38`

**Problem**: NABC snippets had no internal structure—everything matched generic fallback pattern.

**Solution**: Define specific neume codes as tokens.

**Implementation**:

```javascript
nabc_snippet: $ => repeat1(
  choice(
    $.nabc_neume,
    $.nabc_modifier
  )
),

nabc_neume: $ => token(choice(
  'vi',  // virga
  'pu',  // punctum
  'ta',  // tractulus
  'gr',  // gravis
  'cl',  // clivis
  'pe',  // pes
  'po',  // porrectus
  'to',  // torculus
  'ci',  // climacus
  'sc',  // scandicus
  'pf',  // porrectus flexus
  'sf',  // scandicus flexus
  'tr',  // torculus resupinus
  'st',  // stropha (St. Gall)
  'ds',  // distropha
  'ts',  // tristropha
  'tg',  // trigonus
  'bv',  // bivirga
  'tv',  // trivirga
  'pq',  // pes quassus
  'pr',  // pressus maior
  'pi',  // pressus minor
  'vs',  // virga strata
  'or',  // oriscus
  'sa',  // scandicus
  'ql',  // quilisma (3 loops)
  'qi',  // quilisma (2 loops)
  'pt',  // pes stratus
  'ni',  // nihil
  'oc',  // oriscus-clivis (Laon)
  'un'   // uncinus (Laon)
)),

nabc_modifier: $ => /[0-9`'\-~.!\/]+/,
```

**Key Decisions**:

1. **`token(choice(...))` not regex**: Explicit codes, not pattern
   - Reason: Clearer, faster, catches typos
   - Alternative rejected: `/vi|pu|ta|.../` (too similar to Vim approach)

2. **Removed greedy fallback**: Previously had `/[^|)]+/` as catch-all
   - Problem: Matched everything, neumes never activated
   - Solution: Force parser to match specific patterns

3. **`nabc_modifier` as regex**: Flexible pattern for modifiers
   - Reason: Modifiers can combine in many ways (-, ~, ', etc.)
   - Could be expanded to specific tokens if needed

**Example Parse Tree**:

```gabc
name: Test;
%%
(e|vi|f|pu)
```

```
(source_file
  (headers ...)
  (section_separator)
  (score
    (syllable
      (notation
        (snippet_list
          first: (gabc_snippet
            (pitch))              # 'e'
          alternate: (nabc_snippet
            (nabc_neume))         # 'vi'
          alternate: (gabc_snippet
            (pitch))              # 'f'
          alternate: (nabc_snippet
            (nabc_neume)))))))    # 'pu'
```

**Testing**:

Created `test/corpus/nabc_neumes.txt`:

```
==================
NABC neume codes - simple
==================

name: Test;
%%
(e|vi)

---

(source_file
  (headers ...)
  (section_separator)
  (score
    (syllable
      (notation
        (snippet_list
          first: (gabc_snippet (pitch))
          (nabc_snippet (nabc_neume)))))))
```

**Results**: Parser correctly identifies individual neumes within NABC snippets.

---

## Parser Rules Reference

### Core Rules

#### `source_file`
```javascript
source_file: $ => seq(
  optional($.headers),
  $.section_separator,
  optional($.score)
)
```
**Root rule**. GABC file = headers + %% + score.

#### `headers`
```javascript
headers: $ => repeat1(
  choice(
    $.header_field,
    $.comment
  )
)
```
**Header section**. One or more fields/comments before %%.

#### `header_field`
```javascript
header_field: $ => seq(
  field('name', $.field_name),
  ':',
  field('value', optional($.field_value)),
  ';'
)
```
**Metadata entry**. Format: `name: value;`

Fields are named for query targeting:
- `field('name', ...)` → `(header_field name: (field_name) ...)`
- `field('value', ...)` → `(header_field value: (field_value) ...)`

#### `section_separator`
```javascript
section_separator: $ => '%%'
```
**Divider**. Standalone %% between headers and score.

#### `score`
```javascript
score: $ => repeat1(
  choice(
    $.syllable,
    $.clef,
    $.comment
  )
)
```
**Musical content**. Syllables with notation, clefs, comments.

#### `syllable`
```javascript
syllable: $ => choice(
  seq($.lyric_text, optional($.notation)),
  $.notation
)
```
**Lyric + notation pair**. Text can be followed by notes, or notation alone.

Conflict: Parser must decide if `(` is text or notation start.

#### `notation`
```javascript
notation: $ => seq(
  '(',
  optional($.snippet_list),
  ')'
)
```
**Musical notation container**. Parentheses with alternating GABC/NABC snippets.

#### `snippet_list`
```javascript
snippet_list: $ => seq(
  field('first', $.gabc_snippet),
  repeat(
    seq(
      '|',
      field('alternate', choice(
        $.nabc_snippet,
        $.gabc_snippet
      ))
    )
  )
)
```
**Alternation logic**. First is always GABC, then alternating.

Fields:
- `field('first', ...)` → identifies initial GABC
- `field('alternate', ...)` → subsequent snippets

**Future**: Add state tracking to enforce strict alternation.

### GABC Elements

#### `pitch`
```javascript
pitch: $ => seq(
  optional('-'),              // initio debilis
  choice(
    /[a-npA-NP]/,            // Standard pitches
    /[oO][01]?/              // Oriscus with optional suffix
  ),
  optional(/[012]/)          // Inclinatum suffix
)
```
**Pitch letters**. a-p (lowercase), A-P (uppercase), excluding o/O (oriscus).

Modifiers:
- `-` prefix: initio debilis (weakened start)
- `[012]` suffix: inclinatum direction (uppercase only)

#### `accidental`
```javascript
accidental: $ => seq(
  /[a-np]/,      // Pitch position
  choice(
    'x',         // Flat
    '#',         // Sharp
    'y',         // Natural
    '##',        // Double sharp
    'Y'          // Soft natural
  ),
  optional('?')  // Cautionary
)
```
**Pitch alterations**. Format: `[pitch][symbol][?]`

Examples: `ix` (flat on i), `f#` (sharp on f), `gy?` (cautionary natural on g)

#### `modifier`
```javascript
modifier: $ => choice(
  'vvv', 'sss', 'vv', 'ss',              // Compound (precedence!)
  /[qwWvVs~<>=rR.]/,                     // Simple
  /r[0-8]/,                              // Special with numbers
  /_[0-5]?/,                             // Episema
  /'[01]?/                               // Ictus
)
```
**Note modifiers**. Compound forms listed first for precedence.

#### `bar`
```javascript
bar: $ => choice(
  '::',       // divisio finalis
  ':?',       // dotted divisio maior
  ':',        // divisio maior
  /;[1-8]?/,  // divisio minor + suffix
  /,[0]?/,    // divisio minima + suffix
  /\^[0]?/,   // divisio minimis + suffix
  /`[0]?/     // virgula + suffix
)
```
**Separation bars**. Divisio marks for phrase boundaries.

### NABC Elements

#### `nabc_neume`
```javascript
nabc_neume: $ => token(choice(
  'vi', 'pu', 'ta', 'gr', 'cl', 'pe', 'po', 'to',
  'ci', 'sc', 'pf', 'sf', 'tr', 'st', 'ds', 'ts',
  'tg', 'bv', 'tv', 'pq', 'pr', 'pi', 'vs', 'or',
  'sa', 'ql', 'qi', 'pt', 'ni', 'oc', 'un'
))
```
**St. Gall/Laon neume codes**. 31 total codes (29 common, 1 St. Gall, 2 Laon).

`token()` ensures atomic matching—parser doesn't split codes.

#### `nabc_modifier`
```javascript
nabc_modifier: $ => /[0-9`'\-~.!\/]+/
```
**Neume modifiers**. Modifiers that follow neume codes.

Examples: `-` (separator), `.` (dot), `~` (liquescent)

---

## Testing Strategy

### Corpus Tests

Located in `test/corpus/*.txt`, format:

```
==================
Test Name
==================

[Input GABC]

---

[Expected AST]
```

Run with: `tree-sitter test`

### Test Categories

| File | Focus | Count |
|------|-------|-------|
| `headers.txt` | Header field parsing | 3 |
| `alternation.txt` | GABC/NABC alternation | 3 |
| `pitches.txt` | Pitch notation | 4 |
| `nabc_neumes.txt` | NABC neume codes | 3 |

### Example-Based Testing

Located in `examples/*.gabc`, real-world files:

- `kyrie.gabc`: Kyrie XVII (Graduale Romanum)
- `alternation.gabc`: Alternation patterns
- `nabc_test.gabc`: NABC neume test cases

Parse with: `tree-sitter parse examples/kyrie.gabc`

### Interactive Testing

Playground mode: `tree-sitter playground`

Opens web UI for:
- Real-time parsing
- AST visualization
- Query testing
- Grammar debugging

---

## Comparison with Vim Syntax

### Fundamental Differences

| Aspect | Vim Syntax | Tree-sitter |
|--------|------------|-------------|
| **Paradigm** | Regex patterns | Context-free grammar |
| **State** | Stateless | Stateful parser |
| **Output** | Highlight regions | Complete AST |
| **Performance** | O(n×rules) | O(n) incremental |
| **Error Handling** | Best-effort match | Error recovery + partial trees |
| **Alternation** | Impossible | Trivial with state |

### Feature Parity

| Feature | Vim | Tree-sitter | Notes |
|---------|-----|-------------|-------|
| Headers | ✅ | ✅ | Both parse name:value; |
| Comments | ✅ | ✅ | `%` lines |
| Section separator | ✅ | ✅ | `%%` |
| Clefs | ✅ | ✅ | `(c4)`, `(f3)`, etc. |
| GABC pitches | ✅ | ✅ | a-p, A-P |
| GABC modifiers | ✅ | ✅ | v, s, ~, etc. |
| Bars | ✅ | ✅ | ::, :, ;, etc. |
| NABC neumes | ✅ | ✅ | vi, pu, ta, etc. |
| **GABC/NABC alternation** | ⚠️ Partial | 🚧 Pending | Vim: first=GABC, rest=NABC<br>Tree-sitter: Will have perfect alternation |

### Migration Path

Users can run both:
- **Vim syntax**: Fallback for editors without Tree-sitter
- **Tree-sitter**: Primary for Neovim 0.9+, Helix, etc.

See [gregorio.nvim](https://github.com/AISCGre-BR/gregorio.nvim) for dual-mode configuration.

---

## Future Roadmap

### Short Term (Weeks 1-4)

- [ ] Complete GABC element coverage
  - [ ] Custos (`f+`, `g+`)
  - [ ] Line breaks (`z`, `Z`, suffixes)
  - [ ] Fusions (`@`, `@[...]`)
  - [ ] Spacing (`/`, `//`, `/[...]`)
  - [ ] Attributes (`[attr:value]`)
  - [ ] Macros (`[nm0]`, `[gm0]`, `[em0]`)

- [ ] Improve test coverage
  - [ ] All corpus tests passing
  - [ ] Real-world file validation
  - [ ] Error recovery tests

### Medium Term (Weeks 5-8)

- [ ] **Perfect GABC/NABC alternation**
  - [ ] Add state tracking to `snippet_list`
  - [ ] Enforce odd=GABC, even=NABC
  - [ ] Update tests to validate

- [ ] Expand NABC grammar
  - [ ] Compound neumes (gr-cl, pe.po)
  - [ ] NABC-specific modifiers
  - [ ] Laon vs St. Gall distinctions

- [ ] Query development
  - [ ] `queries/highlights.scm` for syntax highlighting
  - [ ] `queries/locals.scm` for scope tracking
  - [ ] `queries/folds.scm` for code folding

### Long Term (Weeks 9+)

- [ ] Editor integration
  - [ ] Neovim nvim-treesitter plugin
  - [ ] Helix languages.toml
  - [ ] Emacs tree-sitter-mode

- [ ] Advanced features
  - [ ] Semantic validation (invalid neume combinations)
  - [ ] Auto-completion (neume codes, attributes)
  - [ ] Refactoring (notation transformation)

- [ ] Performance optimization
  - [ ] Profile with large GABC files
  - [ ] Optimize conflict resolution
  - [ ] Benchmark vs Vim syntax

---

## Contributing

### Adding New Rules

1. **Define in grammar.js**:
   ```javascript
   new_element: $ => seq(
     'start',
     $.content,
     'end'
   )
   ```

2. **Add to parent rule's `contains` or `choice`**:
   ```javascript
   gabc_snippet: $ => repeat1(
     choice(
       $.pitch,
       $.new_element,  // Add here
       // ...
     )
   )
   ```

3. **Generate parser**:
   ```bash
   tree-sitter generate
   ```

4. **Add corpus test**:
   ```
   ==================
   New element test
   ==================

   name: Test;
   %%
   (start content end)

   ---

   (source_file
     ...
     (gabc_snippet
       (new_element)))
   ```

5. **Run tests**:
   ```bash
   tree-sitter test
   ```

### Grammar Style Guide

- **Rule names**: lowercase_with_underscores
- **Token grouping**: Use `token()` for leaf nodes without structure
- **Comments**: Document complex patterns inline
- **Ordering**: Define compound patterns before simple ones
- **Fields**: Use `field('name', ...)` for important children

---

## References

- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)
- [GABC Specification](https://gregorio-project.github.io/gabc/)
- [Gregorio Compiler (Reference Parser)](https://github.com/gregorio-project/gregorio)
- [gregorio.nvim (Vim Syntax)](https://github.com/AISCGre-BR/gregorio.nvim)

---

**Document Version**: 1.0  
**Last Updated**: October 16, 2024  
**Maintained by**: AISCGre-BR/tree-sitter-gregorio
