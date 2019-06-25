tripwire.comments = function() {
    this.comments.data = {};

    this.comments.parse = function(data) {
        for (var x in data) {
            var id = data[x].id;

            if (!Object.find(tripwire.comments.data, "id", id) && $(".comment[data-id='"+id+"']").length == 0) {
                var $comment = $(".comment:last").clone();
                var commentID = $(".comment:visible:last .commentBody").attr("id") ? $(".comment:visible:last .commentBody").attr("id").replace("comment", "") + 1 : 0;

                //data[id].sticky ? $(".comment:first").before($comment) : $(".comment:last").before($comment);
                $(".comment:last").before($comment);
                $comment.attr("data-id", id);

                try {
                    $comment.find(".commentBody").html(data[x].comment);
                } catch (err) {
                    $comment.find(".commentFooter").show();
                    $comment.find(".commentStatus").html("<span class='critical'>" + err.constructor.name + ": " + err.message + "</span>");
                    $comment.find(".commentFooter .commentControls").hide();
                }

                $comment.find(".commentModified").html("Edited by " + data[x].modifiedByName + " at " + data[x].modified);
                $comment.find(".commentCreated").html("Posted by " + data[x].createdByName + " at " + data[x].created);
                $comment.find(".commentBody").attr("id", "comment" + commentID);
                $comment.find(".commentSticky").addClass(data[x].sticky ? "active" : "");
                $comment.removeClass("hidden");
                Tooltips.attach($comment.find("[data-tooltip]"));

                //tripwire.comments.data[id] = data[id];
            } else if (Object.find(tripwire.comments.data, "id", id) && Object.find(tripwire.comments.data, "id", id).modified != data[x].modified) {
                var $comment = $(".comment[data-id='"+id+"']");

                try {
                    $comment.find(".commentBody").html(data[x].comment);
                } catch (err) {
                    $comment.find(".commentFooter").show();
                    $comment.find(".commentStatus").html("<span class='critical'>" + err.constructor.name + ": " + err.message + "</span>");
                    $comment.find(".commentFooter .commentControls").hide();
                }

                $comment.find(".commentModified").html("Edited by " + data[x].modifiedByName + " at " + data[x].modified);
                $comment.find(".commentSticky").addClass(data[x].sticky ? "active" : "");

                //tripwire.comments.data[id] = data[id];
            }
        }

        for (var x in tripwire.comments.data) {
            var id = tripwire.comments.data[x].id;

            if (!Object.find(data, "id", id)) {
                var $comment = $(".comment[data-id='"+id+"']");
                $comment.remove();
            }
        }

        tripwire.comments.data = data;
    }
}
tripwire.comments();
