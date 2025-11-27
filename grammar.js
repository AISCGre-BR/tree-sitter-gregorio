module.exports = grammar({
  name: 'gregorio',

  extras: $ => [
    /\s/,
    $.comment
  ],

  conflicts: $ => [
    // `_gabc_bar` may be followed by `_gabc_bar_modifier` which can create ambiguities
    [$._gabc_bar],
    // `_gabc_line_break` may be followed by `_gabc_line_break_modifier` which can create ambiguities
    [$._gabc_line_break],
    // `gabc_snippet` can have repetition ambiguities with symbols
    [$.gabc_snippet],
    // Spacing and NABC horizontal spacing can conflict with '/' characters
    [$.gabc_spacing_small_neume_separation, $.nabc_horizontal_spacing_adjustment],
    [$.gabc_spacing_medium_neume_separation, $.nabc_horizontal_spacing_adjustment],
    // Bar virgula and NABC horizontal spacing can conflict with '`' characters
    [$.gabc_bar_virgula, $.nabc_horizontal_spacing_adjustment],
    // NABC complex glyph descriptor can have ambiguities with subpunctis/prepunctis sequences
    [$.nabc_complex_glyph_descriptor],
    // NABC subpunctis/prepunctis sequence can have repetition ambiguities
    [$.nabc_subpunctis_prepunctis_sequence],
    // NABC significant letter sequence can have repetition ambiguities
    [$.nabc_significant_letter_sequence],
    // St. Gall and Laon significant letter shorthands can overlap
    [$.nabc_st_gall_ls_shorthand, $.nabc_laon_ls_shorthand],
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
      $.header_field_separator,
      field('value', $.header_value)
    ),
    header_field_separator: _ => ':',

    header_name: _ => /[a-zA-Z0-9][a-zA-Z0-9-]*/,

    header_value: $ => choice(
      $.multiline_header_value_terminated,
      $.single_line_header_value_terminated
    ),

    single_line_header_value_terminated: $ => seq(
      $.single_line_header_value,
      $.single_line_header_terminator
    ),

    single_line_header_value: _ => /[^;%]*/,

    single_line_header_terminator: _ => ';',

    // Multiline header: end with ;;
    multiline_header_value_terminated: $ => seq(
      $.multiline_header_value,
      $.multiline_header_terminator
    ),

    multiline_header_value: _ => /[^;%]*/,

    multiline_header_terminator: _ => ';;',

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

    syllable_text: $ => /[^\s${}\\<>%():;\[\]]+/,

    // Tag components (reusable)
    tag_opening_bracket: _ => '<',
    tag_closing_bracket: _ => '>',
    closing_tag_opening_bracket: _ => '</',

    // Tag names
    tag_bold_name: _ => 'b',
    tag_colored_name: _ => 'c',
    tag_italic_name: _ => 'i',
    tag_small_caps_name: _ => 'sc',
    tag_teletype_name: _ => 'tt',
    tag_underline_name: _ => 'ul',
    tag_elision_name: _ => 'e',
    tag_euouae_name: _ => 'eu',
    tag_no_line_break_name: _ => 'nlba',
    tag_above_lines_text_name: _ => 'alt',
    tag_special_character_name: _ => 'sp',
    tag_verbatim_name: _ => 'v',
    tag_clear_name: _ => 'clear',
    tag_protrusion_name: _ => 'pr',

    // Self-closing tag components
    self_closing_tag_slash: _ => '/',

    // Syllable style tags
    syllable_style_bold: $ => seq(
      $.tag_opening_bracket,
      $.tag_bold_name,
      $.tag_closing_bracket,
      optional($.syllable),
      $.closing_tag_opening_bracket,
      $.tag_bold_name,
      $.tag_closing_bracket
    ),
    syllable_style_colored: $ => seq(
      $.tag_opening_bracket,
      $.tag_colored_name,
      $.tag_closing_bracket,
      optional($.syllable),
      $.closing_tag_opening_bracket,
      $.tag_colored_name,
      $.tag_closing_bracket
    ),
    syllable_style_italic: $ => seq(
      $.tag_opening_bracket,
      $.tag_italic_name,
      $.tag_closing_bracket,
      optional($.syllable),
      $.closing_tag_opening_bracket,
      $.tag_italic_name,
      $.tag_closing_bracket
    ),
    syllable_style_small_caps: $ => seq(
      $.tag_opening_bracket,
      $.tag_small_caps_name,
      $.tag_closing_bracket,
      optional($.syllable),
      $.closing_tag_opening_bracket,
      $.tag_small_caps_name,
      $.tag_closing_bracket
    ),
    syllable_style_teletype: $ => seq(
      $.tag_opening_bracket,
      $.tag_teletype_name,
      $.tag_closing_bracket,
      optional($.syllable),
      $.closing_tag_opening_bracket,
      $.tag_teletype_name,
      $.tag_closing_bracket
    ),
    syllable_style_underline: $ => seq(
      $.tag_opening_bracket,
      $.tag_underline_name,
      $.tag_closing_bracket,
      optional($.syllable),
      $.closing_tag_opening_bracket,
      $.tag_underline_name,
      $.tag_closing_bracket
    ),

    // Syllable controls
    syllable_control_clear: $ => seq(
      $.tag_opening_bracket,
      $.tag_clear_name,
      optional($.self_closing_tag_slash),
      $.tag_closing_bracket
    ),

    syllable_control_elision: $ => seq(
      $.tag_opening_bracket,
      $.tag_elision_name,
      $.tag_closing_bracket,
      optional($.syllable),
      $.closing_tag_opening_bracket,
      $.tag_elision_name,
      $.tag_closing_bracket
    ),

    syllable_control_euouae: $ => seq(
      $.tag_opening_bracket,
      $.tag_euouae_name,
      $.tag_closing_bracket,
      optional($.syllable),
      $.closing_tag_opening_bracket,
      $.tag_euouae_name,
      $.tag_closing_bracket
    ),

    syllable_control_no_line_break: $ => seq(
      $.tag_opening_bracket,
      $.tag_no_line_break_name,
      $.tag_closing_bracket,
      optional($.syllable),
      $.closing_tag_opening_bracket,
      $.tag_no_line_break_name,
      $.tag_closing_bracket
    ),

    syllable_control_protrusion: $ => seq(
      $.tag_opening_bracket,
      $.tag_protrusion_name,
      optional(
        seq(
          $.syllable_control_protrusion_delimiter,
          $.syllable_control_protrusion_value
        )
      ),
      optional($.self_closing_tag_slash),
      $.tag_closing_bracket
    ),

    syllable_control_protrusion_delimiter: _ => ':',
    syllable_control_protrusion_value: _ => /[0-9]*\.?[0-9]+/,

    // Other tags
    syllable_other_above_lines_text: $ => seq(
      $.tag_opening_bracket,
      $.tag_above_lines_text_name,
      $.tag_closing_bracket,
      optional($.syllable),
      $.closing_tag_opening_bracket,
      $.tag_above_lines_text_name,
      $.tag_closing_bracket
    ),
    syllable_other_special_character: $ => seq(
      $.tag_opening_bracket,
      $.tag_special_character_name,
      $.tag_closing_bracket,
      optional($.syllable),
      $.closing_tag_opening_bracket,
      $.tag_special_character_name,
      $.tag_closing_bracket
    ),
    syllable_other_verbatim: $ => seq(
      $.tag_opening_bracket,
      $.tag_verbatim_name,
      $.tag_closing_bracket,
      optional($.syllable_verbatim_text),
      $.closing_tag_opening_bracket,
      $.tag_verbatim_name,
      $.tag_closing_bracket
    ),

    syllable_verbatim_text: _ => /[^<]+/,

    // Translation text: [text]
    syllable_translation: $ => seq(
      $.syllable_translation_opening_bracket,
      optional($.syllable_translation_text),
      $.syllable_translation_closing_bracket
    ),

    syllable_translation_text: _ => /[^\]]*/,
    syllable_translation_opening_bracket: _ => '[',
    syllable_translation_closing_bracket: _ => ']',

    // Lyric centering: {text}
    syllable_centering: $ => seq(
      $.open_curly_brace,
      optional($.syllable_centering_text),
      $.close_curly_brace
    ),

    syllable_centering_text: _ => /[^}]*/,
    open_curly_brace: _ => '{',
    close_curly_brace: _ => '}',

    // Escape sequence: $ followed by character
    syllable_escape_sequence: _ => seq('$', /./),

    // Note group: (notes) - can contain GABC and/or NABC snippets
    note_group: $ => seq(
      $.note_group_opening_paren,
      optional($.snippet_list),
      $.note_group_closing_paren
    ),

    note_group_opening_paren: _ => '(',
    note_group_closing_paren: _ => ')',

    // Snippet list: GABC snippets and/or NABC snippets separated by |
    snippet_list: $ => choice(
      // Simple case: single GABC snippet (no alternation)
      field('single', $.gabc_snippet),

      // Complex case: alternating snippets
      seq(
        field('first', $.gabc_snippet),
        repeat1(
          seq(
            $.gabc_nabc_separator,
            field('alternate', $._alternating_snippet)
          )
        )
      )
    ),

    gabc_nabc_separator: _ => '|',

    // Alternating snippet: either GABC or NABC
    // The parser will determine based on content patterns
    _alternating_snippet: $ => choice($.gabc_snippet, $.nabc_snippet),

    // GABC snippet: notes and other GABC elements
    gabc_snippet: $ => repeat1(
      choice(
        $._gabc_neume,
        $._gabc_alteration,
        $._gabc_complex_neume,
        $._gabc_neume_fusion,
        $._gabc_spacing,
        $._gabc_symbol,
        $._gabc_bar,
        // 6.4.12 Clefs
        $.gabc_clef,
        // 6.4.13 Custos
        $._gabc_custos,
        $._gabc_line_break,
        // GABC Attributes
        $.gabc_attribute,
        $._gabc_macro
      )
    ),

    pitch: _ => /[a-np]/,
    pitch_upper: _ => /[A-NP]/,

    // 6.4.2 One-Note Neumes
    _gabc_neume: $ => choice(
      $.gabc_neume_punctum_quadratum,
      $.gabc_neume_punctum_inclinatum,
      $.gabc_neume_oriscus,
      $.gabc_neume_oriscus_scapus,
      $.gabc_neume_quilisma,
      $.gabc_neume_virga,
      $.gabc_neume_virga_reversa,
      $.gabc_neume_bivirga,
      $.gabc_neume_trivirga,
      $.gabc_neume_stropha,
      $.gabc_neume_distropha,
      $.gabc_neume_tristropha,
      $.gabc_neume_punctum_cavum,
      $.gabc_neume_punctum_quadratum_surrounded,
      $.gabc_neume_punctum_cavum_surrounded,
      $.gabc_neume_liquescent_deminutus,
      $.gabc_neume_liquescent_augmented,
      $.gabc_neume_liquescent_diminished,
      $.gabc_neume_linea,
    ),

    gabc_neume_punctum_quadratum: $ => $.pitch,

    gabc_neume_punctum_inclinatum: $ => seq(
      $.pitch_upper,
      optional($._gabc_neume_punctum_inclinatum_leaning)
    ),
    _gabc_neume_punctum_inclinatum_leaning: $ => choice(
      $.gabc_neume_punctum_inclinatum_left_leaning,
      $.gabc_neume_punctum_inclinatum_right_leaning,
      $.gabc_neume_punctum_inclinatum_no_leaning,
    ),
    gabc_neume_punctum_inclinatum_left_leaning: _ => '0',
    gabc_neume_punctum_inclinatum_right_leaning: _ => '1',
    gabc_neume_punctum_inclinatum_no_leaning: _ => '2',

    gabc_neume_oriscus: $ => seq(
      $.pitch,
      'o',
      optional($._gabc_neume_oriscus_direction)
    ),

    gabc_neume_oriscus_scapus: $ => seq(
      $.pitch,
      'O',
      optional($._gabc_neume_oriscus_direction)
    ),

    _gabc_neume_oriscus_direction: $ => choice(
      $.gabc_neume_oriscus_downwards_pointing,
      $.gabc_neume_oriscus_upwards_pointing,
    ),

    gabc_neume_oriscus_downwards_pointing: _ => '0',
    gabc_neume_oriscus_upwards_pointing: _ => '1',

    gabc_neume_quilisma: $ => seq($.pitch, 'w'),
    gabc_neume_virga: $ => seq($.pitch, 'v'),
    gabc_neume_virga_reversa: $ => seq($.pitch, 'V'),
    gabc_neume_bivirga: $ => seq($.pitch, 'vv'),
    gabc_neume_trivirga: $ => seq($.pitch, 'vvv'),
    gabc_neume_stropha: $ => seq($.pitch, 's'),
    gabc_neume_distropha: $ => seq($.pitch, 'ss'),
    gabc_neume_tristropha: $ => seq($.pitch, 'sss'),
    gabc_neume_punctum_cavum: $ => seq($.pitch, 'r'),
    gabc_neume_punctum_quadratum_surrounded: $ => seq($.pitch, 'R'),
    gabc_neume_punctum_cavum_surrounded: $ => seq($.pitch, 'r0'),
    // Liquescents
    gabc_neume_liquescent_deminutus: $ => seq($.pitch, '~'),
    gabc_neume_liquescent_augmented: $ => seq($.pitch, '<'),
    gabc_neume_liquescent_diminished: $ => seq($.pitch, '>'),
    // Other
    gabc_neume_linea: $ => seq($.pitch, '='),

    // 6.4.3 Alterations
    _gabc_alteration: $ => choice(
      $.gabc_alteration_sharp,
      $.gabc_alteration_flat,
      $.gabc_alteration_natural,
      $.gabc_alteration_sharp_parenthesized,
      $.gabc_alteration_flat_parenthesized,
      $.gabc_alteration_natural_parenthesized,
      $.gabc_alteration_sharp_soft,
      $.gabc_alteration_flat_soft,
      $.gabc_alteration_natural_soft,
    ),
    gabc_alteration_sharp: $ => seq($.pitch, '#'),
    gabc_alteration_flat: $ => seq($.pitch, 'x'),
    gabc_alteration_natural: $ => seq($.pitch, 'y'),
    gabc_alteration_sharp_parenthesized: $ => seq($.pitch, '#?'),
    gabc_alteration_flat_parenthesized: $ => seq($.pitch, 'x?'),
    gabc_alteration_natural_parenthesized: $ => seq($.pitch, 'y?'),
    gabc_alteration_sharp_soft: $ => seq($.pitch, '##'),
    gabc_alteration_flat_soft: $ => seq($.pitch, 'X'),
    gabc_alteration_natural_soft: $ => seq($.pitch, 'Y'),

    // 6.4.5 Complex Neumes
    _gabc_complex_neume: $ => choice(
      $.gabc_complex_neume_initio_debilis,
      $.gabc_complex_neume_quadratum,
      $.gabc_complex_neume_quilisma_quadratum,
    ),

    gabc_complex_neume_initio_debilis: $ => seq('-', $.pitch),
    gabc_complex_neume_quadratum: $ => seq($.pitch, 'q'),
    gabc_complex_neume_quilisma_quadratum: $ => seq($.pitch, 'W'),

    // 6.4.6 Neume Fusion
    _gabc_neume_fusion: $ => choice(
      $.gabc_neume_fusion_delimiter,
      $.gabc_neume_fusion_group
    ),

    gabc_neume_fusion_delimiter: _ => '@',

    gabc_neume_fusion_group: $ => seq(
      $.gabc_neume_fusion_opening_bracket,
      $.gabc_snippet,
      $.gabc_neume_fusion_closing_bracket
    ),

    gabc_neume_fusion_opening_bracket: _ => '@[',
    gabc_neume_fusion_closing_bracket: _ => ']',

    // 6.4.7 Neume Spacing
    _gabc_spacing: $ => choice(
      $.gabc_spacing_half_space_same_neume,
      $.gabc_spacing_small_space_same_neume,
      $.gabc_spacing_small_neume_separation,
      $.gabc_spacing_medium_neume_separation,
      $.gabc_spacing_large_neume_separation,
      $.gabc_spacing_zero_space
    ),

    gabc_spacing_half_space_same_neume: _ => '/0',
    gabc_spacing_small_space_same_neume: _ => '/!',
    gabc_spacing_small_neume_separation: _ => '/',
    gabc_spacing_medium_neume_separation: _ => '//',
    gabc_spacing_zero_space: _ => '!',

    gabc_spacing_large_neume_separation: $ => seq(
      $.gabc_spacing_large_neume_separation_opening_bracket,
      $.gabc_spacing_large_neume_separation_factor,
      $.gabc_spacing_large_neume_separation_closing_bracket
    ),

    gabc_spacing_large_neume_separation_opening_bracket: _ => '/[',
    gabc_spacing_large_neume_separation_factor: _ => /-?[0-9.]+/,
    gabc_spacing_large_neume_separation_closing_bracket: _ => ']',

    // GABC attributes
    gabc_attribute: $ => seq(
      $.gabc_attribute_opening_bracket,
      field('name', /[a-zA-Z0-9-]+/),
      $.gabc_attribute_separator,
      field('value', /[^]]*/),
      $.gabc_attribute_closing_bracket
    ),

    gabc_attribute_opening_bracket: _ => '[',
    gabc_attribute_separator: _ => ':',
    gabc_attribute_closing_bracket: _ => ']',

    // 6.4.8 Shape Hints
    // (gabc_attribute name: "shape")

    // 6.4.9 Additional symbols
    _gabc_symbol: $ => repeat1(
      choice(
        $.gabc_symbol_punctum_mora,
        $.gabc_symbol_ictus,
        $.gabc_symbol_episema,
        $.gabc_symbol_accent_above_staff,
        $.gabc_symbol_accent_grave_above_staff,
        $.gabc_symbol_circle_above_staff,
        $.gabc_symbol_lower_semicircle_above_staff,
        $.gabc_symbol_upper_semicircle_above_staff,
        $.gabc_symbol_musica_ficta_flat,
        $.gabc_symbol_musica_ficta_natural,
        $.gabc_symbol_musica_ficta_sharp
      )
    ),

    // 6.4.10 Rhythmic Signs

    // Punctum mora
    gabc_symbol_punctum_mora: _ => choice('.', '..'),

    // Ictus
    gabc_symbol_ictus: $ => seq(
      "'",
      optional($._gabc_symbol_ictus_modifier)
    ),

    _gabc_symbol_ictus_modifier: $ => choice(
      $.gabc_symbol_ictus_modifier_force_below,
      $.gabc_symbol_ictus_modifier_force_above
    ),

    gabc_symbol_ictus_modifier_force_below: _ => "0",
    gabc_symbol_ictus_modifier_force_above: _ => "1",

    // Episema
    gabc_symbol_episema: $ => seq(
      '_',
      repeat($._gabc_symbol_episema_modifier)
    ),

    _gabc_symbol_episema_modifier: $ => choice(
      $.gabc_symbol_episema_modifier_force_below,
      $.gabc_symbol_episema_modifier_force_above,
      $.gabc_symbol_episema_modifier_no_bridging,
      $.gabc_symbol_episema_modifier_small_left,
      $.gabc_symbol_episema_modifier_small_center,
      $.gabc_symbol_episema_modifier_small_right
    ),

    gabc_symbol_episema_modifier_force_below: _ => '0',
    gabc_symbol_episema_modifier_force_above: _ => '1',
    gabc_symbol_episema_modifier_no_bridging: _ => '2',
    gabc_symbol_episema_modifier_small_left: _ => '3',
    gabc_symbol_episema_modifier_small_center: _ => '4',
    gabc_symbol_episema_modifier_small_right: _ => '5',

    // Accents above staff
    gabc_symbol_accent_above_staff: _ => 'r1',
    gabc_symbol_accent_grave_above_staff: _ => 'r2',
    gabc_symbol_circle_above_staff: _ => 'r3',
    gabc_symbol_lower_semicircle_above_staff: _ => 'r4',
    gabc_symbol_upper_semicircle_above_staff: _ => 'r5',

    // Musica ficta
    gabc_symbol_musica_ficta_flat: _ => 'r6',
    gabc_symbol_musica_ficta_natural: _ => 'r7',
    gabc_symbol_musica_ficta_sharp: _ => 'r8',

    // 6.4.11 Separation Bars
    _gabc_bar: $ => seq(
      choice(
        $.gabc_bar_virgula,
        $.gabc_bar_virgula_ledger_line_above,
        $.gabc_bar_divisio_minimis,
        $.gabc_bar_divisio_minimis_ledger_line_above,
        $.gabc_bar_divisio_minima,
        $.gabc_bar_divisio_minima_ledger_line_above,
        $.gabc_bar_divisio_minor,
        $.gabc_bar_divisio_maior,
        $.gabc_bar_divisio_maior_dotted,
        $.gabc_bar_divisio_finalis,
        $.gabc_bar_dominican
      ),
      optional($._gabc_bar_modifier)
    ),

    gabc_bar_virgula: _ => '`',
    gabc_bar_virgula_ledger_line_above: _ => '`0',
    gabc_bar_divisio_minimis: _ => '^',
    gabc_bar_divisio_minimis_ledger_line_above: _ => '^0',
    gabc_bar_divisio_minima: _ => ',',
    gabc_bar_divisio_minima_ledger_line_above: _ => ',0',
    gabc_bar_divisio_minor: _ => ';',
    gabc_bar_divisio_maior: _ => ':',
    gabc_bar_divisio_maior_dotted: _ => ':?',
    gabc_bar_divisio_finalis: _ => '::',
    gabc_bar_dominican: $ => seq(';', $.gabc_bar_dominican_position),
    gabc_bar_dominican_position: _ => /[1-8]/,

    _gabc_bar_modifier: $ => choice(
      $.gabc_bar_modifier_episema,
      $.gabc_bar_modifier_brace,
    ),

    gabc_bar_modifier_episema: _ => "'",
    gabc_bar_modifier_brace: _ => '_',

    // 6.4.12 Clefs
    gabc_clef: _ => prec(1, token(seq(
      /[cf]/,
      optional('b'),
      /[1-4]/
    ))),
    // TODO: implement clef composition e.g. (c2@c4)

    // 6.4.13 Custos
    _gabc_custos: $ => choice(
      $.gabc_custos_automatic,
      $.gabc_custos_manual,
      $.gabc_custos_disable
    ),

    gabc_custos_automatic: _ => 'z0',
    gabc_custos_manual: $ => seq($.pitch, '+'),
    gabc_custos_disable: _ => '[nocustos]',

    // 6.4.14 Line break
    _gabc_line_break: $ => seq(
      choice(
        $.gabc_line_break_justified,
        $.gabc_line_break_ragged,
      ),
      optional($._gabc_line_break_modifier)
    ),

    gabc_line_break_justified: _ => 'z',
    gabc_line_break_ragged: _ => 'Z',

    _gabc_line_break_modifier: $ => choice(
      $.gabc_line_break_modifier_force_custos,
      $.gabc_line_break_modifier_disable_custos
    ),

    gabc_line_break_modifier_force_custos: _ => '+',
    gabc_line_break_modifier_disable_custos: _ => '-',

    // 6.4.15 Choral Signs
    // (gabc_attribute name: "cs")
    // (gabc_attribute name: "cn")

    // 6.4.16 Braces
    // (gabc_attribute name: "ob")
    // (gabc_attribute name: "ub")
    // (gabc_attribute name: "ocb")
    // (gabc_attribute name: "ocba")

    // 6.4.17 Stem length for the bottom lines
    // (gabc_attribute name: "ll")

    // 6.4.18 Custom Ledger Lines
    // (gabc_attribute name: "oll")
    // (gabc_attribute name: "ull")

    // 6.4.19 Simple Slurs
    // (gabc_attribute name: "oslur")
    // (gabc_attribute name: "uslur")

    // 6.4.21 Horizontal Episema Tuning
    // (gabc_attribute name: "oh")
    // (gabc_attribute name: "uh")

    // 6.4.22 Above LinesTextWithin Notes
    // (gabc_attribute name: "alt")

    // 6.4.23 Verbatim TeX
    // (gabc_attribute name: "nv")
    // (gabc_attribute name: "gv")
    // (gabc_attribute name: "ev")

    // 6.4.24 Macros
    _gabc_macro: $ => seq(
      $.gabc_macro_opening_bracket,
      seq(
        choice(
          $.gabc_macro_note_level,
          $.gabc_macro_glyph_level,
          $.gabc_macro_element_level,
          $.gabc_macro_element_level_alt
        ),
        /[0-9]/
      ),
      $.gabc_macro_closing_bracket
    ),

    gabc_macro_opening_bracket: _ => '[',
    gabc_macro_closing_bracket: _ => ']',
    gabc_macro_note_level: _ => 'nm',
    gabc_macro_glyph_level: _ => 'gm',
    gabc_macro_element_level: _ => 'em',
    gabc_macro_element_level_alt: _ => 'altm',


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

