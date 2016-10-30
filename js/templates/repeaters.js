/*!
 * Iguana repeaters templates
 *
 */

'use_strict';

templates.registerRepeaterTemplate('addCoinItem',
'<div class=\"coin\" data-coin-id=\"{{ coin_id }}\">' +
  '<i class=\"icon cc {{ id }}-alt col-{{ color }}\"></i>' +
  '<div class=\"name\">{{ name }}</div>' +
'</div>');

templates.registerRepeaterTemplate('accountCoinItem',
'<div class=\"item loading {{ coin_id }}{{ active }}\" data-coin-id=\"{{ coin_id }}\" data-coin-balance-value=\"{{ coin_balance_unformatted }}\">' +
  '{{ injectLoader }}' +
  '<div class=\"remove-coin cursor-pointer{{ dev }}\"></div>' +
  '<div class=\"clickable-area\">' +
    '<div class=\"coin\">' +
      '<i class=\"icon cc {{ id }}-alt\"></i>' +
      '<div class=\"name\">{{ name }}</div>' +
    '</div>' +
    '<div class=\"balance\">' +
      '<div class=\"coin-value\"><span class=\"val\">{{ coin_value }}</span> {{ coin_id_uc }}</div>' +
      '<div class=\"currency-value\"><span class=\"val\">{{ currency_value }}</span> {{ currency_name }}</div>' +
    '</div>' +
  '</div>' +
'</div>');

templates.registerRepeaterTemplate('currencyItem',
'<li class=\"country-li cursor-pointer {{ defaultActive }}\" data-id=\"{{ index }}\">' +
  '<h1 class=\"flag-head\">' +
    '<span class=\"label label-default\">' +
      '<span class=\"flag-icon flag-icon-{{ flagId }}\"></span>' +
    '</span>' +
  '</h1>' +
  '<strong class=\"short-name\">{{ shortName }}</strong>' +
  '<span class=\"full-name\">{{ fullName }}</span>' +
'</li>');

templates.registerRepeaterTemplate('transactionsUnitItem',
'<div class=\"item {{ status_class }} {{ timestamp_format }} {{ txid }}\" title=\"confirmations: {{ confs }}\">' +
  '<div class=\"status unselectable\">{{ status }}</div>' +
  '<div class=\"amount unselectable\">' +
    '<span class=\"in-out {{ in_out }}\"></span>' +
    '<span class=\"value\">{{ amount }}</span>' +
    '<span class=\"coin-name\">{{ coin }}</span>' +
  '</div>' +
  '<div class=\"progress-status unselectable\">' +
    '<i class=\"icon\"></i>' +
  '</div>' +
  '<div class=\"hash\">{{ hash }}</div>' +
  '<div class=\"timestamp unselectable\">{{ timestamp_single }}</div>' +
  '<div class=\"timestamp two-lines unselectable\">' +
    '<div class=\"timestamp-date\">{{ timestamp_date }}</div>' +
    '<div class=\"timestamp-time\">{{ timestamp_time }}</div>' +
  '</div>' +
'</div>');

templates.registerRepeaterTemplate('coinSelectionShowItem',
'<br/><span class=\"small\">{{ item }}</span>');