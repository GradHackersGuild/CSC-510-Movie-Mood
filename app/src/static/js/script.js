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
  $(document).on('click', '.remove-movie', function () {
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

function fetchStreamingOptions(movieId, callback) {
  // Step 1: Fetch the API key dynamically
  fetchRapidAPIKey(function (err, apiKey) {
    if (err) {
      console.error("Could not fetch API key");
      callback(err, null);
      return;
    }

    const settings = {
      async: true,
      crossDomain: true,
      url: `https://streaming-availability.p.rapidapi.com/shows/movie/${movieId}`,
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "streaming-availability.p.rapidapi.com",
      },
    };

    $.ajax(settings)
      .done(function (response) {
        if (response.streamingOptions && response.streamingOptions.us) {
          callback(null, response.streamingOptions.us);
        } else {
          callback("No streaming options found", null);
        }
      })
      .fail(function (error) {
        console.error("Error fetching streaming options:", error);
        callback(error, null);
      });
  });
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

function handlePrediction() {
  $("#loader").attr("class", "d-flex justify-content-center");
  var movie_list = [];

  $("#selectedMovies li").each(function () {
    movie_list.push($(this).text().replace('×', '').trim());
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
    success: handlePredictionSuccess,
    error: function (error) {
      console.log("ERROR ->" + error);
      $("#loader").attr("class", "d-none");
    },
  });
}

function escapeHTML(str) {
  return str.replace(/\\/g, "\\\\")  // Escape backslashes
    .replace(/'/g, "\\'")    // Escape single quotes for JS
    .replace(/"/g, "&quot;") // Escape double quotes for HTML
    .replace(/\n/g, "\\n")   // Escape newlines
    .replace(/\r/g, "\\r")   // Escape carriage returns
    .replace(/\t/g, "\\t");  // Escape double quotes
}

function handlePredictionSuccess(response) {
  var data = JSON.parse(response);
  var container = document.getElementById("predictedMovies");
  var title = document.createElement("h2");
  title.className = "recommendations-title";
  title.textContent = "Recommended Movies";
  document.getElementById("recommended_block").appendChild(title);

  // Clear existing content
  container.innerHTML = "";

  // Create movie posters grid
  data.forEach((movie, index) => {
    const posterContainer = document.createElement("div");
    posterContainer.className = "movie-poster-container";
    posterContainer.onclick = () => showMovieModal(movie, index);

    // Create poster image
    const posterImg = document.createElement("img");
    posterImg.src = fetchPosterURL(movie.imdb_id);
    posterImg.alt = movie.title;
    posterImg.className = "movie-poster";

    // Create genre overlay
    const overlay = document.createElement("div");
    overlay.className = "genre-overlay";
    const genreText = document.createElement("p");
    genreText.className = "genre-text";
    genreText.textContent = movie.genres;
    overlay.appendChild(genreText);

    posterContainer.appendChild(posterImg);
    posterContainer.appendChild(overlay);
    container.appendChild(posterContainer);

    // Create modal structure (hidden initially)
    createMovieModal(movie, index);
    fetchStreamingOptions(movie.movieId, function (err, streamingOptions) {
      const streamingContainer = document.getElementById(`streaming-container-${index}`);
      if (streamingContainer) {
        if (err) {
          streamingContainer.innerHTML = "<p>No streaming options available</p>";
        } else {
          let optionsHTML = "<p>Streaming Options</p><ul>";
          streamingOptions.forEach(option => {
            optionsHTML += `<li><a href="${option.link}" target="_blank">${option.service.name} (${option.type})</a></li>`;
          });
          optionsHTML += "</ul>";
          streamingContainer.innerHTML = optionsHTML;
        }
      }
    });
  });

  $("#loader").attr("class", "d-none");
}

function createMovieModal(movie, index) {
  const escapedTitle = escapeHTML(movie.title);
  const escapedOverview = escapeHTML(movie.overview);

  const modalHTML = `
      <div id="movieModal-${index}" class="movie-modal">
          <div class="modal-content">
              <div class="modal-header">
                  <h3 class="modal-title">${escapedTitle}</h3>
                  <button class="modal-close" onclick="closeMovieModal(${index})">&times;</button>
              </div>
              <div class="modal-body">
                  <div id="trailer-container-${index}" class="trailer-container">
                      <!-- Trailer will be embedded here -->
                  </div>
                  <p class="movie-description">${escapedOverview}</p>
                  <div id="streaming-container-${index}" class="streaming-container">
          <p>Loading streaming options...</p>
        </div>
                  <div class="modal-actions">
                      <a href="https://www.imdb.com/title/${movie.imdb_id}" 
                         target="_blank" 
                         class="modal-button imdb-button">
                         Check IMDb
                      </a>
                      <button 
                          class="modal-button review-button" 
                          data-bs-toggle="modal" 
                          id="modalButton-${index}" 
                          data-bs-target="#reviewModal-${index}">
                          Write Review
                      </button>
                      <button type="button" onclick="addTOWatchListClick('${movie.movieId}', '${escapedTitle}', '${escapedOverview}', '${movie.poster_path}', '${movie.imdb_id}', '${movie.runtime}', '${index}')" id="addToWatchList-${index}" class="btn btn-primary modal-save">Add To Watchlist</button>

                      
                  </div>
              </div>
          </div>
      </div>

      <!-- Review Modal -->
      <div class="modal fade review-modal" id="reviewModal-${index}" tabindex="-1" aria-labelledby="reviewModalLabel" aria-hidden="true">
          <div class="modal-dialog">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="reviewModalLabel">Write your review for ${movie.title}</h5>
                      <button type="button" onclick="modalOnClose(${index})" id="closeModal-${index}" class="btn-close" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                      <div class="mb-3">
                          <textarea class="form-control" rows="10" id="review-${index}"></textarea>
                          <!-- Hidden fields moved into the review modal -->
                          <div class="movie-data" hidden>
                              <div class="movieId">${movie.movieId}</div>
                              <div class="genres">${movie.genres}</div>
                              <div class="imdb_id">${movie.imdb_id}</div>
                              <div class="poster_path">${movie.poster_path}</div>
                              <div class="runtime">${movie.runtime}</div>
                              <div class="title">${escapedTitle}</div>
                              <div class="overview">${movie.overview}</div>

                          </div>
                      </div>
                  </div>
                  <div class="modal-footer">
                      <button type="button" onclick="modalOnClick(${index})" id="saveChanges-${index}" class="btn btn-primary modal-save">Save changes</button>
                  </div>
              </div>
          </div>
      </div>
  `;

  document.getElementById("modalParent").insertAdjacentHTML('beforeend', modalHTML);
}
function showMovieModal(movie, index) {
  const modal = document.getElementById(`movieModal-${index}`);
  modal.style.display = "block";
  document.body.style.overflow = "hidden";

  // Fetch and embed trailer
  const videoID = fetchTrailerVideoID(movie.title);
  if (videoID) {
    embedTrailer(videoID, `#trailer-container-${index}`);
  }
}

function closeMovieModal(index) {
  const modal = document.getElementById(`movieModal-${index}`);
  modal.style.display = "none";
  document.body.style.overflow = "auto";

  // Clear trailer container
  document.querySelector(`#trailer-container-${index}`).innerHTML = "";
}

window.modalOnClose = function (index) {
  $(`#review-${index}`).val('');
};

window.onclick = function (event) {
  if (event.target.classList.contains('movie-modal')) {
    const index = event.target.id.split('-')[1];
    closeMovieModal(index);
  }
};

function handleFeedback() {
  var notifyMeButton = document.getElementById("checkbox");
  notifyMeButton.disabled = false;
  var myForm = $("fieldset");
  var data = {};
  var labels = {
    1: "Dislike",
    2: "Yet to watch",
    3: "Like",
  };

  // Check if any movies selected before giving feedback
  if (myForm.length == 0) {
    alert("No movies found. Please add movies to provide feedback.");
    return;
  }

  var error = false;

  // Collect feedback data
  for (var i = 0; i < myForm.length; i++) {
    var input = $("#" + i)
      .find("div")
      .find("input:checked")[0];
    var movieName = $("#" + i)
      .find("div")
      .find("li")[0].innerText;

    if (!input) {
      error = true;
      break;
    }

    data[movieName] = labels[input.value];
  }

  if (error) {
    alert("Please select a feedback for all movies.");
    return;
  }

  // Store feedback data and send to server
  saveFeedbackData(data);
}

function saveFeedbackData(data) {
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
}

function handleNotification() {
  var data = JSON.parse(localStorage.getItem("fbData"));
  $("#loaderSuccess").attr("class", "d-flex justify-content-center");

  if (!data) {
    alert("No feedback data found. Please provide feedback.");
    return;
  }

  sendNotificationEmail(data);
}

function sendNotificationEmail(data) {
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
    success: handleEmailSuccess,
    error: handleEmailError,
  });
}

function handleEmailSuccess(response) {
  $("#loaderSuccess").attr("class", "d-none");
  $("#emailSentSuccess").show();

  setTimeout(function () {
    $("#emailSentSuccess").fadeOut("slow");
  }, 2000);

  $('#area1').attr('placeholder', 'Email');
  $('#emailField').val('');
}

function handleEmailError(error) {
  $("#loaderSuccess").attr("class", "d-none");
  console.log("ERROR ->" + error);
  localStorage.removeItem("fbData");
}

// Modal related functions (these need to be global as they're called from HTML)
window.modalOnClose = function (index) {
  $(`#review-${index}`).val('');
};

window.modalOnClick = function (index) {
  const reviewText = $(`#review-${index}`).val();
  // Add your review submission logic here
  $(`#closeModal-${index}`).click();
};

function fetchRapidAPIKey(callback) {
  $.ajax({
    type: "GET",
    url: "/get-rapidapi-key",
    success: function (response) {
      callback(null, response.key);
    },
    error: function (error) {
      console.error("Error fetching API key:", error);
      callback(error, null);
    }
  });
}


