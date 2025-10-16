# Tree-sitter Grammar Development Guide for GABC/NABC

**Project**: tree-sitter-gregorio  
**Target**: Tree-sitter parser for GABC (Gregorian Chant) notation  
**Language**: JavaScript (grammar.js)  
**Date**: October 16, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Development Philosophy](#development-philosophy)
3. [Grammar Structure](#grammar-structure)
4. [Implementation History](#implementation-history)
   - [Phase 1: Initial Setup](#phase-1-initial-setup)
   - [Phase 2: NABC Neume Codes](#phase-2-nabc-neume-codes)
   - [Phase 3: NABC Glyph Modifiers](#phase-3-nabc-glyph-modifiers)
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

### Phase 3: NABC Glyph Modifiers

**Date**: October 16, 2025  
**Commit**: `0e444e6`

**Problem**: NABC neume codes were parsed, but subsequent glyph modifiers were captured by the generic `nabc_modifier` pattern.

**Solution**: Create specific `nabc_glyph_modifier` rule for the 6 documented modifier types.

**Implementation**:

```javascript
nabc_snippet: $ => repeat1(
  choice(
    $.nabc_neume,
    $.nabc_glyph_modifier,
    $.nabc_modifier
  )
),

// NABC Glyph Modifiers: follow neume codes (St. Gall and Laon)
// S = modification of the mark
// G = modification of the grouping (neumatic break)
// M = melodic modification
// - = addition of episema
// > = augmentive liquescence
// ~ = diminutive liquescence
// Each can optionally take a numeric suffix 1-9
nabc_glyph_modifier: $ => token(seq(
  choice('S', 'G', 'M', '-', '>', '~'),
  optional(/[1-9]/)
)),

nabc_modifier: $ => /[0-9`'!.\/]+/,  // Other modifiers (removed glyph modifier chars)
```

**Key Decisions**:

1. **`token(seq(...))` for atomic matching**: Ensures modifier + suffix parsed as single token
   - Alternative: `seq(choice(...), optional(...))` would create two nodes
   - `token()` wraps the sequence into one indivisible token

2. **Explicit choice of 6 characters**: `choice('S', 'G', 'M', '-', '>', '~')`
   - Clearer than regex: `/[SGM\->~]/`
   - Better error messages if grammar changes
   - Mirrors Vim syntax implementation structure

3. **Optional numeric suffix**: `optional(/[1-9]/)`
   - Suffix 1-9 (not 0-9) per Gregorio specification
   - Integrated into same token for single AST node

4. **Updated `nabc_modifier` regex**: Removed `\-~` characters
   - Previously: `/[0-9`'\-~.!\/]+/`
   - Now: `/[0-9`'!.\/]+/`
   - Prevents glyph modifiers from being caught by generic pattern

**Example Parse Tree**:

```gabc
name: Test;
%%
(e|viS1|f|puG)
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
            (pitch))                    # 'e'
          alternate: (nabc_snippet
            (nabc_neume)                # 'vi'
            (nabc_glyph_modifier))      # 'S1' (single token)
          alternate: (gabc_snippet
            (pitch))                    # 'f'
          alternate: (nabc_snippet
            (nabc_neume)                # 'pu'
            (nabc_glyph_modifier)))))))  # 'G'
```

**Testing**:

Created `test/corpus/nabc_glyph_modifiers.txt` with 7 test cases:

1. Simple modifier (`viS`)
2. All types (`viS`, `puG`, `taM`, `vi-`, `pu>`, `ta~`)
3. With numeric suffixes (`viS1`, `puG2`, etc.)
4. Maximum suffix (`viS9`, `puG9`)
5. St. Gall neumes (`stS`, `stG1`, `st-2`)
6. Laon neumes (`ocM`, `ocG3`, `un~4`)
7. Compound neumes (`grS2`, `cl-3`, `peG4`)

**Results**: 7/7 tests passing ✓

Example test:

```
==================
NABC glyph modifiers - simple
==================

name: Test;
%%
(e|viS)

---

(source_file
  (headers ...)
  (section_separator)
  (score
    (syllable
      (notation
        (snippet_list
          first: (gabc_snippet (pitch))
          alternate: (nabc_snippet
            (nabc_neume)
            (nabc_glyph_modifier)))))))
```

**Comparison with Vim Syntax**:

| Aspect | Vim Syntax | Tree-sitter |
|--------|------------|-------------|
| **Modifier capture** | Two patterns (`nabcGlyphModifier`, `nabcGlyphModifierNumber`) | Single rule (`nabc_glyph_modifier`) |
| **Suffix handling** | Lookbehind: `/\([SGM\->~]\)\@<=[1-9]/` | Integrated: `seq(..., optional(/[1-9]/))` |
| **AST nodes** | N/A (flat highlighting) | One node per modifier+suffix |
| **Pattern type** | Character class `/[SGM\->~]/` | Explicit choice `choice('S', 'G', ...)` |

Tree-sitter's approach creates a single, semantically meaningful AST node where Vim uses two separate patterns for highlighting.

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

#### `nabc_glyph_modifier`
```javascript
nabc_glyph_modifier: $ => token(seq(
  choice('S', 'G', 'M', '-', '>', '~'),
  optional(/[1-9]/)
))
```
**Glyph modifiers for neumes**. 6 modifier types with optional numeric suffix (1-9).

Modifiers:
- `S`: modification of the mark
- `G`: modification of the grouping (neumatic break)
- `M`: melodic modification
- `-`: addition of episema
- `>`: augmentive liquescence
- `~`: diminutive liquescence

`token(seq(...))` wraps modifier+suffix into single AST node.

#### `nabc_modifier`
```javascript
nabc_modifier: $ => /[0-9`'!.\/]+/
```
**Other neume modifiers**. Generic modifiers that follow neume codes.

Note: Characters `\-~` removed in favor of specific `nabc_glyph_modifier` rule.

Examples: `` ` `` (backtick), `'` (apostrophe), `!` (exclamation)

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
| `nabc_glyph_modifiers.txt` | NABC glyph modifiers | 7 |

### Example-Based Testing

Located in `examples/*.gabc`, real-world files:

- `kyrie.gabc`: Kyrie XVII (Graduale Romanum)
- `alternation.gabc`: Alternation patterns
- `nabc_test.gabc`: NABC neume test cases
- `nabc_glyph_modifiers.gabc`: NABC glyph modifier examples

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
| NABC glyph modifiers | ✅ | ✅ | S, G, M, -, >, ~ (1-9) |
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

## Phase 4: NABC Pitch Descriptor (October 16, 2025)

### Context

**Commit**: `638a12b`  
**Branch**: `main`

Implementação do pitch descriptor NABC na gramática Tree-sitter. O pitch descriptor serve para elevar ou rebaixar o neuma em relação aos demais, usando a sintaxe `h<pitch>`.

### NABC Pitch Descriptor Specification

#### Format
```
h<pitch>
```

Onde `<pitch>` é uma das letras: `a-n`, `o`, `p` (padrão regex: `[a-np]`)

#### Examples
```
nabc: vi(ha) - neuma vi com pitch descriptor ha
nabc: pu(hn) - neuma pu com pitch descriptor hn
nabc: ta(ho) - neuma ta com pitch descriptor ho
```

### Grammar Implementation

#### Rule Definition

```javascript
nabc_pitch_descriptor: $ => token(seq(
  'h',
  /[a-np]/
)),
```

#### Technical Decisions

1. **Token Function**: Usamos `token()` para criar um nó atômico no AST, garantindo que `h` e a letra de altura sejam tratados como uma unidade indivisível

2. **Regex Pattern**: `[a-np]` captura todas as letras de `a` a `p`, incluindo `o` e `p`

3. **No Whitespace**: O `token()` garante que não há espaços entre `h` e a letra de altura

4. **AST Node**: Cria um nó `nabc_pitch_descriptor` único que contém ambos os caracteres

### AST Structure

```
nabc_snippet
├── nabc_code (vi, pu, ta, etc.)
├── nabc_glyph_modifier (S, G, M, -, >, ~)
├── nabc_pitch_descriptor (h[a-np])
└── nabc_volume_descriptor (?, 1-9)
```

Exemplo de AST para `vi(ha)`:
```
(nabc_snippet) [0, 0] - [0, 7]
  (nabc_code) [0, 0] - [0, 2]: "vi"
  (nabc_pitch_descriptor) [0, 3] - [0, 5]: "ha"
```

### Grammar Order in nabc_snippet

```javascript
nabc_snippet: $ => seq(
  'nabc:',
  repeat(choice(
    $.nabc_code,
    $.nabc_glyph_modifier,
    $.nabc_pitch_descriptor,      // Deve vir antes de outros tokens
    $.nabc_volume_descriptor,
    // ... outros elementos
  ))
),
```

**Importante**: O pitch descriptor é processado na ordem de escolha dentro do `choice()`, mas o `token()` garante que seja reconhecido atomicamente.

### Testing

#### Corpus Tests

Criamos 7 testes em `test/corpus/nabc_pitch_descriptor.txt`:

1. **Single pitch descriptor**: `ha`
2. **Pitch descriptor in neume**: `vi(ha)`
3. **Maximum pitch**: `hn`
4. **O and P letters**: `ho` e `hp`
5. **Multiple pitch descriptors**: `vi(ha)pu(hm)`
6. **Mixed elements**: códigos + pitch descriptor + modificadores
7. **Edge cases**: `hq` (inválido, não captura)

#### Test Results
```bash
$ npm test

> tree-sitter-gregorio@1.0.0 test
> tree-sitter test

  nabc_pitch_descriptor:
    ✓ single pitch descriptor
    ✓ pitch descriptor in neume
    ✓ maximum pitch
    ✓ o and p letters
    ✓ multiple pitch descriptors
    ✓ mixed with other elements
    ✓ invalid pitch (no match)

7 tests passed
```

### Parser Generation

```bash
$ npm run generate

> tree-sitter-gregorio@1.0.0 generate
> tree-sitter generate

Warning: Tree-sitter CLI version is too new for this grammar (14 vs 13). 
Parsing performance may be affected.
```

O parser foi gerado com sucesso. O warning sobre ABI version não afeta a funcionalidade.

### Visual Examples

#### Input
```gabc
nabc: vi(ha);
nabc: pu(hn)ta(ho);
nabc: to(hm)>pu(hp);
```

#### AST Output
```
(source_file
  (nabc_snippet
    (nabc_code) ; vi
    (nabc_pitch_descriptor)) ; ha
  (nabc_snippet
    (nabc_code) ; pu
    (nabc_pitch_descriptor) ; hn
    (nabc_code) ; ta
    (nabc_pitch_descriptor)) ; ho
  (nabc_snippet
    (nabc_code) ; to
    (nabc_pitch_descriptor) ; hm
    (nabc_glyph_modifier) ; >
    (nabc_code) ; pu
    (nabc_pitch_descriptor))) ; hp
```

### Comparison with Vim Implementation

| Aspect | Tree-sitter | Vim |
|--------|-------------|-----|
| **Recognition** | Atomic token (`token(seq(...))`) | Two separate patterns with lookbehind |
| **AST Node** | Single `nabc_pitch_descriptor` node | Two highlight groups |
| **Validation** | Regex `[a-np]` in grammar | Regex `[a-np]` in pattern |
| **Whitespace** | Not allowed (enforced by `token()`) | Implicitly handled by pattern |
| **Highlighting** | Single node color | Two colors (h=Special, pitch=Identifier) |

### Related Grammar Rules

- **nabc_code** (Phase 1): Define os códigos de neuma válidos
- **nabc_glyph_modifier** (Phase 3): Define os modificadores de glifo
- **nabc_volume_descriptor**: Define descritores de volume (a ser implementado)

### Notes

1. **Token Atomicity**: O uso de `token()` é crucial para garantir que `h` e a letra de altura sejam sempre processados juntos

2. **Regex Simplicity**: A regex `[a-np]` é simples e eficiente, cobrindo todas as letras necessárias

3. **Parser Precedence**: Por ser um token atômico, o pitch descriptor tem precedência natural sobre outros elementos que poderiam capturar `h` isoladamente

4. **Extensibility**: A estrutura permite fácil adição de outros descritores no futuro

### Files Modified

- `grammar.js`: Adicionada regra `nabc_pitch_descriptor`
- `test/corpus/nabc_pitch_descriptor.txt`: Testes de corpus criados
- `examples/nabc_pitch_descriptor.gabc`: Arquivo de exemplo criado
- `src/parser.c`: Parser regenerado automaticamente
- `src/grammar.json`: Gramática compilada atualizada

---

**Document Version**: 1.2  
**Last Updated**: October 16, 2025  
**Maintained by**: AISCGre-BR/tree-sitter-gregorio
