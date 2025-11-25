module.exports = grammar({
  name: 'gregorio',

  extras: $ => [
    /\s/,
    $.comment
  ],

  conflicts: $ => [
    [$.snippet_list, $.note],
    [$.gabc_snippet, $.nabc_snippet],
    // Clef (c4, f3) vs note (c, f) - prioritize clef when followed by digit
    [$.gabc_clef, $.note],
    // When a syllable contains text followed by a '(', there is an
    // ambiguity whether that '(' belongs to the current syllable's
    // `note_group` or starts the next syllable (which may be a
    // `note_group`-only syllable). Declare this as an allowed conflict
    // so the parser generator can handle it.
    [$.notation_item, $.note_group],
    // Allow ambiguity involving `notation_item` (when text is followed by '(')
    // so the generator can resolve the parse during conflict resolution.
    [$.notation_item],
    // `syllable` (formerly lyric_text) is a sequence that includes nested `syllable` nested `syllable`
    // through style tags (e.g. `<b>...</b>`). This can create
    // associativity ambiguities for the repetition; declare it as a
    // conflict so the generator can handle it.
    [$.syllable],
    // `gabc_bar` may be followed by `bar_modifiers` which can include ';'.
    // This can create ambiguities in some bracketed constructs; allow
    // the generator to resolve them by declaring a conflict for `gabc_bar`.
    [$.gabc_bar],
    // Repetition within `bar_modifiers` can produce associativity
    // ambiguities; declare a conflict entry so the generator can
    // resolve them deterministically.
    [$.bar_modifiers],
    // `note_shape` and `cavum` both accept the token 'r' which can
    // produce an ambiguity (e.g. pitch + 'r' followed by ':' in some
    // bracketed constructs). Declare a conflict so the generator can
    // handle this overlap.
    [$.note_shape, $.cavum],
    // `nabc_complex_glyph_descriptor` can contain optional trailing
    // `nabc_subpunctis_prepunctis_sequence` and `nabc_significant_letter_sequence`
    // which makes its repetition associative; add a conflict so the
    // generator can accept both interpretations.
    [$.nabc_complex_glyph_descriptor],
    // Repetition/associativity within `nabc_subpunctis_prepunctis_sequence`.
    [$.nabc_subpunctis_prepunctis_sequence],
    // Repetition/associativity within `nabc_significant_letter_sequence`.
    [$.nabc_significant_letter_sequence],
    // Overlap between `bar` tokens and `nabc_horizontal_spacing_adjustment`
    // (which uses '/' and '``', '`') can create ambiguity when both
    // appear after a `gabc_snippet` separated by '|'. Declare a
    // conflict so the generator can resolve it.
    [$.gabc_bar, $.nabc_horizontal_spacing_adjustment],
    // `spacing` and `nabc_horizontal_spacing_adjustment` both use '/' and
    // related tokens; declare a conflict to allow the generator to
    // disambiguate their usage in sequences.
    [$.spacing, $.nabc_horizontal_spacing_adjustment],
    // `nabc_st_gall_ls_shorthand` and `nabc_laon_ls_shorthand` can overlap in
    // token sequences; declare a conflict so the generator accepts
    // either interpretation when ambiguity arises.
    [$.nabc_st_gall_ls_shorthand, $.nabc_laon_ls_shorthand]
  ],

  rules: {
    // Root rule: a GABC file consists of a header section and a notation section
    source_file: $ => choice(
      // Full structure with header
      seq(
        $.header_section,
        $.section_separator,
        optional($.notation_section)
      ),
      // Just notation (no header)
      $.notation_section
    ),

    // Separator between header and notation sections
    section_separator: $ => '%%',

    // Header section: contains metadata
    header_section: $ => repeat1($.header),

    // Header: name: value;
    header: $ => seq(
      field('name', $.header_name),
      ':',
      field('value', $.header_value),
      ';'
    ),

    header_name: $ => /[a-zA-Z0-9][a-zA-Z0-9-]*/,

    header_value: $ => choice(
      $.multiline_header_value,
      $.single_line_header_value
    ),

    single_line_header_value: $ => /[^;%]*/,

    // Multiline header: omit semicolon, end with ;;
    multiline_header_value: $ => seq(
      /[^;%]*/,
      ';;'
    ),

    // Notation section: sequence of notation items
    notation_section: $ => repeat1($.notation_item),

    // Notation item: must contain optional syllable text and mandatory note group.
    notation_item: $ => seq(
      optional($.syllable),
      $.note_group
    ),

    // Syllable: text outside parentheses
    syllable: $ => repeat1(
      choice(
        $.syllable_text,
        $.syllable_style_bold,
        $.syllable_style_colored,
        $.syllable_style_italic,
        $.syllable_style_small_caps,
        $.syllable_style_teletype,
        $.syllable_style_underline,
        $.syllable_control_clear,
        $.syllable_control_elision,
        $.syllable_control_euouae,
        $.syllable_control_no_line_break,
        $.syllable_control_protrusion,
        $.syllable_other_above_lines_text,
        $.syllable_other_special_character,
        $.syllable_other_verbatim,
        $.syllable_translation,
        $.syllable_centering,
        $.syllable_escape_sequence
      )
    ),

    syllable_text: $ => /[^\s${}\\[\\]<>%():;]+/,

    // Syllable style tags
    syllable_style_bold: $ => seq('<b>', optional($.syllable), '</b>'),
    syllable_style_colored: $ => seq('<c>', optional($.syllable), '</c>'),
    syllable_style_italic: $ => seq('<i>', optional($.syllable), '</i>'),
    syllable_style_small_caps: $ => seq('<sc>', optional($.syllable), '</sc>'),
    syllable_style_teletype: $ => seq('<tt>', optional($.syllable), '</tt>'),
    syllable_style_underline: $ => seq('<ul>', optional($.syllable), '</ul>'),

    // Syllable controls
    syllable_control_clear: _ => choice('<clear>', '<clear/>'),
    syllable_control_elision: $ => seq('<e>', optional($.syllable), '</e>'),
    syllable_control_euouae: $ => seq('<eu>', optional($.syllable), '</eu>'),
    syllable_control_no_line_break: $ => seq('<nlba>', optional($.syllable), '</nlba>'),
    syllable_control_protrusion: _ => choice(
      '<pr>',
      '<pr/>',
      seq('<pr:', /[01]/, '>')
    ),

    // Other tags
    syllable_other_above_lines_text: $ => seq('<alt>', optional($.syllable), '</alt>'),
    syllable_other_special_character: $ => seq('<sp>', optional($.syllable), '</sp>'),
    syllable_other_verbatim: $ => seq('<v>', optional($.syllable), '</v>'),

    // Translation text: [text]
    syllable_translation: $ => seq(
      '[',
      optional($.syllable_translation_text),
      ']'
    ),

    syllable_translation_text: _ => /[^\]]*/,

    // Lyric centering: {text}
    syllable_centering: $ => seq(
      '{',
      optional($.syllable_centering_text),
      '}'
    ),

    syllable_centering_text: _ => /[^}]*/,

    // Escape sequence: $ followed by character
    syllable_escape_sequence: _ => seq('$', /./),

    // Note group: (notes) - can contain GABC and/or NABC snippets
    note_group: $ => seq(
      '(',
      optional($.snippet_list),
      ')'
    ),

    // Snippet list: GABC snippets and/or NABC snippets separated by |
    snippet_list: $ => seq(
      field('single', $.gabc_snippet),
      repeat(seq('|', choice($.gabc_snippet, $.nabc_snippet)))
    ),

    // GABC snippet: notes and other GABC elements
    gabc_snippet: $ => repeat1(choice(
      $.gabc_clef,
      $.note,
      $.gabc_bar,
      $.line_break,
      $.custos,
      $.spacing,
      $.shape_hint,
      $.choral_sign,
      $.brace,
      $.ledger_line,
      $.slur,
      $.episema_adjustment,
      $.above_lines_text,
      $.verbatim_tex,
      $.macro,
      $.custom_ledger_line
    )),

    // Note: pitch with optional modifiers
    note: $ => seq(
      $.pitch,
      optional($.note_modifiers)
    ),

    pitch: $ => /[a-npA-NP]/,

    note_modifiers: $ => repeat1(choice(
      $.note_shape,
      $.alteration,
      $.liquescent,
      $.punctum_mora,
      $.ictus,
      $.horizontal_episema,
      $.accent,
      $.musica_ficta,
      $.oriscus_orientation,
      $.neume_fusion,
      $.cavum
    )),

    note_shape: $ => choice('o', 'w', 'v', 'V', 's', 'r', 'R', 'q', 'W', 'O', 'ss', 'sss', 'vv', 'vvv'),

    alteration: $ => choice('x', '#', 'y', 'X', '##', 'Y', seq(choice('x', '#', 'y'), '?')),

    liquescent: $ => choice('~', '<', '>'),

    punctum_mora: $ => choice('.', '..', '.0', '.1'),

    ictus: $ => choice("'", "'0", "'1"),

    horizontal_episema: $ => seq('_', optional($.episema_position)),

    episema_position: $ => /[0-5]+/,

    accent: $ => /r[1-6]/,

    musica_ficta: $ => /r[7-8]/,

    oriscus_orientation: $ => /[oO][01]/,

    neume_fusion: $ => choice('@', seq('@[', $.snippet_list, ']')),

    cavum: $ => choice('r', 'r0'),

    // Clef: c or f, optional b, line number (higher precedence than note)
    gabc_clef: $ => prec(1, token(seq(
      /[cf]/,
      optional('b'),
      /[1-8]/
    ))),

    line_number: $ => /[1-8]/,

    // Bar: various bar types
    gabc_bar: $ => seq(
      choice('`', '^', ',', ';', ':', '::'),
      optional($.bar_modifiers)
    ),

    bar_modifiers: $ => repeat1(choice("'", '_', seq(';', /[1-8]/))),

    // Line break
    line_break: $ => choice('z', 'z+', 'z-', 'Z', 'Z+', 'Z-'),

    // Custos
    custos: $ => choice('z0', seq($.pitch, '+'), '[nocustos]'),

    // Spacing
    spacing: $ => choice(
      '/0',
      '/!',
      '/',
      '//',
      seq('/[', /-?[0-9.]+/, ']'),
      '!'
    ),

    // Shape hint
    shape_hint: $ => seq('[shape:', /[a-z]+/, ']'),

    // Choral sign
    choral_sign: $ => choice(
      seq('[cs:', /[^]]*/, ']'),
      seq('[cn:', $.nabc_snippet, ']')
    ),

    // Brace
    brace: $ => choice(
      seq('[', $.brace_type, ':', /[01]/, ';', /[^]]+/, ']'),
      seq('[', $.brace_type, ':', /[01]/, '{]'),
      seq('[', $.brace_type, ':', /[01]/, '}]')
    ),

    brace_type: $ => choice('ob', 'ub', 'ocb', 'ocba'),

    // Ledger line
    ledger_line: $ => seq('[ll:', /[01]/, ']'),

    // Custom ledger line
    custom_ledger_line: $ => choice(
      seq('[oll:', /[^;]+/, ';', /[^]]+/, ']'),
      seq('[oll:', /[^}]+/, '{]'),
      seq('[oll:]}]'),
      seq('[ull:', /[^;]+/, ';', /[^]]+/, ']'),
      seq('[ull:', /[^}]+/, '{]'),
      seq('[ull:]}]')
    ),

    // Slur
    slur: $ => choice(
      seq('[oslur:', /[0-2]/, ';', /[^,]+/, ',', /[^]]+/, ']'),
      seq('[oslur:', /[0-2]/, '{]'),
      seq('[oslur:', /[0-2]/, '}]'),
      seq('[uslur:', /[0-2]/, ';', /[^,]+/, ',', /[^]]+/, ']'),
      seq('[uslur:', /[0-2]/, '{]'),
      seq('[uslur:', /[0-2]/, '}]')
    ),

    // Episema adjustment
    episema_adjustment: $ => choice(
      seq('[oh:', optional($.episema_position_spec), optional($.episema_nudge), ']'),
      seq('[uh:', optional($.episema_position_spec), optional($.episema_nudge), ']'),
      seq('[oh:', optional($.episema_position_spec), '{]'),
      seq('[oh]}]'),
      seq('[uh:', optional($.episema_position_spec), '{]'),
      seq('[uh]}]')
    ),

    episema_position_spec: $ => choice('m', 'l', 'h', 'ol', 'oh', 'ul', 'uh'),

    episema_nudge: $ => seq(/[+-]/, /[0-9.]+/, /[a-z]+/),

    // Above lines text
    above_lines_text: $ => seq('[alt:', /[^]]*/, ']'),

    // Verbatim TeX
    verbatim_tex: $ => choice(
      seq('[nv:', /[^]]*/, ']'),
      seq('[gv:', /[^]]*/, ']'),
      seq('[ev:', /[^]]*/, ']')
    ),

    // Macro
    macro: $ => choice(
      seq('[nm', /[0-9]/, ']'),
      seq('[gm', /[0-9]/, ']'),
      seq('[em', /[0-9]/, ']'),
      seq('[altm', /[0-9]/, ']')
    ),

    // NABC snippet: sequence of complex neume descriptors
    nabc_snippet: $ => repeat1($.nabc_complex_neume_descriptor),

    // Complex neume descriptor
    nabc_complex_neume_descriptor: $ => seq(
      optional($.nabc_horizontal_spacing_adjustment),
      $.nabc_complex_glyph_descriptor,
      optional($.nabc_subpunctis_prepunctis_sequence),
      optional($.nabc_significant_letter_sequence)
    ),

    // Horizontal spacing adjustment
    nabc_horizontal_spacing_adjustment: $ => repeat1(choice('//', '/', '``', '`')),

    // Complex glyph descriptor
    nabc_complex_glyph_descriptor: $ => seq(
      $.nabc_glyph_descriptor,
      repeat(seq('!', $.nabc_glyph_descriptor)),
      optional($.nabc_subpunctis_prepunctis_sequence),
      optional($.nabc_significant_letter_sequence)
    ),

    // Glyph descriptor
    nabc_glyph_descriptor: $ => seq(
      $.nabc_neume_code,
      optional($.nabc_glyph_modifiers),
      optional($.nabc_pitch_descriptor)
    ),

    // NABC neume code (St. Gall or Laon)
    nabc_neume_code: $ => choice(
      'vi', 'pu', 'ta', 'gr', 'cl', 'pe', 'po', 'to', 'ci', 'sc',
      'pf', 'sf', 'tr', 'st', 'ds', 'ts', 'tg', 'bv', 'tv', 'pr',
      'pi', 'vs', 'or', 'sa', 'pq', 'ql', 'qi', 'pt', 'ni', 'un', 'oc'
    ),

    // Glyph modifiers
    nabc_glyph_modifiers: $ => seq(
      repeat1(choice('S', 'G', 'M', '-', '>', '~')),
      optional(/[1-9]/)
    ),

    // Pitch descriptor: h followed by pitch letter
    nabc_pitch_descriptor: $ => seq('h', /[a-np]/),

    // Subpunctis and prepunctis sequence
    nabc_subpunctis_prepunctis_sequence: $ => repeat1($.nabc_subpunctis_prepunctis_descriptor),

    // Subpunctis or prepunctis descriptor
    nabc_subpunctis_prepunctis_descriptor: $ => seq(
      choice('su', 'pp'),
      optional($.nabc_subpunctis_modifier),
      /[1-9]/
    ),

    // Subpunctis modifier (St. Gall: t, u, v, w, x, y; Laon: n, q, z, x)
    nabc_subpunctis_modifier: $ => /[tuvwxynqz]/,

    // Significant letter sequence
    nabc_significant_letter_sequence: $ => repeat1($.nabc_significant_letter_descriptor),

    // Significant letter descriptor
    nabc_significant_letter_descriptor: $ => choice(
      $.nabc_st_gall_significant_letter,
      $.nabc_laon_significant_letter,
      $.nabc_tironian_note
    ),

    // St. Gall significant letter
    nabc_st_gall_significant_letter: $ => seq(
      'ls',
      $.nabc_st_gall_ls_shorthand,
      /[1-9]/
    ),

    nabc_st_gall_ls_shorthand: $ => choice(
      'al', 'am', 'b', 'c', 'cm', 'co', 'cw', 'd', 'e', 'eq', 'ew',
      'fid', 'fr', 'g', 'i', 'im', 'iv', 'k', 'l', 'lb', 'lc', 'len',
      'lm', 'lp', 'lt', 'm', 'moll', 'p', 'par', 'pfec', 'pm', 'sb',
      'sc', 'simil', 'simul', 'sm', 'st', 'sta', 'tb', 'tm', 'tw', 'v',
      'vol', 'x'
    ),

    // Laon significant letter
    nabc_laon_significant_letter: $ => seq(
      'ls',
      $.nabc_laon_ls_shorthand,
      /[1-9]/
    ),

    nabc_laon_ls_shorthand: $ => choice(
      'a', 'c', 'eq', 'eq-', 'equ', 'f', 'h', 'hn', 'hp', 'l', 'n',
      'nl', 'nt', 'm', 'md', 's', 'simp', 'simpl', 'sp', 'st', 't', 'th'
    ),

    // Tironian note (Laon only)
    nabc_tironian_note: $ => seq(
      'lt',
      $.nabc_tironian_shorthand,
      /[1-9]/
    ),

    nabc_tironian_shorthand: $ => choice(
      'i', 'do', 'dr', 'dx', 'ps', 'qm', 'sb', 'se', 'sj', 'sl', 'sn',
      'sp', 'sr', 'st', 'us'
    ),

    // Comment: % until end of line
    comment: $ => seq('%', /.*/)
  }
});

