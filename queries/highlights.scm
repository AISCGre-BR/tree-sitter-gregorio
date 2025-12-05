; highlights.scm - Syntax highlighting for GABC+NABC notation
; Tree-sitter query file for Gregorian chant notation

; ============================================================================
; COMMENTS
; ============================================================================

(comment) @comment

; ============================================================================
; HEADERS
; ============================================================================

(header_name) @property
(header
  terminator: _ @punctuation.delimiter)

; ============================================================================
; PUNCTUATION AND DELIMITERS
; ============================================================================

["(" ")" "{" "}" "[" "]"] @punctuation.bracket
["|" ":" ";" "," "."] @punctuation.delimiter
["%" "%%"] @punctuation.special

; ============================================================================
; GABC NOTATION - PITCHES AND NOTES
; ============================================================================

; Pitch letters (lowercase for quadratum, uppercase for inclinatum)
(pitch_lowercase) @constant.builtin
(pitch_uppercase) @constant.builtin.italic

; ============================================================================
; GABC NOTATION - CLEFS
; ============================================================================

(c_clef
  name: _ @keyword.directive
  position: _ @number)

(f_clef
  name: _ @keyword.directive
  position: _ @number)

(c_clef_flat
  name: _ @keyword.directive
  position: _ @number)

(f_clef_flat
  name: _ @keyword.directive
  position: _ @number)

; ============================================================================
; GABC NOTATION - BARS AND SEPARATORS
; ============================================================================

; Bar types
(virgula) @punctuation.special
(divisio_minimis) @punctuation.special
(divisio_minima) @punctuation.special
(divisio_minor) @punctuation.special
(divisio_maior) @punctuation.special
(divisio_maior_dotted) @punctuation.special
(divisio_finalis) @punctuation.special
(dominican_bar) @punctuation.special

; ============================================================================
; GABC NOTATION - LINE BREAKS AND CUSTOS
; ============================================================================

(justified_line_break) @keyword.control
(ragged_line_break) @keyword.control
(force_custos) @keyword.control
(disable_custos) @keyword.control

(custos_auto_pitch) @keyword.directive
(custos
  symbol: _ @keyword.directive
  pitch: _ @constant.builtin)

; ============================================================================
; GABC NOTATION - SPACING
; ============================================================================

(small_neume_separation) @punctuation.delimiter
(medium_neume_separation) @punctuation.delimiter
(large_neume_separation) @punctuation.special
(large_unbreakable_neume_separation) @punctuation.special
(half_space_same_neume) @punctuation.delimiter
(small_space_same_neume) @punctuation.delimiter
(zero_space) @punctuation.delimiter

; ============================================================================
; GABC NOTATION - ALTERATIONS
; ============================================================================

(natural_alteration) @operator
(flat_alteration) @operator
(sharp_alteration) @operator

; ============================================================================
; GABC NOTATION - NEUME MODIFIERS
; ============================================================================

; Episema
(episema_below) @attribute
(episema_above) @attribute
(episema_disable_bridging) @attribute
(episema_small_left) @attribute
(episema_small_center) @attribute
(episema_small_right) @attribute

; Ictus
(ictus_simple) @attribute
(ictus_vertical) @attribute
(ictus_horizontal) @attribute

; Punctum mora
(punctum_mora_single) @attribute
(punctum_mora_double) @attribute

; ============================================================================
; GABC NOTATION - EXTRA SYMBOLS
; ============================================================================

(asterisk) @operator
(cross_simple) @operator
(maltese_cross) @operator
(cross_accent) @operator
(r_symbol) @keyword.directive
(v_symbol) @keyword.directive
(a_symbol) @keyword.directive

; ============================================================================
; GABC NOTATION - ATTRIBUTES
; ============================================================================

(gabc_attribute
  name: _ @attribute)

; Shape hints
(stroke) @constant.builtin

; Choral signs and NABC codes
(cs) @attribute
(cn) @attribute

; Braces
(ob) @attribute
(ub) @attribute
(ocb) @attribute
(ocba) @attribute

; Ledger lines
(ll) @attribute
(ul) @attribute

; Slurs
(olS) @attribute
(ulS) @attribute

; Horizontal episema
(oh) @attribute
(uh) @attribute

; Above lines text
(alt) @attribute

; Verbatim TeX
(nv) @attribute
(gv) @attribute
(ev) @attribute
(ocp) @attribute
(ocb) @attribute

; No custos
(nocustos) @attribute

; ============================================================================
; GABC NOTATION - LIQUESCENCE
; ============================================================================

(initiodebilis) @attribute
(initiodebilis_2) @attribute
(auctusdescendens) @attribute
(auctusascendens) @attribute
(quilismaauctusdescendens) @attribute
(quilismaauctusascendens) @attribute
(oriscusauctusdescendens) @attribute
(oriscusauctusascendens) @attribute
(diminutive) @attribute

