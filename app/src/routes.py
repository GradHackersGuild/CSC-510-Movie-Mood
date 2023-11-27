"""
Copyright (c) 2023 Abhinav Sinha, Chandana Ray, Sam Kwiatkowski-Martin, Tanmay Pardeshi
This code is licensed under MIT license (see LICENSE for details)

@author: PopcornPicks
"""

import json
import requests

from flask import render_template, url_for, redirect, request, jsonify
from flask_login import login_user, current_user, logout_user, login_required
from flask_socketio import emit
from src import app, db, bcrypt, socket
from src.search import Search
from src.utils import beautify_feedback_data, send_email_to_user
from src.item_based import recommend_for_new_user
from src.models import User
from flask import Flask, request, jsonify

from dotenv import load_dotenv
import os

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
    return render_template("search.html")

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
            show_message = True
            message = "Invalid Credentials! Try again!"
            return render_template("login.html", message=message, show_message=show_message)
        # When the login page is hit
        return render_template("login.html")
    #pylint: disable=broad-except
    except Exception as e:
        print(f"Error is {e}")
        return render_template('login.html', message=e, show_message=True)


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
            hashed_password = bcrypt.generate_password_hash(password)
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

@app.route("/profile_page", methods=["GET"])
@login_required
def profile_page():
    """
        Profile Page
    """
    return render_template("profile.html", user=current_user, search=False)

@app.route("/search_page")
@login_required
def search_page():
    """
        Search Page
    """
    if current_user.is_authenticated:
        return render_template("search.html", user=current_user, search=True)
    return redirect(url_for('landing_page'))

@app.route("/chat")
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

####poster 

@app.route("/getPosterURL", methods=["GET"])
def get_poster_url():
    imdb_id = request.args.get("imdbID")
    poster_url = fetch_poster_url(imdb_id)
    return jsonify({"posterURL": poster_url})

#Function to fetch the poster URL using TMDb API
def fetch_poster_url(imdb_id):
    url = f"https://api.themoviedb.org/3/find/{imdb_id}?api_key={TMDB_API_KEY}&external_source=imdb_id"
    response = requests.get(url)
    data = response.json()
    # Check if movie results are present and have a poster path
    if "movie_results" in data and data["movie_results"]:
        poster_path = data["movie_results"][0].get("poster_path")
        if poster_path:
            return f"https://image.tmdb.org/t/p/w500{poster_path}"

        return None

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
    data = data.drop(columns=["poster_path", ])
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

@app.route("/feedback", methods=["POST"])
def feedback():
    """
    Handles user feedback submission and mails the results.
    """
    data = json.loads(request.data)
    return data

@app.route("/sendMail", methods=["POST"])
def send_mail():
    """
    Handles user feedback submission and mails the results.
    """
    data = json.loads(request.data)
    user_email = data['email']
    send_email_to_user(user_email, beautify_feedback_data(data))
    return data

@app.route("/success")
def success():
    """
    Renders the success page.
    """
    return render_template("success.html", user=current_user)

@app.route('/logout')
def logout():
    """
        Logout Function
    """
    logout_user()
    return redirect('/')


if __name__ == "__main__":
    app.run(port=5000)
