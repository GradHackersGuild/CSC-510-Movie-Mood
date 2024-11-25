// search.js
$(document).ready(function () {
    // Helper function to show notification
    const showNotification = (message, type = 'success') => {
        const flash = $("#saved-flash");
        flash.text(message);
        flash.removeClass('alert-success alert-danger')
            .addClass(`alert-${type}`)
            .removeAttr('hidden')
            .fadeIn();

        setTimeout(() => {
            flash.fadeOut(() => {
                flash.attr('hidden', true);
            });
        }, 3000);
    };

    // Helper function to show/hide loader
    const toggleLoader = (show) => {
        const loader = $("#loader");
        show ? loader.removeClass('d-none') : loader.addClass('d-none');
    };

    // Modal click handler
    // window.modalOnClick = (i) => {
    //     const mainElement = $(`#modalButton-${i}`).siblings();
    //     const reviewText = $(`#review-${i}`).val();

    //     console.log('iam movie yooooo hello', mainElement)
    //     // title = mainElement[0].textContent,
    //     //     runtime = parseInt(mainElement[1].textContent),
    //     //     overview = mainElement[2].textContent,
    //     //     movieId = mainElement[4].textContent,
    //     //     genres = mainElement[5].textContent,
    //     //     imdb_id = mainElement[6].textContent,
    //     //     poster_path = mainElement[7].textContent,
    //     //     review_text = reviewText


    //     // // console.log(title, runtime);
    //     // console.log(overview, movieId);

    //     const data = {
    //         title: mainElement[0].textContent,
    //         runtime: parseInt(mainElement[1].textContent),
    //         overview: mainElement[2].textContent,
    //         movieId: mainElement[4].textContent,
    //         genres: mainElement[5].textContent,
    //         imdb_id: mainElement[6].textContent,
    //         poster_path: mainElement[7].textContent,
    //         review_text: reviewText
    //     };

    //     // const data = {
    //     //     title: $(`#modalButton-${i}`).closest('.card-body').find('.card-title').text().trim(),
    //     //     runtime: parseInt($(`#modalButton-${i}`).closest('.card-body').find('.card-subtitle').text().trim()),
    //     //     overview: $(`#modalButton-${i}`).closest('.card-body').find('.card-text').eq(0).text().trim(),
    //     //     movieId: $(`#modalButton-${i}`).closest('.card-body').find('.movieId').text().trim(),
    //     //     genres: $(`#modalButton-${i}`).closest('.card-body').find('.genres').text().trim(),
    //     //     imdb_id: $(`#modalButton-${i}`).closest('.card-body').find('.imdb_id').text().trim(),
    //     //     poster_path: $(`#modalButton-${i}`).closest('.card-body').find('.poster_path').text().trim(),
    //     //     review_text: $(`#review-${i}`).val().trim()
    //     // };

    //     // print("iam movie yooooo", movieId);
    //     toggleLoader(true);

    //     $.ajax({
    //         type: "POST",
    //         url: "/postReview",
    //         dataType: "json",
    //         contentType: "application/json;charset=UTF-8",
    //         traditional: "true",
    //         cache: false,
    //         data: JSON.stringify(data),
    //         success: (response) => {
    //             $(`#reviewModal-${i}`).modal('hide');
    //             $(`#review-${i}`).val('');
    //             showNotification('Review saved successfully!');
    //         },
    //         error: function (jqXHR) {
    //             const errorData = JSON.parse(jqXHR.responseText);
    //             showNotification(errorData.message || 'An error occurred', 'danger');
    //         },
    //         complete: () => {
    //             toggleLoader(false);
    //         }
    //     });
    // };

    modalOnClick = (i) => {
        // const mainElement = $(`#modalButton-${i}`).siblings();
        // const reviewText = $(`#review-${i}`).val();

        // console.log('iam movie yooooo hello', mainElement)
        // // title = mainElement[0].textContent,
        // //     runtime = parseInt(mainElement[1].textContent),
        // //     overview = mainElement[2].textContent,
        // //     movieId = mainElement[4].textContent,
        // //     genres = mainElement[5].textContent,
        // //     imdb_id = mainElement[6].textContent,
        // //     poster_path = mainElement[7].textContent,
        // //     review_text = reviewText


        // // // console.log(title, runtime);
        // // console.log(overview, movieId);

        // const data = {
        //     title: mainElement[0].textContent,
        //     runtime: parseInt(mainElement[1].textContent),
        //     overview: mainElement[2].textContent,
        //     movieId: mainElement[4].textContent,
        //     genres: mainElement[5].textContent,
        //     imdb_id: mainElement[6].textContent,
        //     poster_path: mainElement[7].textContent,
        //     review_text: reviewText
        // };

        // // const data = {
        // //     title: $(`#modalButton-${i}`).closest('.card-body').find('.card-title').text().trim(),
        // //     runtime: parseInt($(`#modalButton-${i}`).closest('.card-body').find('.card-subtitle').text().trim()),
        // //     overview: $(`#modalButton-${i}`).closest('.card-body').find('.card-text').eq(0).text().trim(),
        // //     movieId: $(`#modalButton-${i}`).closest('.card-body').find('.movieId').text().trim(),
        // //     genres: $(`#modalButton-${i}`).closest('.card-body').find('.genres').text().trim(),
        // //     imdb_id: $(`#modalButton-${i}`).closest('.card-body').find('.imdb_id').text().trim(),
        // //     poster_path: $(`#modalButton-${i}`).closest('.card-body').find('.poster_path').text().trim(),
        // //     review_text: $(`#review-${i}`).val().trim()
        // // };

        // // print("iam movie yooooo", movieId);
        // toggleLoader(true);

        // $.ajax({
        //     type: "POST",
        //     url: "/postReview",
        //     dataType: "json",
        //     contentType: "application/json;charset=UTF-8",
        //     traditional: "true",
        //     cache: false,
        //     data: JSON.stringify(data),
        //     success: (response) => {
        //         $(`#reviewModal-${i}`).modal('hide');
        //         $(`#review-${i}`).val('');
        //         showNotification('Review saved successfully!');
        //     },
        //     error: function (jqXHR) {
        //         const errorData = JSON.parse(jqXHR.responseText);
        //         showNotification(errorData.message || 'An error occurred', 'danger');
        //     },
        //     complete: () => {
        //         toggleLoader(false);
        //     }
        // });
        // var main_element = $(`#modalButton-${i}`).siblings();
        // console.log('iam movie yooooo hello', main_element)

        // console.log("movie id", main_element[4].textContent);

        // var data = {
        //     title: main_element[0].textContent,
        //     runtime: parseInt(main_element[1].textContent),
        //     overview: main_element[2].textContent,
        //     movieId: main_element[4].textContent,
        //     genres: main_element[5].textContent,
        //     imdb_id: main_element[6].textContent,
        //     poster_path: main_element[7].textContent,
        //     review_text: $(`#review-${i}`)[0].value
        // }

        // const cardBody = $(`#modalButton-${i}`).closest('.card-body');

        // // Extract the required data using more explicit selectors
        // const data = {
        //     title: cardBody.find('.card-title').text().trim(),
        //     runtime: parseInt(cardBody.find('.card-subtitle').text().replace(' minutes', '').trim()),
        //     overview: cardBody.find('.card-text').eq(0).text().trim(), // First .card-text is overview
        //     movieId: cardBody.find('.movieId').text().trim(),
        //     genres: cardBody.find('.genres').text().trim(),
        //     imdb_id: cardBody.find('.imdb_id').text().trim(),
        //     poster_path: cardBody.find('.poster_path').text().trim(),
        //     review_text: $(`#review-${i}`).val().trim()
        // };
        // console.log('Extracted Data:', data);


        // $.ajax({
        //     type: "POST",
        //     url: "/postReview",
        //     dataType: "json",
        //     contentType: "application/json;charset=UTF-8",
        //     traditional: "true",
        //     cache: false,
        //     data: JSON.stringify(data),
        //     success: (response) => {
        //         $(`#reviewModal-${i}`).modal('toggle');
        //         $(`#review-${i}`).value = "";
        //         $("#saved-flash").attr("hidden", false);
        //     },
        //     error: function (jqXHR, textStatus, errorThrown) {
        //         // Parse error response
        //         const errorData = JSON.parse(jqXHR.responseText);
        //         const errorMessage = errorData.message;

        //         // Display error message
        //         alert(`Error: ${errorMessage}`);
        //     }
        // });


        window.modalOnClick = function (index) {
            // Get the review modal
            const reviewModal = $(`#reviewModal-${index}`);
            console.log("hello", reviewModal);


            // Extract data from the modal
            const data = {
                title: reviewModal.find('.title').text().trim(),
                review_text: reviewModal.find(`#review-${index}`).val().trim(),
                runtime: reviewModal.find('.runtime').text().trim(),
                movieId: reviewModal.find('.movieId').text().trim(),
                genres: reviewModal.find('.genres').text().trim(),
                imdb_id: reviewModal.find('.imdb_id').text().trim(),
                overview: reviewModal.find('.overview').text().trim(),
                poster_path: reviewModal.find('.poster_path').text().trim(),
            };

            console.log('Review Data:', data);

            // Validate data
            if (!data.review_text || !data.movieId) {
                alert('Error: Missing review text or movie ID.');
                return;
            }

            // Send the review via AJAX
            $.ajax({
                type: 'POST',
                url: '/postReview',
                dataType: 'json',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(data),
                success: (response) => {
                    $(`#reviewModal-${index}`).modal('hide');
                    $(`#review-${index}`).val(''); // Clear review textarea
                    showNotification('Review saved successfully!');
                },
                error: (jqXHR) => {
                    const errorData = JSON.parse(jqXHR.responseText);
                    const errorMessage = errorData.message || 'An error occurred';
                    showNotification(errorMessage, 'danger');
                },
            });
        };

    };


    // Modal close handler
    window.modalOnClose = (i) => {
        $(`#reviewModal-${i}`).modal('hide');
    };

    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();

    // Add smooth scroll behavior
    $('.predict-btn').click(function () {
        toggleLoader(true);
        // Your existing predict functionality here
    });

    // Enhance search input
    const searchInput = $('#searchBox');
    searchInput.on('focus', function () {
        $(this).parent().addClass('focused');
    }).on('blur', function () {
        $(this).parent().removeClass('focused');
    });

    // Add animation to movie cards
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe new movie cards as they're added
    const observeMovieCards = () => {
        document.querySelectorAll('.movie-card').forEach(card => {
            observer.observe(card);
        });
    };

    // Call this function after loading new movies
    observeMovieCards();
});