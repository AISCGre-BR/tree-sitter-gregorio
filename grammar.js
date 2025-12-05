module.exports = grammar({
  name: 'gregorio',

  extras: $ => [
    /\s/,
    $.comment
  ],

  conflicts: $ => [
    // `gabc_separation_bar` may be followed by `_gabc_bar_modifier` which can create ambiguities
    [$.gabc_separation_bar],
    // `_gabc_line_break` may be followed by `_gabc_line_break_modifier` which can create ambiguities
    [$._gabc_line_break],
    // `gabc_snippet` can have repetition ambiguities with symbols
    [$.gabc_snippet],
    // Spacing and NABC horizontal spacing can conflict with '/' characters
    [$.gabc_spacing, $.nabc_horizontal_spacing_adjustment],
    // Bar (including virgula '`') and NABC horizontal spacing can conflict
    [$.gabc_separation_bar, $.nabc_horizontal_spacing_adjustment],
    // NABC complex glyph descriptor can have ambiguities with subpunctis/prepunctis sequences
    [$.nabc_complex_glyph_descriptor],
    // NABC subpunctis/prepunctis sequence can have repetition ambiguities
    [$.nabc_subpunctis_prepunctis_sequence],
    // NABC significant letter sequence can have repetition ambiguities
    [$.nabc_significant_letter_sequence],
    // St. Gall and Laon significant letter shorthands can overlap
    [$.nabc_st_gall_ls_shorthand, $.nabc_laon_ls_shorthand],
    // gabc_neume can appear alone or as operand in gabc_neume_fusion
    [$.gabc_neume, $.gabc_neume_fusion],
    // gabc_neume with or without additional signs can be ambiguous
    [$.gabc_neume],
  ],

  rules: {
    // Root rule: a GABC file consists of a header section and a notation section
    source_file: $ => choice(
      // Full structure with header
      prec(1, seq(
        $.header_section,
        $.section_separator,
        optional($.notation_section)
      )),
      // Just notation (no header)
      $.notation_section
    ),

    // Separator between header and notation sections
    section_separator: $ => '%%',

    // Header section: contains metadata
    header_section: $ => repeat1($.header),

    // Header: name: value;
    header: $ => prec(2, seq(
      field('name', $.header_name),
      token.immediate(':'),
      field('value', $.header_value)
    )),

    // Token to ensure "name:" is recognized atomically before syllable_text can match
    header_name: _ => token(prec(10, /[a-zA-Z0-9][a-zA-Z0-9-]*/)),

    header_value: $ => choice(
      $.multiline_header_value_terminated,
      $.single_line_header_value_terminated
    ),

    single_line_header_value_terminated: $ => seq(
      $.single_line_header_value,
      ';'
    ),

    single_line_header_value: _ => /[^;%]*/,

    // Multiline header: end with ;;
    multiline_header_value_terminated: $ => seq(
      $.multiline_header_value,
      ';;'
    ),

    multiline_header_value: _ => /[^;%]*/,

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

    syllable_text: $ => /[^\s${}\\<>%()\[\]]+/,

    // Syllable style tags
    syllable_style_bold: $ => seq(
      '<',
      'b',
      '>',
      optional($.syllable),
      '</',
      'b',
      '>'
    ),
    syllable_style_colored: $ => seq(
      '<',
      'c',
      '>',
      optional($.syllable),
      '</',
      'c',
      '>'
    ),
    syllable_style_italic: $ => seq(
      '<',
      'i',
      '>',
      optional($.syllable),
      '</',
      'i',
      '>'
    ),
    syllable_style_small_caps: $ => seq(
      '<',
      'sc',
      '>',
      optional($.syllable),
      '</',
      'sc',
      '>'
    ),
    syllable_style_teletype: $ => seq(
      '<',
      'tt',
      '>',
      optional($.syllable),
      '</',
      'tt',
      '>'
    ),
    syllable_style_underline: $ => seq(
      '<',
      'ul',
      '>',
      optional($.syllable),
      '</',
      'ul',
      '>'
    ),

    // Syllable controls
    syllable_control_clear: $ => seq(
      '<',
      'clear',
      optional('/'),
      '>'
    ),

    syllable_control_elision: $ => seq(
      '<',
      'e',
      '>',
      optional($.syllable),
      '</',
      'e',
      '>'
    ),

    syllable_control_euouae: $ => seq(
      '<',
      'eu',
      '>',
      optional($.syllable),
      '</',
      'eu',
      '>'
    ),

    syllable_control_no_line_break: $ => seq(
      '<',
      'nlba',
      '>',
      optional($.syllable),
      '</',
      'nlba',
      '>'
    ),

    syllable_control_protrusion: $ => seq(
      '<',
      'pr',
      optional(
        seq(
          ':',
          $.syllable_control_protrusion_value
        )
      ),
      optional('/'),
      '>'
    ),
    syllable_control_protrusion_value: _ => /[0-9]*\.?[0-9]+/,

    // Other tags
    syllable_other_above_lines_text: $ => seq(
      '<',
      'alt',
      '>',
      optional($.syllable),
      '</',
      'alt',
      '>'
    ),
    syllable_other_special_character: $ => seq(
      '<',
      'sp',
      '>',
      optional($.syllable),
      '</',
      'sp',
      '>'
    ),
    syllable_other_verbatim: $ => seq(
      '<',
      'v',
      '>',
      optional($.syllable_verbatim_text),
      '</',
      'v',
      '>'
    ),

    syllable_verbatim_text: _ => /[^<]+/,

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
    snippet_list: $ => choice(
      // Simple case: single GABC snippet (no alternation)
      field('single', $.gabc_snippet),

      // Complex case: alternating snippets
      seq(
        field('first', $.gabc_snippet),
        repeat1(
          seq(
            '|',
            field('alternate', $._alternating_snippet)
          )
        )
      )
    ),

    // Alternating snippet: either GABC or NABC
    // The parser will determine based on content patterns
    _alternating_snippet: $ => choice($.gabc_snippet, $.nabc_snippet),

    // GABC snippet: notes and other GABC elements
    gabc_snippet: $ => repeat1(
      choice(
        $.gabc_neume,
        $.gabc_alteration,
        $._gabc_neume_fusion,
        $.gabc_spacing,
        $._gabc_symbol,
        $.gabc_separation_bar,
        // 6.4.13 Custos
        $._gabc_custos,
        $._gabc_line_break,
        // GABC Attributes
        $.gabc_attribute,
        $._gabc_macro,
        // 6.4.12 Clefs - try AFTER neumes to avoid 'c'/'f' ambiguity
        $._gabc_clef_or_link
      )
    ),

    pitch_lowercase: _ => prec(10, /[a-np]/),
    pitch_uppercase: _ => prec(10, /[A-NP]/),

    // Helper rules for neume modifiers
    _liquescence: $ => choice(
      alias(token.immediate('~'), $.deminutus),
      alias(token.immediate('<'), $.augmented),
      alias(token.immediate('>'), $.diminished)
    ),

    _orientation: $ => choice(
      alias(token.immediate('0'), $.downwards),
      alias(token.immediate('1'), $.upwards)
    ),

    _leaning: $ => choice(
      alias(token.immediate('0'), $.left_leaning),
      alias(token.immediate('1'), $.right_leaning),
      alias(token.immediate('2'), $.non_leaning)
    ),

    // 6.4.2 One-Note Neumes (includes complex neumes from 6.4.5)
    gabc_neume: $ => seq(
      choice(
        // Initio debilis
        seq(
          field('shape', alias('-', $.initio_debilis)),
          field('pitch', $.pitch_lowercase)
        ),
        // Oriscus scapus
        // NOTE: Must be preceded by another gabc_neume or '@'
        seq(
          field('pitch', $.pitch_lowercase),
          field('shape', alias(token.immediate('O'), $.oriscus_scapus)),
          optional(field('orientation', $._orientation))
        ),
        // Quilisma
        // NOTE: Must be followed by another gabc_neume or '@'
        seq(
          field('pitch', $.pitch_lowercase),
          field('shape', alias(token.immediate('w'), $.quilisma))
        ),
        // Quadratum
        // NOTE: Must be followed by another gabc_neume or '@'
        seq(
          field('pitch', $.pitch_lowercase),
          field('shape', alias(token.immediate('q'), $.quadratum))
        ),
        // Quilisma quadratum
        // NOTE: Must be followed by another gabc_neume or '@'
        seq(
          field('pitch', $.pitch_lowercase),
          field('shape', alias(token.immediate('W'), $.quilisma_quadratum))
        ),
        // Punctum inclinatum: upper pitch + optional leaning + optional liquescence
        seq(
          field('pitch', $.pitch_uppercase),
          optional(field('leaning', $._leaning)),
          optional(field('liquescence', $._liquescence))
        ),
        // Oriscus with optional orientation and liquescence
        seq(
          field('pitch', $.pitch_lowercase),
          field('shape', alias(token.immediate('o'), $.oriscus)),
          optional(field('orientation', $._orientation)),
          optional(field('liquescence', $._liquescence))
        ),
        // Stropha variants with optional liquescence
        seq(
          field('pitch', $.pitch_lowercase),
          field('shape', choice(
            alias(token.immediate('s'), $.stropha),
            alias(token.immediate('ss'), $.distropha),
            alias(token.immediate('sss'), $.tristropha)
          )),
          optional(field('liquescence', $._liquescence))
        ),
        // Virga variants
        seq(
          field('pitch', $.pitch_lowercase),
          field('shape', choice(
            alias(token.immediate('v'), $.virga),
            alias(token.immediate('V'), $.virga_reversa),
            alias(token.immediate('vv'), $.bivirga),
            alias(token.immediate('vvv'), $.trivirga)
          ))
        ),
        // Cavum variants
        seq(
          field('pitch', $.pitch_lowercase),
          field('shape', choice(
            alias(token.immediate('r'), $.cavum),
            alias(token.immediate('R'), $.punctum_linea),
            alias(token.immediate('r0'), $.cavum_linea)
          ))
        ),
        // Linea
        seq(
          field('pitch', $.pitch_lowercase),
          field('shape', alias(token.immediate('='), $.linea))
        ),
        // Punctum quadratum: just pitch + optional liquescence (must come last)
        seq(
          field('pitch', $.pitch_lowercase),
          optional(field('liquescence', $._liquescence))
        )
      ),
      // Additional neume signs (punctum mora, ictus, episema, accents, musica ficta)
      repeat(field('extra_symbol', $.gabc_extra_symbol))
    ),

    // 6.4.2.1 Additional Neume Signs
    gabc_extra_symbol: $ => choice(
      $._gabc_extra_symbol_punctum_mora,
      $._gabc_extra_symbol_ictus,
      $._gabc_extra_symbol_episema,
      $._gabc_extra_symbol_accent,
      $._gabc_extra_symbol_musica_ficta
    ),

    // Punctum mora
    _gabc_extra_symbol_punctum_mora: $ => field('name', alias(token.immediate(choice('.', '..')), $.punctum_mora)),

    // Ictus
    _gabc_extra_symbol_ictus: $ => seq(
      field('name', alias(token.immediate("'"), $.ictus)),
      optional(field('modifier', choice(
        alias('0', $.always_below),
        alias('1', $.always_above)
      )))
    ),

    // Episema
    _gabc_extra_symbol_episema: $ => seq(
      field('name', alias(token.immediate('_'), $.episema)),
      repeat(field('modifier', choice(
        alias('0', $.below_note),
        alias('1', $.above_note),
        alias('2', $.disable_bridging),
        alias('3', $.small_left),
        alias('4', $.small_center),
        alias('5', $.small_right)
      )))
    ),

    // Accents above staff
    _gabc_extra_symbol_accent: $ => field('name', choice(
      alias(token.immediate('r1'), $.accent_above_staff),
      alias(token.immediate('r2'), $.accent_grave_above_staff),
      alias(token.immediate('r3'), $.circle_above_staff),
      alias(token.immediate('r4'), $.lower_semicircle_above_staff),
      alias(token.immediate('r5'), $.upper_semicircle_above_staff)
    )),

    // Musica ficta
    _gabc_extra_symbol_musica_ficta: $ => field('name', choice(
      alias(token.immediate('r6'), $.musica_ficta_flat),
      alias(token.immediate('r7'), $.musica_ficta_natural),
      alias(token.immediate('r8'), $.musica_ficta_sharp)
    )),

    // 6.4.3 Alterations
    gabc_alteration: $ => seq(
      field('pitch', $.pitch_lowercase),
      field('alteration', choice(
        alias(token.immediate('#'), $.sharp),
        alias(token.immediate('x'), $.flat),
        alias(token.immediate('y'), $.natural),
        alias(token.immediate('#?'), $.sharp_parenthesized),
        alias(token.immediate('x?'), $.flat_parenthesized),
        alias(token.immediate('y?'), $.natural_parenthesized),
        alias(token.immediate('##'), $.sharp_soft),
        alias(token.immediate('X'), $.flat_soft),
        alias(token.immediate('Y'), $.natural_soft)
      ))
    ),

    // 6.4.6 Neume Fusion
    _gabc_neume_fusion: $ => choice(
      $.gabc_neume_fusion,
      $.gabc_neume_fusion_group
    ),

    gabc_neume_fusion: $ => prec.left(1, seq(
      field('left', choice($.gabc_neume, $.gabc_neume_fusion)),
      '@',
      field('right', $.gabc_neume)
    )),

    gabc_neume_fusion_group: $ => seq(
      '@[',
      repeat1($.gabc_neume),
      ']'
    ),

    // 6.4.7 Neume Spacing
    gabc_spacing: $ => choice(
      field('type', choice(
        alias(token.immediate('! '), $.large_unbreakable_space),
        alias(token.immediate('/0'), $.half_space_same_neume),
        alias(token.immediate('/!'), $.small_space_same_neume),
        alias(token.immediate('//'), $.medium_neume_separation),
        alias(token.immediate('/'), $.small_neume_separation),
        alias(token.immediate('!'), $.zero_space),
        alias(token.immediate(' '), $.large_space),
        $.scaled_large_neume_separation
      ))
    ),

    scaled_large_neume_separation: $ => seq(
      '/[',
      field('factor', $.scale_factor),
      ']'
    ),

    scale_factor: _ => /-?[0-9.]+/,

    // GABC attributes - specific implementations
    gabc_attribute: $ => choice(
      $._gabc_attribute_shape,
      $._gabc_attribute_choral_sign,
      $._gabc_attribute_nabc_choral_sign,
      $._gabc_attribute_brace_over,
      $._gabc_attribute_brace_under,
      $._gabc_attribute_curly_brace_over,
      $._gabc_attribute_curly_brace_over_accent,
      $._gabc_attribute_stem_length,
      $._gabc_attribute_ledger_line_over,
      $._gabc_attribute_ledger_line_under,
      $._gabc_attribute_slur_over,
      $._gabc_attribute_slur_under,
      $._gabc_attribute_horizontal_episema_over,
      $._gabc_attribute_horizontal_episema_under,
      $._gabc_attribute_above_lines_text,
      $._gabc_attribute_verbatim_note,
      $._gabc_attribute_verbatim_glyph,
      $._gabc_attribute_verbatim_element,
      $._gabc_attribute_nocustos,
    ),

    // 6.4.8 Shape Hints
    // [shape:hint]
    _gabc_attribute_shape: $ => seq(
      '[',
      field('name', alias('shape', $.shape)),
      ':',
      field('hint', $.shape_hint),
      ']'
    ),

    shape_hint: $ => choice(
      alias('stroke', $.stroke)
    ),

    // No custos attribute
    // [nocustos]
    _gabc_attribute_nocustos: $ => seq(
      '[',
      field('name', alias('nocustos', $.nocustos)),
      ']'
    ),

    // 6.4.9 Additional symbols (standalone, not attached to neumes)
    _gabc_symbol: $ => repeat1($.gabc_extra_symbol),

    // 6.4.11 Separation Bars
    gabc_separation_bar: $ => seq(
      field('type', choice(
        alias('`', $.virgula),
        alias('`0', $.virgula_upper_ledger_line),
        alias('^', $.divisio_minimis),
        alias('^0', $.divisio_minimis_upper_ledger_line),
        alias(',', $.divisio_minima),
        alias(',0', $.divisio_minima_upper_ledger_line),
        alias(';', $.divisio_minor),
        alias(':', $.divisio_maior),
        alias(':?', $.divisio_maior_dotted),
        alias('::', $.divisio_finalis),
        seq(
          alias(';', $.dominican_bar),
          field('position', $.dominican_bar_position)
        )
      )),
      optional(field('modifier', $._gabc_bar_modifier))
    ),

    dominican_bar_position: _ => /[1-8]/,

    _gabc_bar_modifier: $ => choice(
      alias(token.immediate("'"), $.vertical_episema),
      alias(token.immediate('_'), $.brace)
    ),

    // 6.4.12 Clefs
    _gabc_clef_or_link: $ => choice(
      $.gabc_clef,
      $.gabc_clef_link
    ),

    gabc_clef: $ => choice(
      $._gabc_clef_c1, $._gabc_clef_c2, $._gabc_clef_c3, $._gabc_clef_c4,
      $._gabc_clef_f1, $._gabc_clef_f2, $._gabc_clef_f3, $._gabc_clef_f4,
      $._gabc_clef_cb1, $._gabc_clef_cb2, $._gabc_clef_cb3, $._gabc_clef_cb4
    ),

    _gabc_clef_c1: $ => seq(
      field('name', alias(token(prec(20, 'c1')), $.c_clef)),
      field('position', alias('', $.clef_position))
    ),
    _gabc_clef_c2: $ => seq(
      field('name', alias(token(prec(20, 'c2')), $.c_clef)),
      field('position', alias('', $.clef_position))
    ),
    _gabc_clef_c3: $ => seq(
      field('name', alias(token(prec(20, 'c3')), $.c_clef)),
      field('position', alias('', $.clef_position))
    ),
    _gabc_clef_c4: $ => seq(
      field('name', alias(token(prec(20, 'c4')), $.c_clef)),
      field('position', alias('', $.clef_position))
    ),

    _gabc_clef_f1: $ => seq(
      field('name', alias(token(prec(20, 'f1')), $.f_clef)),
      field('position', alias('', $.clef_position))
    ),
    _gabc_clef_f2: $ => seq(
      field('name', alias(token(prec(20, 'f2')), $.f_clef)),
      field('position', alias('', $.clef_position))
    ),
    _gabc_clef_f3: $ => seq(
      field('name', alias(token(prec(20, 'f3')), $.f_clef)),
      field('position', alias('', $.clef_position))
    ),
    _gabc_clef_f4: $ => seq(
      field('name', alias(token(prec(20, 'f4')), $.f_clef)),
      field('position', alias('', $.clef_position))
    ),

    _gabc_clef_cb1: $ => seq(
      field('name', alias(token(prec(20, 'cb1')), $.c_clef_flat)),
      field('position', alias('', $.clef_position))
    ),
    _gabc_clef_cb2: $ => seq(
      field('name', alias(token(prec(20, 'cb2')), $.c_clef_flat)),
      field('position', alias('', $.clef_position))
    ),
    _gabc_clef_cb3: $ => seq(
      field('name', alias(token(prec(20, 'cb3')), $.c_clef_flat)),
      field('position', alias('', $.clef_position))
    ),
    _gabc_clef_cb4: $ => seq(
      field('name', alias(token(prec(20, 'cb4')), $.c_clef_flat)),
      field('position', alias('', $.clef_position))
    ),

    gabc_clef_link: $ => prec.left(1, seq(
      field('left', choice($.gabc_clef, $.gabc_clef_link)),
      '@',
      field('right', $.gabc_clef)
    )),

    // 6.4.13 Custos
    _gabc_custos: $ => choice(
      alias('z0', $.custos_auto_pitch),
      seq(
        field('pitch', $.pitch_lowercase),
        field('symbol', alias('+', $.custos_symbol))
      )
    ),

    // 6.4.14 Line break
    _gabc_line_break: $ => seq(
      field('type', choice(
        alias('z', $.justified_line_break),
        alias('Z', $.ragged_line_break)
      )),
      optional(field('custos_modifier', choice(
        alias('+', $.force_custos),
        alias('-', $.disable_custos)
      )))
    ),

    // 6.4.15 Choral Signs
    // [cs:text]
    _gabc_attribute_choral_sign: $ => seq(
      '[',
      field('name', alias('cs', $.cs)),
      ':',
      field('text', $.choral_sign_text),
      ']'
    ),

    choral_sign_text: _ => /[^\]]*/,

    // [cn:nabc_code]
    _gabc_attribute_nabc_choral_sign: $ => seq(
      '[',
      field('name', alias('cn', $.cn)),
      ':',
      field('nabc_code', $.nabc_choral_sign_code),
      ']'
    ),

    nabc_choral_sign_code: _ => /[^\]]*/,

    // 6.4.16 Braces
    // [ob:n;size] or [ob:n{] or [ob:n}]
    _gabc_attribute_brace_over: $ => seq(
      '[',
      field('name', alias('ob', $.ob)),
      ':',
      field('position', choice('0', '1')),
      choice(
        seq(';', field('size', $.brace_size)),
        '{',
        '}'
      ),
      ']'
    ),

    brace_size: _ => /[^\]]+/,

    // [ub:n;size] or [ub:n{] or [ub:n}]
    _gabc_attribute_brace_under: $ => seq(
      '[',
      field('name', alias('ub', $.ub)),
      ':',
      field('position', choice('0', '1')),
      choice(
        seq(';', field('size', $.brace_size)),
        '{',
        '}'
      ),
      ']'
    ),

    // [ocb:n;size] or [ocb:n{] or [ocb:n}]
    _gabc_attribute_curly_brace_over: $ => seq(
      '[',
      field('name', alias('ocb', $.ocb)),
      ':',
      field('position', choice('0', '1')),
      choice(
        seq(';', field('size', $.brace_size)),
        '{',
        '}'
      ),
      ']'
    ),

    // [ocba:n;size] or [ocba:n{] or [ocba:n}]
    _gabc_attribute_curly_brace_over_accent: $ => seq(
      '[',
      field('name', alias('ocba', $.ocba)),
      ':',
      field('position', choice('0', '1')),
      choice(
        seq(';', field('size', $.brace_size)),
        '{',
        '}'
      ),
      ']'
    ),

    // 6.4.17 Stem Length
    // [ll:0] or [ll:1]
    _gabc_attribute_stem_length: $ => seq(
      '[',
      field('name', alias('ll', $.ll)),
      ':',
      field('value', choice('0', '1')),
      ']'
    ),

    // 6.4.18 Custom Ledger Lines
    // [oll:left;right] or [oll:left{right] or [oll:}]
    _gabc_attribute_ledger_line_over: $ => seq(
      '[',
      field('name', alias('oll', $.oll)),
      ':',
      choice(
        seq(
          field('left', $.ledger_line_left),
          choice(
            seq(';', field('right', $.ledger_line_right)),
            seq('{', optional(field('right', $.ledger_line_right)))
          )
        ),
        '}'
      ),
      ']'
    ),

    ledger_line_left: _ => /[^\];{}]+/,
    ledger_line_right: _ => /[^\]]+/,

    // [ull:left;right] or [ull:left{right] or [ull:}]
    _gabc_attribute_ledger_line_under: $ => seq(
      '[',
      field('name', alias('ull', $.ull)),
      ':',
      choice(
        seq(
          field('left', $.ledger_line_left),
          choice(
            seq(';', field('right', $.ledger_line_right)),
            seq('{', optional(field('right', $.ledger_line_right)))
          )
        ),
        '}'
      ),
      ']'
    ),

    // 6.4.19 Simple Slurs
    // [oslur:shift;width,height] or [oslur:shift{] or [oslur:shift}]
    _gabc_attribute_slur_over: $ => seq(
      '[',
      field('name', alias('oslur', $.oslur)),
      ':',
      field('shift', choice('0', '1', '2')),
      choice(
        seq(';', field('dimensions', $.slur_dimensions)),
        '{',
        '}'
      ),
      ']'
    ),

    slur_dimensions: _ => /[^\]]+/,

    // [uslur:shift;width,height] or [uslur:shift{] or [uslur:shift}]
    _gabc_attribute_slur_under: $ => seq(
      '[',
      field('name', alias('uslur', $.uslur)),
      ':',
      field('shift', choice('0', '1', '2')),
      choice(
        seq(';', field('dimensions', $.slur_dimensions)),
        '{',
        '}'
      ),
      ']'
    ),

    // 6.4.21 Horizontal Episema Tuning
    // [oh:p] or [oh:p{] or [oh]} or [oh{] or [oh}]
    _gabc_attribute_horizontal_episema_over: $ => seq(
      '[',
      field('name', alias('oh', $.oh)),
      optional(seq(
        ':',
        field('position', $.episema_position)
      )),
      optional(choice('{', '}')),
      ']'
    ),

    episema_position: _ => /[^\]{}]+/,

    // [uh:p] or [uh:p{] or [uh]} or [uh{] or [uh}]
    _gabc_attribute_horizontal_episema_under: $ => seq(
      '[',
      field('name', alias('uh', $.uh)),
      optional(seq(
        ':',
        field('position', $.episema_position)
      )),
      optional(choice('{', '}')),
      ']'
    ),

    // 6.4.22 Above Lines Text within notes
    // [alt:text]
    _gabc_attribute_above_lines_text: $ => seq(
      '[',
      field('name', alias('alt', $.alt)),
      ':',
      field('text', $.above_lines_text),
      ']'
    ),

    above_lines_text: _ => /[^\]]*/,

    // 6.4.23 Verbatim TeX
    // [nv:tex_code]
    _gabc_attribute_verbatim_note: $ => seq(
      '[',
      field('name', alias('nv', $.nv)),
      ':',
      field('tex_code', $.verbatim_tex_code),
      ']'
    ),

    verbatim_tex_code: _ => /[^\]]*/,

    // [gv:tex_code]
    _gabc_attribute_verbatim_glyph: $ => seq(
      '[',
      field('name', alias('gv', $.gv)),
      ':',
      field('tex_code', $.verbatim_tex_code),
      ']'
    ),

    // [ev:tex_code]
    _gabc_attribute_verbatim_element: $ => seq(
      '[',
      field('name', alias('ev', $.ev)),
      ':',
      field('tex_code', $.verbatim_tex_code),
      ']'
    ),

    // 6.4.24 Macros
    _gabc_macro: $ => seq(
      '[',
      seq(
        choice(
          'nm', // Note Level
          'gm', // Glyph Level
          'em', // Element Level
          'altm' // Element Level (alt syntax)
        ),
        /[0-9]/
      ),
      ']'
    ),

    /* ========================================================================================

    NABC NOTATION RULES

    ======================================================================================== */

    // NABC snippet: sequence of complex glyph descriptors
    nabc_snippet: $ => repeat1($.nabc_complex_glyph_descriptor),

    // Complex glyph descriptor
    nabc_complex_glyph_descriptor: $ => seq(
      optional($.nabc_horizontal_spacing_adjustment),
      choice($.nabc_glyph_descriptor, $.nabc_glyph_fusion),
      optional($.nabc_subpunctis_prepunctis_sequence),
      optional($.nabc_significant_letter_sequence)
    ),

    // Horizontal spacing adjustment
    nabc_horizontal_spacing_adjustment: $ => repeat1(choice('//', '/', '``', '`')),

    // Glyph descriptor
    nabc_glyph_descriptor: $ => seq(
      field('basic_glyph_descriptor', $._nabc_basic_glyph_descriptor),
      optional(field('glyph_modifiers', $.glyph_modifiers)),
      optional(field('pitch_descriptor', $.pitch_descriptor))
    ),

    // NABC glyph fusion (similar to GABC neume fusion)
    nabc_glyph_fusion: $ => prec.left(1, seq(
      field('left', choice($.nabc_glyph_descriptor, $.nabc_glyph_fusion)),
      '!',
      field('right', $.nabc_glyph_descriptor)
    )),

    // NABC basic glyph descriptor (St. Gall or Laon glyph codes with semantic aliases)
    _nabc_basic_glyph_descriptor: $ => choice(
      alias('vi', $.virga),
      alias('pu', $.punctum),
      alias('ta', $.tractulus),
      alias('gr', $.gravis),
      alias('cl', $.clivis),
      alias('pe', $.pes),
      alias('po', $.porrectus),
      alias('to', $.torculus),
      alias('ci', $.climacus),
      alias('sc', $.scandicus),
      alias('pf', $.porrectus_flexus),
      alias('sf', $.scandicus_flexus),
      alias('tr', $.torculus_resupinus),
      alias('st', $.stropha),
      alias('ds', $.distropha),
      alias('ts', $.tristropha),
      alias('tg', $.trigonus),
      alias('bv', $.bivirga),
      alias('tv', $.trivirga),
      alias('pr', $.pressus_maior),
      alias('pi', $.pressus_minor),
      alias('vs', $.virga_strata),
      alias('or', $.oriscus),
      alias('sa', $.salicus),
      alias('pq', $.pes_quassus),
      alias('ql', $.quilisma_3_loops),
      alias('qi', $.quilisma_2_loops),
      alias('pt', $.pes_stratus),
      alias('ni', $.nihil),
      alias('un', $.uncinus),
      alias('oc', $.oriscus_clivis)
    ),

    // Glyph modifiers
    glyph_modifiers: $ => seq(
      repeat1(field('type', choice(
        alias('S', $.mark_modification),
        alias('G', $.grouping_modification),
        alias('M', $.melodic_modification),
        alias('-', $.episema),
        alias('>', $.augmentive_liquescence),
        alias('~', $.diminutive_liquescence)
      ))),
      optional(field('variant', alias(/[1-9]/, $.variant_number)))
    ),

    // Pitch descriptor: h followed by pitch letter
    pitch_descriptor: $ => seq('h', field('pitch', $.pitch_lowercase)),

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

