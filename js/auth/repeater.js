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
                                       '<input type=\"checkbox\" id=\"iguana-coin-{{ coin_id }}-checkbox\" name=\"iguana-coin-{{ coin_id }}-checkbox\" class=\"checkbox\" {{ onclick }} />' +
                                       '<label for=\"iguana-coin-{{ coin_id }}-checkbox\" class=\"iguana-coin-{{ coin_id }}-label checkbox-label cursor-pointer\" {{ onclick }}>' +
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
    if ((isIguana && iguanaAddCoinParams[key] && iguanaAddCoinParams[key] !== 'disabled') || (!isIguana && coinsInfo[key].connection === true && coinsInfo[key].iguana !== false)) {
      index++;
      result += coinsRepeaterTemplate.
                replace(/{{ coin_id }}/g, key).
                replace('{{ name }}', key.toUpperCase()).
                replace('{{ value }}', dev.isDev && !isIguana ? (dev.coinPW.coind[key] ? dev.coinPW.coind[key] : '') : '').
                replace('{{ onclick }}', !isIguana /*isIguana && coinsInfo[key].connection === true*/ ? 'checked' : '').
                replace('{{ onclick_input }}', !isIguana /*isIguana && coinsInfo[key].connection === true && helper.getCurrentPage() === 'index'*/ ? 'checked' : '');
    }
  }

  if (!isIguana) {
    //$('#passphrase').hide();
    $('.btn-signup').html('Create wallet');
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
      result += iguanaCoinsRepeaterTemplate.
                replace(/{{ coin_id }}/g, key).
                replace('{{ name }}', key.toUpperCase()).
                replace('{{ onclick }}', '').
                replace('{{ onclick_input }}', isIguana && coinsInfo[key].connection === true ? 'checked disabled' : '');
    }
  };

  result = result + '</div><hr/>';
  if ((isIguana && !selectedCoindToEncrypt) || !isIguana) $('.non-iguana-coins-repeater').html(result);
  bindCoinsRepeaterEncrypt();
}

function bindCoinsRepeaterEncrypt() {
  $('.non-iguana-coins-repeater .coin').each(function(index, item) {
    var coindId = $(this).attr('data-coin-id');

    if (!isIguana && coinsInfo[coindId].connection === true)
      $(this).mouseup(function() { // naming matters, doesn't trigger on click :(
        checkSelectedWallet(coindId);
      });
  });
}