/*
 * rules ref: https://github.com/CSSLint/csslint/wiki/rules
 */

var cssLintRules = {
  "important": false,
  "adjoining-classes": false,
  "known-properties": true,
  "box-sizing": false,
  "box-model": false,
  "overqualified-elements": true,
  "display-property-grouping": false,
  "bulletproof-font-face": false,
  "compatible-vendor-prefixes": true,
  "regex-selectors": true,
  "errors": true,
  "duplicate-background-images": false,
  "duplicate-properties": true,
  "empty-rules": true,
  "selector-max-approaching": false,
  "gradients": false,
  "fallback-colors": false,
  "font-sizes": false,
  "font-faces": false,
  "floats": false,
  "star-property-hack": true,
  "outline-none": false,
  "import": false,
  "ids": true,
  "underscore-property-hack": true,
  "rules-count": false,
  "qualified-headings": false,
  "selector-max": false,
  "shorthand": true,
  "text-indent": false,
  "unique-headings": false,
  "universal-selector": true,
  "unqualified-attributes": false,
  "vendor-prefix": false,
  "zero-units": true
};

exports.getCSSLintRules = function() {
  return cssLintRules
}