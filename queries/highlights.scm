; ============================================================================
; TREE-SITTER HIGHLIGHTING QUERIES FOR GABC+NABC
; ============================================================================
; Queries compatible with the refactored grammar (v0.4.0+)
; Based on actual nodes from grammar.js after anonymous rule changes

; ============================================================================
; HEADERS
; ============================================================================

(header_name) @attribute

; Numeric header values
(header_value_numeric) @number

(section_separator) @punctuation.special

; ============================================================================
; GABC NOTATION - PITCHES
; ============================================================================

(pitch_lowercase) @constant.builtin
(pitch_uppercase) @constant.builtin

; ============================================================================
; GABC NOTATION - CLEFS
; ============================================================================

(c_clef) @keyword.directive
(f_clef) @keyword.directive
(c_clef_flat) @keyword.directive

; ============================================================================
; GABC NOTATION - SEPARATION BARS
; ============================================================================

(virgula) @punctuation.special
(virgula_upper_ledger_line) @punctuation.special
(divisio_minimis) @punctuation.special
(divisio_minimis_upper_ledger_line) @punctuation.special
(divisio_minima) @punctuation.special
(divisio_minor) @punctuation.special
(divisio_maior) @punctuation.special
(divisio_maior_dotted) @punctuation.special
(divisio_finalis) @punctuation.special
(dominican_bar) @punctuation.special

; Bar modifiers
(vertical_episema) @attribute
(brace) @punctuation.bracket

; ============================================================================
; GABC NOTATION - CUSTOS
; ============================================================================

(custos_auto_pitch) @keyword.directive
(custos_symbol) @keyword.directive
(force_custos) @keyword.control
(disable_custos) @keyword.control

; ============================================================================
; GABC NOTATION - LINE BREAKS
; ============================================================================

(justified_line_break) @keyword.control
(ragged_line_break) @keyword.control

; ============================================================================
; GABC NOTATION - SPACING
; ============================================================================

(small_neume_separation) @punctuation.delimiter
(medium_neume_separation) @punctuation.delimiter
(large_space) @punctuation.delimiter
(large_unbreakable_space) @punctuation.delimiter
(half_space_same_neume) @punctuation.delimiter
(small_space_same_neume) @punctuation.delimiter
(zero_space) @punctuation.delimiter
(scaled_large_neume_separation) @punctuation.delimiter

; ============================================================================
; GABC NOTATION - ALTERATIONS
; ============================================================================

(natural) @operator
(flat) @operator
(sharp) @operator
(natural_parenthesized) @operator
(flat_parenthesized) @operator
(sharp_parenthesized) @operator
(natural_soft) @operator
(flat_soft) @operator
(sharp_soft) @operator

; Musica ficta
(musica_ficta_natural) @operator
(musica_ficta_flat) @operator
(musica_ficta_sharp) @operator

; ============================================================================
; GABC NOTATION - EXTRA SYMBOLS
; ============================================================================

; Punctum mora
(punctum_mora) @attribute

; Ictus
(ictus) @attribute
(always_below) @attribute
(always_above) @attribute

; Episema
(episema) @attribute
(below_note) @attribute
(above_note) @attribute
(disable_bridging) @attribute
(small_left) @attribute
(small_center) @attribute
(small_right) @attribute

; Accents above staff
(accent_above_staff) @operator
(accent_grave_above_staff) @operator
(circle_above_staff) @operator
(lower_semicircle_above_staff) @operator
(upper_semicircle_above_staff) @operator

; ============================================================================
; GABC NOTATION - NEUME SHAPES
; ============================================================================

; Basic shapes
(oriscus) @type
(oriscus_scapus) @type
(quilisma) @type
(quilisma_quadratum) @type
(quadratum) @type
(virga) @type
(virga_reversa) @type
(bivirga) @type
(trivirga) @type
(stropha) @type
(distropha) @type
(tristropha) @type
(linea) @type
(cavum) @type
(punctum_linea) @type
(cavum_linea) @type

; Initio debilis
(initio_debilis) @type

; Liquescence
(deminutus) @type
(augmented) @type
(diminished) @type

; Orientation
(upwards) @keyword
(downwards) @keyword

; Leaning
(left_leaning) @keyword
(right_leaning) @keyword
(non_leaning) @keyword

; ============================================================================
; GABC NOTATION - ATTRIBUTES
; ============================================================================

; Shape & stroke
(shape) @keyword.directive
(stroke) @keyword.directive

; Custos control
(nocustos) @keyword.control

; Choral signs
(cs) @keyword.directive
(cn) @keyword.directive

; Braces
(ob) @keyword.directive
(ub) @keyword.directive
(ocb) @keyword.directive
(ocba) @keyword.directive

; Stem length
(ll) @keyword.directive

; Ledger lines
(oll) @keyword.directive
(ull) @keyword.directive

; Slurs
(oslur) @keyword.directive
(uslur) @keyword.directive

; Horizontal episema
(oh) @keyword.directive
(uh) @keyword.directive
(episema_position) @string

; Above lines text
(alt) @keyword.directive

; Verbatim
(nv) @keyword.directive
(gv) @keyword.directive
(ev) @keyword.directive

; ============================================================================
; SYLLABLE TEXT & STYLING
; ============================================================================

