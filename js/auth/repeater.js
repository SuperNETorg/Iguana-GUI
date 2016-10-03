/*!
 * Iguana authorization/repeater
 *
 */

var iguanaCoinsRepeaterTemplate = '<div class=\"coin\" data-coin-id=\"{{ coin_id }}\">' +
                                    '<input type=\"checkbox\" id=\"iguana-coin-{{ coin_id }}-checkbox\" name=\"iguana-coin-{{ coin_id }}-checkbox\" class=\"checkbox\" {{ onclick_input }} />' +
                                    '<label for=\"iguana-coin-{{ coin_id }}-checkbox\" class=\"checkbox-label cursor-pointer\" {{ onclick }}>' +
                                      '<span class=\"box\"></span><span class=\"label-text unselectable\">{{ name }}</span>' +
                                    '</label>' +
                                  '</div>';

var nonIguanaCoinsRepeaterTemplate = '<div class=\"coin block\" data-coin-id=\"{{ coin_id }}\">' +
                                       '<input type=\"checkbox\" id=\"iguana-coin-{{ coin_id }}-checkbox\" name=\"iguana-coin-{{ coin_id }}-checkbox\" class=\"checkbox\" />' +
                                       '<label for=\"iguana-coin-{{ coin_id }}-checkbox\" class=\"iguana-coin-{{ coin_id }}-label checkbox-label cursor-pointer\">' +
                                         '<span class=\"box\"></span><span class=\"label-text unselectable\">{{ name }}</span>' +
                                       '</label>' +
                                       '<span class=\"iguana-coin-{{ coin_id }}-error\"></span>' +
                                       '<textarea name=\"iguana-coin-{{ coin_id }}-textarea\" id=\"iguana-coin-{{ coin_id }}-textarea\" class=\"iguana-coin-{{ coin_id }}-textarea offset-bottom-sm row center\">{{ value }}</textarea>' +
                                     '</div>';

function constructAuthCoinsRepeater() {
  var result = isIguana ? '<hr/>' : '',
      coinsRepeaterTemplate = isIguana ? iguanaCoinsRepeaterTemplate : nonIguanaCoinsRepeaterTemplate,
      localStorage = new localStorageProto(),
      helper = new helperProto(),
      index = 0;

  for (var key in coinsInfo) {
    if (!isIguana) localStorage.setVal('iguana-' + key + '-passphrase', { 'logged': 'no' });
    if ((isIguana && apiProto.prototype.getConf().coins[key].iguanaCurl !== "disabled") || (!isIguana && coinsInfo[key].connection === true && coinsInfo[key].iguana !== false)) {
      index++;
      result += coinsRepeaterTemplate.replace(/{{ coin_id }}/g, key).
                                      replace('{{ id }}', key.toUpperCase()).
                                      replace('{{ name }}', key.toUpperCase()).
                                      replace('{{ value }}', isDev && !isIguana ? (coinPW.coind[key] ? coinPW.coind[key] : '') : '').
                                      replace('{{ onclick }}', isIguana && coinsInfo[key].connection === true ? 'checked disabled' : '').
                                      replace('{{ onclick_input }}', isIguana && coinsInfo[key].connection === true && helper.getCurrentPage() === 'index' ? 'checked disabled' : '');
    }
  }

  if (!isIguana) {
    $('#passphrase').hide();
    $('.btn-signup').html('Encrypt wallet');
  }
  if (index !== 0 || isIguana) $('.coind-iguana-notice').hide();

  result = result + (!isIguana ? '<hr/>' : '');
  $(isIguana ? '.iguana-coins-repeater' : '.non-iguana-coins-repeater').html(result);
}

function constructCoinsRepeaterEncrypt() {
  var result = '<hr/><div class=\"center\"><div>Select a wallet you want to encrypt</div>';

  for (var key in coinsInfo) {
    if (isIguana && coinsInfo[key].connection === true) {
      selectedCoindToEncrypt = key;
    }

    if ((!isIguana && coinsInfo[key].connection === true) || isIguana) {
      result += iguanaCoinsRepeaterTemplate.replace(/{{ coin_id }}/g, key).
                                            replace('{{ id }}', key.toUpperCase()).
                                            replace('{{ name }}', key.toUpperCase()).
                                            replace('{{ onclick }}', isIguana && coinsInfo[key].connection === true ? '' : 'onmouseup=\"checkSelectedWallet(\'' + key + '\')\"').
                                            replace('{{ onclick_input }}', isIguana && coinsInfo[key].connection === true ? 'checked disabled' : '');
    }
  };

  result = result + '</div><hr/>';
  if ((isIguana && !selectedCoindToEncrypt) || !isIguana) $('.non-iguana-coins-repeater').html(result);
}