/*
Send Button to send coin another address Js
*/

$(document).ready(function() {
    $("#sendCoinModal, #confirmation, #sending, #transactionsent").dialog({
                    modal: true,
                    autoOpen: false,
                    width: '800',
                    height: 'auto',
                    create: function (event, ui) {
                        $(".ui-widget-header").hide();
                    }
                });

    $("#send").click(function () {
        $('#sendCoinModal').dialog('open');
    });



    $(".close").on("click", function()
    {
        $("#sendCoinModal").dialog('close');
        $('#confirmation').dialog('close');
    });
  
    $("#nextsend").click(function () {
        $("#sendCoinModal").dialog('close');
        $('#confirmation').dialog('open');
    });

    
    $(".back").click(function () {
        $("#sendCoinModal").dialog('open');
        $('#confirmation').dialog('close');
    });

    $("#sendingModal").click(function () {
        $("#confirmation").dialog('close');
        $('#sending').dialog('open');
    });

    $("#transactionsentmodal").click(function () {
        $("#sending").dialog('close');
        $('#transactionsent').dialog('open');
    });

    $("#transactioncomplete").click(function () {
        $('#transactionsent').dialog('close');
    });
});