; ============================================================================
; LYRICS - STYLE TAGS
; ============================================================================

; Style tag markers
(syllable_style_bold) @tag
(syllable_style_italic) @tag
(syllable_style_colored) @tag
(syllable_style_small_caps) @tag
(syllable_style_teletype) @tag
(syllable_style_underline) @tag

; ============================================================================
; LYRICS - CONTROL TAGS
; ============================================================================

(syllable_control_clear) @keyword.directive
(syllable_control_elision) @keyword.directive
(syllable_control_euouae) @keyword.directive
(syllable_control_no_line_break) @keyword.directive
(syllable_control_protrusion) @keyword.directive

; ============================================================================
; LYRICS - OTHER TAGS
; ============================================================================

(syllable_other_above_lines_text) @tag
(syllable_other_special_character) @tag
(syllable_other_verbatim) @tag

; ============================================================================
; LYRICS - TEXT CONTENT
; ============================================================================

(syllable_text) @string
(syllable_translation) @string.special
(syllable_centering) @string.special
(syllable_escape_sequence) @string.escape

; ============================================================================
; NABC NOTATION - GLYPH DESCRIPTORS
; ============================================================================

; Basic glyphs (St. Gall and Laon)
(virga) @constant.builtin
(punctum) @constant.builtin
(tractulus) @constant.builtin
(clivis) @constant.builtin
(pes) @constant.builtin
(torculus) @constant.builtin
(porrectus) @constant.builtin
(climacus) @constant.builtin
(scandicus) @constant.builtin
(salicus) @constant.builtin
(pressus) @constant.builtin

; Laon-specific glyphs
(bivirga) @constant.builtin
(trivirga) @constant.builtin
(distropha) @constant.builtin
(tristropha) @constant.builtin
(strophicus) @constant.builtin
(oriscus) @constant.builtin
(quilisma) @constant.builtin

; Additional complex glyphs
(torculus_resupinus) @constant.builtin
(pes_subpunctis) @constant.builtin
(pes_subbipunctis) @constant.builtin
(porrectus_flexus) @constant.builtin
(torculus_liquescens) @constant.builtin

; ============================================================================
; NABC NOTATION - MODIFIERS
; ============================================================================

; Glyph modifiers with semantic aliases
(mark_modification) @attribute
(grouping_modification) @attribute
(melodic_modification) @attribute
(episema_addition) @attribute
(augmentive_liquescence) @attribute
(diminutive_liquescence) @attribute

; ============================================================================
; NABC NOTATION - PITCH DESCRIPTORS
; ============================================================================

(pitch_descriptor_altius) @operator
(pitch_descriptor_finalis) @operator
(pitch_descriptor_normal) @operator

; ============================================================================
; NABC NOTATION - SPACING
; ============================================================================

(larger_space_right) @punctuation.delimiter
(inter_element_space_right) @punctuation.delimiter
(larger_space_left) @punctuation.delimiter
(inter_element_space_left) @punctuation.delimiter

; ============================================================================
; NABC NOTATION - SUBPUNCTIS AND PREPUNCTIS
; ============================================================================

(subpunctis_descriptor
  modifier: _ @attribute)

(prepunctis_descriptor
  modifier: _ @attribute)

; Specific modifiers
(tractulus) @attribute
(tractulus_episema) @attribute
(tractulus_double_episema) @attribute
(gravis) @attribute
(gravis_episema) @attribute
(liquescens_stropha_cephalicus) @attribute
(uncinus) @attribute
(laon_quilisma) @attribute
(laon_virga) @attribute

; ============================================================================
; NABC NOTATION - SIGNIFICANT LETTERS
; ============================================================================

; St. Gall shorthands (examples of common ones)
(altius) @keyword.modifier
(celeriter) @keyword.modifier
(tenere) @keyword.modifier
(levare) @keyword.modifier
(deprimere) @keyword.modifier
(equaliter) @keyword.modifier
(inferius) @keyword.modifier
(superius) @keyword.modifier

; Laon shorthands
(augete) @keyword.modifier
(humiliter) @keyword.modifier
(mediocriter) @keyword.modifier
(levate) @keyword.modifier

; Tironian notes
(iusum) @keyword.modifier
(deorsum) @keyword.modifier
(sursum) @keyword.modifier

; Generic significant letter and tironian letter
(significant_letter) @keyword.modifier
(tironian_letter) @keyword.modifier

; ============================================================================
; NABC NOTATION - FIELDS
; ============================================================================

; Position numbers in descriptors
(position_number) @number

; ============================================================================
; OPERATORS
; ============================================================================

; Neume fusion operator
"@" @operator

; Glyph fusion operator (NABC)
"&" @operator

; ============================================================================
; STRINGS AND NUMBERS
; ============================================================================

(header
  value: _ @string)

; Numbers in various contexts
[
  (syllable_control_protrusion)
] @number
