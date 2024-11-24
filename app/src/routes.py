"""
Copyright (c) 2023 Makarand Pundlik, Varun Varatharajan, Michelle Varghese
This code is licensed under MIT license (see LICENSE for details)

@author: PopcornPicks
"""

import json
import os
import requests

from flask import render_template, url_for, redirect, request, jsonify
from flask_login import login_user, current_user, logout_user, login_required
from flask_socketio import emit
from dotenv import load_dotenv
from src import app, db, bcrypt, socket
from src.search import Search
from src.item_based import recommend_for_new_user
from src.models import User, Movie, Review

load_dotenv()
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

@app.route("/", methods={"GET"})
@app.route("/home", methods={"GET"})
def landing_page():
    """
        Renders the landing page with the user.
    """
    if current_user.is_authenticated:
        return redirect(url_for('search_page'))
    return render_template("landing_page.html")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    """
        Signup Page Flow
    """
    username = ""
    try:
        # If user has already logged in earlier and has an active session
        if current_user.is_authenticated:
            return redirect(url_for('search_page'))
        # If user has not logged in and a signup request is sent by the user
        if request.method == "POST":
            username = request.form['username']
            first_name = request.form['first_name']
            last_name = request.form['last_name']
            email = request.form['email']
            password = request.form['password']
            hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
            user = User(username=username, email=email, first_name=first_name,
                        last_name=last_name, password=hashed_password)
            db.session.add(user)
            db.session.commit()
            login_user(user)
            return redirect(url_for('search_page'))
        # For GET method
        return render_template('signup.html')
    # If user already exists
    #pylint: disable=broad-except
    except Exception as e:
        print(f"Error is {e}")
        message = f"Username {username} already exists!"
        return render_template('signup.html', message=message, show_message=True)

@app.route("/login", methods=["GET", "POST"])
def login():
    """
        Login Page Flow 
    """
    try:
        # If user has already logged in earlier and has an active session
        if current_user.is_authenticated:
            return redirect(url_for('search_page'))
        # If user has not logged in and a login request is sent by the user
        if request.method == "POST":
            username = request.form["username"]
            password = request.form["password"]
            user = User.query.filter_by(username=username).first()
            # Successful Login
            if user and bcrypt.check_password_hash(user.password, password):
                login_user(user)
                return redirect(url_for('search_page'))
            # Invalid Credentials
            message = "Invalid Credentials! Try again!"
            return render_template("login.html", message=message, show_message=True)
        # When the login page is hit
        return render_template("login.html")
    #pylint: disable=broad-except
    except Exception as e:
        print(f"Error is {e}")
        message = "Invalid Credentials! Try again!"
        return render_template('login.html', message=message, show_message=True)

@app.route('/logout')
def logout():
    """
        Logout Function
    """
    logout_user()
    return redirect('/')

@app.route("/profile_page", methods=["GET"])
@login_required
def profile_page():
    """
        Profile Page
    """
    yt_api_key = os.getenv("YOUTUBE_API_KEY")
    reviews_objects = Review.query.filter_by(user_id=current_user.id).all()
    reviews = []
    for review in reviews_objects:
        trailer_id = get_trailer_video_id(movie_object.title, yt_api_key)
        movie_object = Movie.query.filter_by(movieId=review.movieId).first()
        obj = {
            "title" : movie_object.title,
            "runtime" : movie_object.runtime,
            "overview" : movie_object.overview,
            "genres" : movie_object.genres,
            "imdb_id" : movie_object.imdb_id,
            "review_text" : review.review_text,
            "trailer_id" : trailer_id
        }
        print(trailer_id)
        reviews.append(obj)
    return render_template("profile.html", user=current_user, reviews=reviews, search=False)

@app.route("/search_page", methods=["GET"])
@login_required
def search_page():
    """
        Search Page
    """
    if current_user.is_authenticated:
        return render_template("search.html", user=current_user, search=True)
    return redirect(url_for('landing_page'))

@app.route("/predict", methods=["POST"])
def predict():
    """
    Predicts movie recommendations based on user ratings.
    """
    data = json.loads(request.data)
    data1 = data["movie_list"]
    training_data = []
    for movie in data1:
        movie_with_rating = {"title": movie, "rating": 5.0}
        if movie_with_rating not in training_data:
            training_data.append(movie_with_rating)
    data = recommend_for_new_user(training_data)
    data = data.to_json(orient="records")
    return jsonify(data)

