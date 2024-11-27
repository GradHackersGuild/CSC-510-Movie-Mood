$(document).ready(function () {
    // Initialize autocomplete
    initializeAutocomplete();

    // Event handlers
    setupEventHandlers();

    // Handle browser navigation
    setupBrowserNavigation();
});

function initializeAutocomplete() {
    $("#searchBox").autocomplete({
        source: function (request, response) {
            $.ajax({
                type: "POST",
                url: "/search",
                dataType: "json",
                cache: false,
                data: {
                    q: request.term,
                },
                success: function (data) {
                    response(data);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus + " " + errorThrown);
                },
            });
        },
        select: function (event, ui) {
            var ulList = $("#selectedMovies");
            if (ulList.find('li:contains("' + ui.item.value + '")').length > 0) {
                $("#searchBox").val("");
                return false;
            }

            var li = $("<li class='list-group-item'/>")
                .text(ui.item.value)
                .append('<span class="remove-movie">×</span>')
                .appendTo(ulList);
            $("#searchBox").val("");
            return false;
        },
        minLength: 1,
    });
}

function setupEventHandlers() {
    // Remove movie handler
    $(document).on("click", ".remove-movie", function () {
        $(this).parent().remove();
    });

    // Predict button handler
    $("#predict").click(handlePrediction);

    // Feedback button handler
    $("#feedback").click(handleFeedback);

    // Notify button handler
    $("#notifyButton").click(handleNotification);
}

function setupBrowserNavigation() {
    window.addEventListener("popstate", function (event) {
        if (event.state && event.state.page === "redirect") {
            window.location.href = "/";
            location.reload();
        }
    });
}

function fetchPosterURL(imdbID) {
    var posterURL = null;
    $.ajax({
        type: "GET",
        url: "/getPosterURL",
        dataType: "json",
        data: { imdbID: imdbID },
        async: false,
        success: function (response) {
            posterURL = response.posterURL;
        },
        error: function (error) {
            console.log("Error fetching poster URL: " + error);
        },
    });
    return posterURL;
}

function fetchTrailerVideoID(movieTitle) {
    let videoID = null;
    $.ajax({
        type: "GET",
        url: "https://www.googleapis.com/youtube/v3/search",
        data: {
            part: "snippet",
            q: `${movieTitle} trailer`,
            type: "video",
            maxResults: 1,
            key: "YOUR_YOUTUBE_API_KEY", // Replace with a valid YouTube API key
        },
        async: false,
        success: function (response) {
            if (response.items && response.items.length > 0) {
                videoID = response.items[0].id.videoId;
            }
        },
        error: function (error) {
            console.log("Error fetching trailer video ID: " + error);
        },
    });
    return videoID;
}

function embedTrailer(videoID, container) {
    if (videoID) {
        const iframeHTML = `
            <iframe width="560" height="315"
                    src="https://www.youtube.com/embed/${videoID}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
            </iframe>`;
        $(container).html(iframeHTML);
    } else {
        $(container).html("<p>Trailer not found</p>");
    }
}

function handlePrediction() {
    $("#loader").attr("class", "d-flex justify-content-center");
    var movie_list = [];

    $("#selectedMovies li").each(function () {
        movie_list.push($(this).text().replace("×", "").trim());
    });

    if (movie_list.length === 0) {
        alert("Select at least 1 movie!");
        $("#loader").attr("class", "d-none");
        return;
    }

    var movies = { movie_list: movie_list };
    $("#predictedMovies").empty();

    $.ajax({
        type: "POST",
        url: "/predict",
        dataType: "json",
        contentType: "application/json;charset=UTF-8",
        traditional: "true",
        cache: false,
        data: JSON.stringify(movies),
        success: function (response) {
            handlePredictionSuccess(response);
        },
        error: function (error) {
            console.log("ERROR ->" + error);
            $("#loader").attr("class", "d-none");
        },
    });
}

function handlePredictionSuccess(response) {
    var data = JSON.parse(response);
    var list = $("#predictedMovies");
    var title = $("<h2>Recommended Movies</h2>");
    var modalParent = document.getElementById("modalParent");
    $("#recommended_block").append(title);

    for (var i = 0; i < data.length; i++) {
        const movieTitle = data[i].title;
        const videoID = fetchTrailerVideoID(movieTitle);

        var column = $('<div class="col-sm-12"></div>');
        var card = `<div class="card movie-card">
            <div class="row no-gutters">
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">${data[i].title}</h5>
                  <h6 class="card-subtitle mb-2 text-muted">${data[i].runtime
            } minutes</h6>
                  <p class="card-text">${data[i].overview}</p>
                  <div id="trailer-container-${i}" class="trailer-container"></div>
                  <a target="_blank" href="https://www.imdb.com/title/${data[i].imdb_id
            }" class="btn btn-primary">Check IMDb</a>
                  <button type="button" class="btn btn-primary" data-bs-toggle="modal" id="modalButton-${i}" data-bs-target="#reviewModal-${i}">Write Review</button>
                  <button type="button" onclick="addToWatchlist('${data[i].movieId
            }', '${data[i].title}', '${data[i].overview}', '${data[i].poster_path
            }', '${data[i].imdb_id}', '${data[i].runtime}', '${i}')" id="addToWatchList-${i}" class="btn btn-primary modal-save">Add To Watchlist</button>
                </div>
              </div>
              <div class="col-md-4">
                  <img src="${fetchPosterURL(
                data[i].imdb_id
            )}" alt="Movie Poster" class="poster-image" style="width: 75%; height: auto; margin: 0;">
              </div>
              <div class="row">
                <div class="card-footer text-muted">Genres : ${data[i].genres
            }</div>  
              </div>
            </div>
          </div>`;
        var modal = `
          <div class="modal fade" id="reviewModal-${i}" tabindex="-1" aria-labelledby="reviewModalLabel" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="reviewModaLabel">Write your review</h5>
                  <button type="button" onclick="modalOnClose(${i})" id="closeModal-${i}" class="btn-close" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div class="mb-3">
                    <textarea class="form-control" rows=10 id="review-${i}"></textarea>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" onclick="modalOnClick(${i})" id="saveChanges-${i}" class="btn btn-primary modal-save">Save changes</button>
                </div>
              </div>
            </div>
          </div>`;
        modalParent.innerHTML += modal;
        column.append(card);
        list.append(column);
        embedTrailer(videoID, `#trailer-container-${i}`);
    }
    $("#loader").attr("class", "d-none");
}

// Watchlist Functionality
function addToWatchlist(movieId, title, overview, posterPath, imdbId, runtime, index) {
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    const movie = { movieId, title, overview, posterPath, imdbId, runtime };
    watchlist.push(movie);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    alert(`Added "${title}" to your watchlist!`);
}

window.modalOnClose = function (index) {
    $(`#review-${index}`).val("");
};
