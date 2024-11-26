$(document).ready(function () {
  $(function () {
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
        // Check if the value already exists in the list
        if (ulList.find('li:contains("' + ui.item.value + '")').length > 0) {
          $("#searchBox").val("");
          return false;
        }

        var li = $("<li class='list-group-item'/>")
          .text(ui.item.value)
          .appendTo(ulList);
        $("#searchBox").val("");
        return false;
      },

      // changed the min-length for searching movies from 2 to 1
      minLength: 1,
    });
  });

  $("#predict").click(function () {
    $("#loader").attr("class", "d-flex justify-content-center");

    var movie_list = [];

    $("#selectedMovies li").each(function () {
      movie_list.push($(this).text());
    });

    var movies = { movie_list: movie_list };

    // Clear the existing recommendations
    $("#predictedMovies").empty();
    // if movies list empty then throw an error box saying select atleast 1 movie!!
    if (movie_list.length == 0) {
      alert("Select atleast 1 movie!!");
    }

    //fetching poster using /getposterurl

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

      // Fetch API key from the server
      $.ajax({
        type: "GET",
        url: "/get-youtube-api-key", // Server endpoint to get API key
        async: false,
        success: function (apiResponse) {
          if (apiResponse.key) {
            const apiKey = apiResponse.key;

            // Fetch trailer video ID using the retrieved API key
            $.ajax({
              type: "GET",
              url: "https://www.googleapis.com/youtube/v3/search",
              data: {
                part: "snippet",
                q: `${movieTitle} trailer`,
                type: "video",
                maxResults: 1,
                key: apiKey,
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
          } else {
            console.log("API key not found in the server response.");
          }
        },
        error: function (error) {
          console.log("Error fetching API key: " + error);
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

    $.ajax({
      type: "POST",
      url: "/predict",
      dataType: "json",
      contentType: "application/json;charset=UTF-8",
      traditional: "true",
      cache: false,
      data: JSON.stringify(movies),
      success: function (response) {
        var data = JSON.parse(response);
        var list = $("#predictedMovies");
        var title = $("<h2>Recommended Movies</h2>");
        var modalParent = document.getElementById("modalParent");
        $("#recommended_block").append(title);
        for (var i = 0; i < data.length; i++) {
          const movieTitle = data[i].title;
          const videoID = fetchTrailerVideoID(movieTitle);
          console.log(
            "Error fetching trailer video ID: " + movieTitle + videoID
          );
          var column = $('<div class="col-sm-12"></div>');
          var card = `<div class="card movie-card">
            <div class="row no-gutters">
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">${data[i].title}</h5>
                  <h6 class="card-subtitle mb-2 text-muted">${
                    data[i].runtime
                  } minutes</h6>
                  <p class="card-text">${data[i].overview}</p>
                  <div id="trailer-container-${i}" class="trailer-container"></div>
                  <a target="_blank" href="https://www.imdb.com/title/${
                    data[i].imdb_id
                  }" class="btn btn-primary">Check out IMDb Link</a>
                  <button type="button" class="btn btn-primary" data-bs-toggle="modal" id="modalButton-${i}" data-bs-target="#reviewModal-${i}">Write a review</button>
                  <button type="button" onclick="addTOWatchListClick('${
                    data[i].movieId
                  }','${data[i].title.replace(/'/g, "\\'")}', '${data[
            i
          ].overview.replace(/'/g, "\\'")}','${data[i].poster_path}','${
            data[i].imdb_id
          }','${
            data[i].runtime
          }', '${i}')" id="addToWatchList-${i}" class="btn btn-primary modal-save">Add To Watchlist</button>
                  <div class="movieId" hidden>${data[i].movieId}</div>
                  <div class="genres" hidden>${data[i].genres}</div>
                  <div class="imdb_id" hidden>${data[i].imdb_id}</div>
                  <div class="poster_path" hidden>${data[i].poster_path}</div>
                  <div class="index" hidden>${i}</div>
                </div>
              </div>
              <div class="col-md-4">
                  <img src="${fetchPosterURL(
                    data[i].imdb_id
                  )}" alt="Movie Poster" class="poster-image" style="width: 75%; height: auto; margin: 0;">
              </div>
              <div class="row">
                <div class="card-footer text-muted">Genres : ${
                  data[i].genres
                }</div>  
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
      },
      error: function (error) {
        console.log("ERROR ->" + error);
        $("#loader").attr("class", "d-none");
      },
    });
  });

  window.addEventListener("popstate", function (event) {
    // Check if the user is navigating back
    if (event.state && event.state.page === "redirect") {
      // Redirect the user to a specific URL
      window.location.href = "/";
      location.reload();
    }
  });

  var FeedbackData;

  $("#feedback").click(function () {
    notifyMeButton = document.getElementById("checkbox");
    notifyMeButton.disabled = false;
    var myForm = $("fieldset");
    var data = {};
    var labels = {
      1: "Dislike",
      2: "Yet to watch",
      3: "Like",
    };

    // to check if any movies selected before giving feedback
    if (myForm.length == 0) {
      alert("No movies found. Please add movies to provide feedback.");
      return;
    }
    var error = false; // Flag to track errors

    for (var i = 0; i < myForm.length; i++) {
      var input = $("#" + i)
        .find("div")
        .find("input:checked")[0];
      var movieName = $("#" + i)
        .find("div")
        .find("li")[0].innerText;

      if (!input) {
        // If no selection is made, set error flag to true and break the loop
        error = true;
        break;
      }

      data[movieName] = labels[input.value];
    }

    if (error) {
      // Display an error message if there are missing selections
      alert("Please select a feedback for all movies.");
      return; // Exit the function without making the AJAX call
    }

    FeedbackData = data;
    localStorage.setItem("fbData", JSON.stringify(data));
    $.ajax({
      type: "POST",
      url: "/feedback",
      dataType: "json",
      contentType: "application/json;charset=UTF-8",
      traditional: "true",
      cache: false,
      data: JSON.stringify(data),
      success: function (response) {
        window.location.href = "/success";
      },
      error: function (error) {
        console.log("ERROR ->" + error);
      },
    });
  });

  $("#notifyButton").click(function () {
    var data = JSON.parse(localStorage.getItem("fbData"));
    $("#loaderSuccess").attr("class", "d-flex justify-content-center");
    if (!data) {
      alert("No feedback data found. Please provide feedback.");
      return;
    }

    var emailString = $("#emailField").val();
    data.email = emailString;

    // Remove the "emailSent" flag to allow sending the email again
    localStorage.removeItem("emailSent");

    $.ajax({
      type: "POST",
      url: "/sendMail",
      dataType: "json",
      contentType: "application/json;charset=UTF-8",
      traditional: "true",
      cache: false,
      data: JSON.stringify(data),
      success: function (response) {
        $("#loaderSuccess").attr("class", "d-none");
        $("#emailSentSuccess").show();
        setTimeout(function () {
          $("#emailSentSuccess").fadeOut("slow");
        }, 2000);
        $("#area1").attr("placeholder", "Email");
        $("#emailField").val("");
      },
      error: function (error) {
        $("#loaderSuccess").attr("class", "d-none");
        console.log("ERROR ->" + error);
        localStorage.removeItem("fbData");
      },
    });
  });
});
