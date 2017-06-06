$(document).on("click", "#scrape", function() {
    $("#scraped").show();
    $("#articles").empty();
    $.getJSON("/scrape", function(data) {
        console.log(data);
    })
})
$(document).on("click", "#articleslist", function() {
    $("#articles").show();
    $("#articles").empty();
    $.getJSON("/articles", function(data) {
        for (var i = 0; i < data.length; i++) {
            $("#articles").append("<p style='border: solid 1pt; padding: 5px' data-id='" + data[i]._id + "'>" + data[i].title + "<button class='btn btn-info' id='save' style='margin-left:20px' >Save</button>" + "<br />" + data[i].link + "</p>");
        }
    })
})

$(document).on("click", "#save", function() {
    var thisId = $(this).parent().attr("data-id");
    console.log(thisId)
    $.get("/articles/" + thisId, function(data) {

    })
})

$(document).on("click", "#savedlist", function() {

    $("#saved").empty();
    $("#articles").empty();
    $("#articles").hide();
    $("#saveart").show();
    $("#saveart").empty();

    $.getJSON("/articles", function(data) {
        for (var i = 0; i < data.length; i++) {

            if (data[i].saved) {
                console.log(data[i])
                $("#saved").append("<p style='border: solid 1pt; padding: 5px' data-id='" + data[i]._id + "'>" + data[i].title + "<a href='#myModal' role='button' id='notebtn' style='margin-left: 20px' class='btn btn-large btn-primary' data-toggle='modal'>Take Notes</a> <button class='btn btn-danger' id='delete' style='margin-left:20px' >Delete From Saved</button>" + "<br />" + data[i].link + "</p>");
            }
        }
    })
})

$(document).on("click", "#notebtn", function() {
    $("#notebody").empty();
    $("#noteinput").val("");
    var newId = $(this).parent().attr("data-id");
    $(".modal-title").html(newId)
    $.getJSON("/notes/" + newId, function(data) {
        console.log(data.note);
        $("#notebody").append("<span style='margin-left:20px; font-size: 300%'>" + data.note.title + "</span><button class='btn btn-danger' id='deletenote' width='70px' height='70px'></button>")
    })

})

$("#savenote").on("click", function() {
    var newId = $(".modal-title").text();
    console.log(newId);
    var newnote = { title: $("#noteinput").val() }
    $.post("/notes/" + newId, newnote, function(data) {

    })
    $("#myModal").modal("hide");
})

$(document).on("click", "#deletenote", function() {
    var delnote = $("#notebody").text();
    console.log(delnote);
    $.getJSON("/deletenote/" + delnote, function(data) {

    })
    $("#myModal").modal("hide");
})

$(document).on("click", "#delete", function(){
    var newId = $(this).parent().attr("data-id");
    $.get("/delete/"+newId, function(data){
    	$("#savedlist").click()
    })
})