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

    modalOnClick = (i) => {

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
    addTOWatchListClick = (
        movieId,
        title,
        overview,
        poster_path,
        imdb_id,
        runtime,
        index
    ) => {
        const data = {
            movieId,
            title,
            overview,
            poster_path,
            imdb_id,
            runtime,
        };
        console.log("I AM HERE")
        $.ajax({
            type: "POST",
            url: "/add_to_watchlist",
            dataType: "json",
            contentType: "application/json;charset=UTF-8",
            traditional: "true",
            cache: false,
            data: JSON.stringify(data),
            success: (response) => {
                $(`#addToWatchList-${index}`).prop("disabled", true);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR, textStatus, errorThrown, "-----------------");
            },
        });
    };
});