@app.route("/search", methods=["POST"])
def search():
    """
        Handles movie search requests.
    """
    term = request.form["q"]
    finder = Search()
    filtered_dict = finder.results_top_ten(term)
    resp = jsonify(filtered_dict)
    resp.status_code = 200
    return resp

@app.route("/chat", methods=["GET"])
def chat_page():
    """
        Renders chat room page
    """
    if current_user.is_authenticated:
        return render_template("movie_chat.html", user=current_user)
    return redirect(url_for('landing_page'))

@socket.on('connections')
def show_connection(data):
    """
        Prints out if the connection to the chat page is successful
    """
    print('received message: ' + data)

@socket.on('message')
def broadcast_message(data):
    """
        Distributes messages sent to the server to all clients in real time
    """
    emit('message', {'username': data['username'], 'msg': data['msg']}, broadcast=True)

@app.route("/getPosterURL", methods=["GET"])
def get_poster_url():
    """
    Retrieve the poster URL for the recommended movie based on IMDb ID.
    return: JSON response containing the poster URL.
    """
    imdb_id = request.args.get("imdbID")
    poster_url = fetch_poster_url(imdb_id)
    return jsonify({"posterURL": poster_url})

def fetch_poster_url(imdb_id):
    """
    Fetch the poster URL for a movie from The Movie Database (TMDB) API.
    """
    timeout = 100
    url = f"https://api.themoviedb.org/3/find/{imdb_id}?"\
    f"api_key={TMDB_API_KEY}&external_source=imdb_id"
    response = requests.get(url, timeout=timeout)
    data = response.json()
    # Check if movie results are present and have a poster path
    if "movie_results" in data and data["movie_results"]:
        poster_path = data["movie_results"][0].get("poster_path")
        return f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None
    return None

def get_trailer_video_id(movie_name, api_key):
    """
    Fetch the YouTube video ID of the first trailer for a given movie.

    Args:
        movie_name (str): Movie name to search for.
        api_key (str): YouTube Data API key.

    Returns:
        str: YouTube video ID of the first result, or `None` if no results.
    """
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": f"{movie_name} trailer",
        "type": "video",
        "maxResults": 1,
        "key": api_key,
    }
    response = requests.get(url, params=params, timeout=10)
    results = response.json()
    if "items" in results and len(results["items"]) > 0:
        return results["items"][0]["id"]["videoId"]
    return None

@app.route("/postReview", methods=["POST"])
@login_required
def post_review():
    """
        API for the user to submit a review
    """
    # Check if the movie already exists in the database.
    # If it exists, fetch the movie ID and save the review
    # If it does not, save the movie details and save the review

    data = json.loads(request.data)
    user_object = User.query.filter_by(username=current_user.username).first()
    user_id = user_object.id
    review_text = data['review_text']
    movie_id = data["movieId"]
    movie_object = Movie.query.filter_by(movieId=movie_id).first()
    if movie_object is None:
        # Create a new movie object
        movie = Movie(
            movieId = movie_id,
            title = data['title'],
            runtime = data['runtime'],
            overview = data['overview'],
            genres = data['genres'],
            imdb_id = data['imdb_id'],
            poster_path = data['poster_path']
        )
        db.session.add(movie)
        db.session.commit()
    review = Review(
        review_text = review_text,
        movieId = movie_id,
        user_id = user_id
    )
    db.session.add(review)
    db.session.commit()
    return jsonify({"success": "success"})

@app.route("/movies", methods=["GET"])
@login_required
def movie_page():
    """
        Get movies and their reviews
    """
    yt_api_key = os.getenv("YOUTUBE_API_KEY")
    print(yt_api_key)
    movies_ojbects = Movie.query.all()
    movies = []
    for movie_object in movies_ojbects:
        reviews = []
        trailer_id = get_trailer_video_id(movie_object.title, yt_api_key)
        print(trailer_id)
        obj1 = {
            "title" : movie_object.title,
            "runtime" : movie_object.runtime,
            "overview" : movie_object.overview,
            "genres" : movie_object.genres,
            "imdb_id" : movie_object.imdb_id,
            "trailer_id" : trailer_id
        }
        reviews_objects = Review.query.filter_by(movieId = movie_object.movieId).all()
        for review_object in reviews_objects:
            user = User.query.filter_by(id=review_object.user_id).first()
            obj2 = {
                "username": user.username,
                "name": f"{user.first_name} {user.last_name}",
                "review_text": review_object.review_text
            }
            reviews.append(obj2)
        obj1["reviews"] = reviews
        movies.append(obj1)
    return render_template("movie.html", movies=movies, user=current_user)

