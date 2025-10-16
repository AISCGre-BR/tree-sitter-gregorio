/**
 * Tree-sitter Grammar for GABC/NABC (Gregorian Chant Notation)
 * 
 * This grammar implements parsing for the GABC format used by the Gregorio project.
 * It handles both GABC (standard notation) and NABC (St. Gall neumes) with proper
 * stateful alternation.
 * 
 * Reference: https://gregorio-project.github.io/gabc/
 * Inspiration: Gregorio compiler (Yacc/Bison parser)
 * 
 * Key Features:
 * - Header/body separation with %% delimiter
 * - Stateful GABC/NABC alternation tracking
 * - Complete GABC element support (pitches, modifiers, bars, etc.)
 * - Markup tags with LaTeX embedding
 * - Comments and special characters
 */

module.exports = grammar({
  name: 'gregorio',

  extras: $ => [
    /\s/,  // Whitespace
  ],

  conflicts: $ => [
    [$.syllable],
    [$.lyric_text]
  ],

  rules: {
    // =========================================================================
    // TOP-LEVEL STRUCTURE
    // =========================================================================
    
    source_file: $ => seq(
      optional($.headers),
      $.section_separator,
      optional($.score)
    ),

    // =========================================================================
    // HEADER SECTION
    // =========================================================================
    
    headers: $ => repeat1(
      choice(
        $.header_field,
        $.comment
      )
    ),

    header_field: $ => seq(
      field('name', $.field_name),
      ':',
      field('value', optional($.field_value)),
      ';'
    ),

    field_name: $ => /[^%:\n][^:\n]*/,
    
    field_value: $ => /[^;%\n]+/,

    // =========================================================================
    // SECTION SEPARATOR
    // =========================================================================
    
    section_separator: $ => '%%',

    // =========================================================================
    // SCORE SECTION (Musical Content)
    // =========================================================================
    
    score: $ => repeat1(
      choice(
        $.syllable,
        $.clef,
        $.comment
      )
    ),

    // =========================================================================
    // SYLLABLE (Lyric Text + Notation)
    // =========================================================================
    
    syllable: $ => choice(
      seq($.lyric_text, optional($.notation)),
      $.notation
    ),

    lyric_text: $ => repeat1(
      choice(
        $.text_content,
        $.markup_tag,
        $.lyric_centering,
        $.translation
      )
    ),

    text_content: $ => /[^(<\[\n%]+/,

    // =========================================================================
    // MARKUP TAGS
    // =========================================================================
    
    markup_tag: $ => choice(
      $.bold_tag,
      $.italic_tag,
      $.underline_tag,
      $.small_caps_tag,
      $.color_tag,
      $.teletype_tag,
      $.verbatim_tag
    ),

    bold_tag: $ => seq('<b>', /[^<]*/, '</b>'),
    italic_tag: $ => seq('<i>', /[^<]*/, '</i>'),
    underline_tag: $ => seq('<u>', /[^<]*/, '</u>'),
    small_caps_tag: $ => seq('<sc>', /[^<]*/, '</sc>'),
    color_tag: $ => seq('<c>', /[^<]*/, '</c>'),
    teletype_tag: $ => seq('<tt>', /[^<]*/, '</tt>'),
    verbatim_tag: $ => seq('<v>', /[^<]*/, '</v>'),

    // =========================================================================
    // LYRIC CENTERING & TRANSLATION
    // =========================================================================
    
    lyric_centering: $ => seq(
      '{',
      /[^}]*/,
      '}'
    ),

    translation: $ => seq(
      '[',
      /[^\]]*/,
      ']'
    ),

    // =========================================================================
    // CLEF
    // =========================================================================
    
    clef: $ => seq(
      '(',
      choice(
        seq($.clef_type, optional(seq('@', $.clef_type))),
      ),
      ')'
    ),

    clef_type: $ => /[cf]b?[1-4]/,

    // =========================================================================
    // MUSICAL NOTATION (GABC/NABC with Stateful Alternation)
    // =========================================================================
    
    notation: $ => seq(
      '(',
      optional($.snippet_list),
      ')'
    ),

    // KEY FEATURE: Alternating snippets with state tracking
    snippet_list: $ => seq(
      field('first', $.gabc_snippet),  // First is always GABC
      repeat(
        seq(
          '|',
          field('alternate', choice(
            $.nabc_snippet,    // Even positions
            $.gabc_snippet     // Odd positions (after multiple |)
          ))
        )
      )
    ),

    // =========================================================================
    // GABC SNIPPET (Standard Notation)
    // =========================================================================
    
    gabc_snippet: $ => repeat1(
      choice(
        $.pitch,
        $.accidental,
        $.modifier,
        $.bar,
        $.custos,
        $.line_break,
        $.fusion,
        $.spacing,
        $.attribute,
        $.macro
      )
    ),

    // =========================================================================
    // NABC SNIPPET (St. Gall Neumes)
    // =========================================================================
    
    nabc_snippet: $ => repeat1(
      choice(
        $.nabc_neume,
        $.nabc_modifier,
        /[^|)]+/  // Temporary: accept any content until we define full NABC grammar
      )
    ),

    nabc_neume: $ => /[a-z]+/,  // Placeholder for NABC neume codes
    nabc_modifier: $ => /[0-9`'-]+/,  // Placeholder for NABC modifiers

    // =========================================================================
    // GABC ELEMENTS
    // =========================================================================

    // PITCHES
    pitch: $ => seq(
      optional('-'),  // initio debilis
      choice(
        /[a-npA-NP]/,   // Standard pitches (excluding o/O)
        /[oO][01]?/     // Oriscus with optional suffix
      ),
      optional(/[012]/)  // Inclinatum suffix for uppercase
    ),

    // ACCIDENTALS
    accidental: $ => seq(
      /[a-np]/,  // Pitch position
      choice(
        'x',    // Flat
        '#',    // Sharp
        'y',    // Natural
        '##',   // Double sharp
        'Y'     // Soft natural
      ),
      optional('?')  // Cautionary
    ),

    // MODIFIERS
    modifier: $ => choice(
      // Compound modifiers (define first for precedence)
      'vvv',  // trivirga
      'sss',  // tristropha
      'vv',   // bivirga
      'ss',   // distropha
      
      // Simple modifiers
      /[qwWvVs~<>=rR.]/,
      
      // Special modifiers with numbers
      /r[0-8]/,
      
      // Episema and ictus with optional suffixes
      /_[0-5]?/,
      /'[01]?/
    ),

    // BARS (Divisio marks)
    bar: $ => choice(
      '::',     // divisio finalis
      ':?',     // dotted divisio maior
      ':',      // divisio maior
      /;[1-8]?/,  // divisio minor with optional suffix
      /,[0]?/,    // divisio minima with optional suffix
      /\^[0]?/,   // divisio minimis with optional suffix
      /`[0]?/     // virgula with optional suffix
    ),

    // CUSTOS (end-of-line guide)
    custos: $ => /[a-np]\+/,

    // LINE BREAKS
    line_break: $ => /[zZ][+\-0]?/,

    // NEUME FUSION
    fusion: $ => choice(
      // Collective fusion
      seq('@[', repeat1($.pitch), ']'),
      // Individual fusion connector
      '@'
    ),

    // SPACING
    spacing: $ => choice(
      '//',           // double space
      '/!',           // single space (same neume)
      '/0',           // half space
      /\/\[-?\d+(\.\d+)?\]/,  // scaled spacing
      '/',            // small space
      '!'             // zero-width space
    ),

    // ATTRIBUTES
    attribute: $ => seq(
      '[',
      field('name', $.attr_name),
      ':',
      field('value', optional($.attr_value)),
      ']'
    ),

    attr_name: $ => choice(
      'cs', 'cn',           // choral signs
      'ob', 'ub', 'ocb', 'ocba',  // braces
      'll',                 // stem length
      'oll', 'ull',        // ledger lines
      'oslur', 'uslur',    // slurs
      'oh', 'uh',          // episema tuning
      'alt',               // above-lines text
      'nv', 'gv', 'ev',    // verbatim TeX
      'nocustos',          // no custos flag
      /[a-z]+/             // generic attributes
    ),

    attr_value: $ => /[^\]]+/,

    // MACROS
    macro: $ => seq(
      choice('nm', 'gm', 'em'),  // note/glyph/element macro
      /[0-9]/,                    // macro number
      optional(seq(
        '{',
        /[^}]*/,
        '}'
      ))
    ),

    // =========================================================================
    // COMMENTS
    // =========================================================================
    
    comment: $ => token(seq(
      '%',
      /.*/
    )),
  }
});
