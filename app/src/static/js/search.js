$(document).ready(function () {
  modalOnClick = (i) => {
    var main_element = $(`#modalButton-${i}`).siblings();
    var data = {
      title: main_element[0].textContent,
      runtime: parseInt(main_element[1].textContent),
      overview: main_element[2].textContent,
      movieId: main_element[4].textContent,
      genres: main_element[5].textContent,
      imdb_id: main_element[6].textContent,
      poster_path: main_element[7].textContent,
      review_text: $(`#review-${i}`)[0].value,
    };
    $.ajax({
      type: "POST",
      url: "/postReview",
      dataType: "json",
      contentType: "application/json;charset=UTF-8",
      traditional: "true",
      cache: false,
      data: JSON.stringify(data),
      success: (response) => {
        $(`#reviewModal-${i}`).modal("toggle");
        $(`#review-${i}`).value = "";
        $("#saved-flash").attr("hidden", false);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Parse error response
        const errorData = JSON.parse(jqXHR.responseText);
        const errorMessage = errorData.message;

        // Display error message
        alert(`Error: ${errorMessage}`);
      },
    });
  };

  addTOWatchListClick = (movieId, i) => {
    const data = {
      movieId,
    };

    $.ajax({
      type: "POST",
      url: "/add_to_watchlist",
      dataType: "json",
      contentType: "application/json;charset=UTF-8",
      traditional: "true",
      cache: false,
      data: JSON.stringify(data),
      success: (response) => {
        $(`#addToWatchList-${i}`).prop("disabled", true);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown, "-----------------");
      },
    });
  };

  modalOnClose = (i) => {
    $(`#reviewModal-${i}`).modal("toggle");
  };
});
