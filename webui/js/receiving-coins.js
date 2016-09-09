/*!
 * Iguana copy address 
 * info: copy address on copy button click 
 */
function copyToClipboard(element) {
	var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
  	$temp.remove();
}