@app.route('/new_movies', methods=["GET"])
@login_required
def new_movies():
    """
        API to fetch new movies
    """
    # Replace YOUR_TMDB_API_KEY with your actual TMDb API key
    tmdb_api_key = TMDB_API_KEY
    endpoint = 'https://api.themoviedb.org/3/trending/movie/day?language=en-US'

    # Set up parameters for the request
    params = {
        'api_key': tmdb_api_key,
        'language': 'en-US',  # You can adjust the language as needed
        'page': 1  # You may want to paginate the results if there are many
    }
    try:
    # Make the request to TMDb API
        response = requests.get(endpoint, params=params, timeout=10)
    except (requests.exceptions.HTTPError,
            requests.exceptions.ConnectionError,
            requests.exceptions.Timeout,
            requests.exceptions.RequestException
            ) as e:
        return render_template('new_movies.html', show_message=True,
                           message=e)
    if response.status_code == 200:
        # Parse the JSON response
        movie_data = response.json().get('results', [])

        return render_template('new_movies.html', movies=movie_data, user=current_user)
    return render_template('new_movies.html', show_message=True,
                           message='Error fetching movie data')

@app.route('/celebrity', methods=["GET"])
@login_required
def celebrity():
    """
    API to fetch celebrity
    """
    tmdb_api_key = TMDB_API_KEY
    endpoint = 'https://api.themoviedb.org/3/trending/person/day?language=en-US'

    params = {
        'api_key': tmdb_api_key,
        'language': 'en-US',
        'page': 1
    }
    try:
        response = requests.get(endpoint, params=params, timeout=10)
    except (requests.exceptions.HTTPError,
            requests.exceptions.ConnectionError,
            requests.exceptions.Timeout,
            requests.exceptions.RequestException) as e:
        return render_template('celebrity.html', show_message=True, message=e)

    if response.status_code == 200:
        # Parse the JSON response
        people_data = response.json().get('results', [])
        # Sort by popularity in descending order
        sorted_people = sorted(people_data, key=lambda x: x['popularity'], reverse=True)

        # Fetch additional details for each person
        for person in sorted_people:
            person_id = person['id']
            # pylint: disable=line-too-long
            details_response = requests.get(f'https://api.themoviedb.org/3/person/{person_id}?api_key={tmdb_api_key}&language=en-US', timeout=20)
            if details_response.status_code == 200:
                # pylint: disable=line-too-long
                person['biography'] = details_response.json().get('biography', 'No biography available.')

        return render_template('celebrity.html', people=sorted_people, user=current_user)
    # pylint: disable=line-too-long
    return render_template('celebrity.html', show_message=True, message='Error fetching people data')

@app.route('/new_series', methods=["GET"])
@login_required
def new_series():
    """
        API to fetch new series
    """
    # Replace YOUR_TMDB_API_KEY with your actual TMDb API key
    tmdb_api_key = TMDB_API_KEY
    endpoint = 'https://api.themoviedb.org/3/tv/airing_today'

    # Set up parameters for the request
    params = {
        'api_key': tmdb_api_key,
        'language': 'en-US',  # You can adjust the language as needed
        'page': 1  # You may want to paginate the results if there are many
    }
    try:
        # Make the request to TMDb API
        response = requests.get(endpoint, params=params, timeout=10)
    except (requests.exceptions.HTTPError,
            requests.exceptions.ConnectionError,
            requests.exceptions.Timeout,
            requests.exceptions.RequestException
            ) as e:
        return render_template('new_series.html', show_message=True,
                               message=e)
    if response.status_code == 200:
        # Parse the JSON response
        series_data = response.json().get('results', [])

        return render_template('new_series.html', series=series_data, user=current_user)
    return render_template('new_series.html', show_message=True,
                           message='Error fetching series data')

@app.route('/get-youtube-api-key', methods=['GET'])
def get_api_key():
    """
        Sending API key to client
    """
    api_key = os.getenv("YOUTUBE_API_KEY")
    if api_key:
        return jsonify({"key": api_key}), 200
    return jsonify({"error": "API key not found"}), 404