; Note: syllable_text has no default highlight - text is plain unless styled
; Special syllable elements
(syllable_other_verbatim) @string.special
(syllable_other_above_lines_text) @string.special
(syllable_other_special_character) @string.escape

; Style tags - highlight text within complete tags
(syllable_style_bold
  (syllable
    (syllable_text) @markup.bold))

(syllable_style_italic
  (syllable
    (syllable_text) @markup.italic))

(syllable_style_underline
  (syllable
    (syllable_text) @markup.underline))

(syllable_style_small_caps
  (syllable
    (syllable_text) @markup.heading))

(syllable_style_teletype
  (syllable
    (syllable_text) @markup.raw))

(syllable_style_colored
  (syllable
    (syllable_text) @markup.link))

; Style tags - highlight text in cross-syllable tags (open/close)
; Bold
(syllable
  (syllable_style_bold_open)
  (syllable_text) @markup.bold)

(syllable
  (syllable_text) @markup.bold
  (syllable_style_bold_close))

; Italic
(syllable
  (syllable_style_italic_open)
  (syllable_text) @markup.italic)

(syllable
  (syllable_text) @markup.italic
  (syllable_style_italic_close))

; Underline
(syllable
  (syllable_style_underline_open)
  (syllable_text) @markup.underline)

(syllable
  (syllable_text) @markup.underline
  (syllable_style_underline_close))

; Small Caps
(syllable
  (syllable_style_small_caps_open)
  (syllable_text) @markup.heading)

(syllable
  (syllable_text) @markup.heading
  (syllable_style_small_caps_close))

; Teletype
(syllable
  (syllable_style_teletype_open)
  (syllable_text) @markup.raw)

(syllable
  (syllable_text) @markup.raw
  (syllable_style_teletype_close))

; Colored
(syllable
  (syllable_style_colored_open)
  (syllable_text) @markup.link)

(syllable
  (syllable_text) @markup.link
  (syllable_style_colored_close))

; ============================================================================
; NABC - BASIC GLYPHS
; ============================================================================

; Single note glyphs
(punctum) @constant
(virga) @constant
(tractulus) @constant
(gravis) @constant

; Compound glyphs
(clivis) @constant
(pes) @constant
(porrectus) @constant
(torculus) @constant
(climacus) @constant
(scandicus) @constant
(porrectus_flexus) @constant
(scandicus_flexus) @constant
(torculus_resupinus) @constant
(trigonus) @constant
(pressus_maior) @constant
(pressus_minor) @constant
(virga_strata) @constant
(salicus) @constant
(pes_quassus) @constant
(pes_stratus) @constant
(nihil) @constant
(uncinus) @constant
(oriscus_clivis) @constant

; ============================================================================
; NABC - MODIFIERS
; ============================================================================

(mark_modification) @keyword
(grouping_modification) @keyword
(melodic_modification) @keyword
(augmentive_liquescence) @type
(diminutive_liquescence) @type
(variant_number) @number

; ============================================================================
; NABC - SUBPUNCTIS/PREPUNCTIS
; ============================================================================

(subpunctis) @keyword
(prepunctis) @keyword
(tractulus_episema) @constant
(tractulus_double_episema) @constant
(gravis_episema) @constant
(quilisma) @constant
(liquescens_stropha_cephalicus) @constant
(repetition_count) @number

; ============================================================================
; NABC - STRUCTURE
; ============================================================================

(nabc_glyph_descriptor) @type
(nabc_glyph_fusion) @type
(pitch_descriptor) @constant

; NABC spacing
(larger_space_right) @punctuation.delimiter
(inter_element_space_right) @punctuation.delimiter
(larger_space_left) @punctuation.delimiter
(inter_element_space_left) @punctuation.delimiter

; ============================================================================
; NABC - SIGNIFICANT LETTERS (Performance indications)
; ============================================================================

(augete) @keyword
(altius) @keyword
(altius_mediocriter) @keyword
(bene) @keyword
(celeriter) @keyword
(celeriter_mediocriter) @keyword
(coniunguntur) @keyword
(celeriter_wide) @keyword
(deprimatur) @keyword
(equaliter) @keyword
(equaliter_eq) @keyword
(equaliter_dash) @keyword
(equaliter_equ) @keyword
(equaliter_wide) @keyword
(fastigium) @keyword
(fideliter) @keyword
(frendor) @keyword
(gutture) @keyword
(humiliter) @keyword
(humiliter_nectum) @keyword
(humiliter_parum) @keyword
(iusum) @keyword
(iusum_mediocriter) @keyword
(iusum_valde) @keyword
(klenche) @keyword
(levare) @keyword
(levare_bene) @keyword
(levare_celeriter) @keyword
(leniter) @keyword
(levare_mediocriter) @keyword
(levare_parvum) @keyword
(levare_tenere) @keyword
(mediocriter) @keyword
(mediocriter_md) @keyword
(molliter) @keyword
(non_tenere_negare_nectum_naturaliter) @keyword
(non_levare) @keyword
(non_tenere) @keyword
(parvum) @keyword
(paratim) @keyword
(perfecte) @keyword

; ============================================================================
; COMMENTS
; ============================================================================

(comment) @comment
