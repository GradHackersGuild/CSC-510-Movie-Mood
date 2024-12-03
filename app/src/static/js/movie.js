$(document).ready(function () {
    function fetchPosterURL(obj) {
        var posterURL = null;
        $.ajax({
            type: "GET",
            url: "/getPosterURL",
            dataType: "json",
            data: { imdbID: obj.innerHTML },
            async: false,
            success: function (response) {
                posterURL = response.posterURL;
                var poster = `<img src=${response.posterURL} alt="Movie Poster" 
                    class="poster-image" style="width: 75%; height: auto; margin: 0;"></img>`
                obj.innerHTML += poster;
            },
            error: function (error) {
                console.log("Error fetching poster URL: " + error);
            },
        });
        return posterURL;
    };

    $('.imdbId').map((index, obj) => {
        fetchPosterURL(obj);
    });


});
