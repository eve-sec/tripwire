// Handles removing from Signatures section
tripwire.deleteSig = function(key) {
    var tr = $("#sigTable tr[data-id='"+key+"']");

    //Append empty space to prevent non-coloring
    $(tr).find('td:empty, a:empty').append("&nbsp;");

    $(tr)
        .find('td')
        .wrapInner('<div />')
        .parent()
        .find('td > div').animate({backgroundColor: "#4D0000"}, 1000).delay(1000).animate({backgroundColor: "#111"}, 1000)
        .slideUp(700, function(){
            // Remove countdown reference
            $(tr).find('span[data-age]').countdown("destroy");

            $(this).parent().parent().remove();
            $("#sigTable").trigger("update");
        });
}
