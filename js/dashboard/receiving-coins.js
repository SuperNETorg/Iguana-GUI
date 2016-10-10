/*!
 * Iguana copy address 
 * info: copy address on copy button click 
 */
function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  try {
    document.execCommand("copy");
  }
  catch(err) {
  	alert(err);
  }
  	$temp.remove();
} 