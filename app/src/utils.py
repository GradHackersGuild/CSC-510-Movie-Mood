# pylint: disable=cyclic-import
"""
Copyright (c) 2023 Makarand Pundlik, Varun Varatharajan, Michelle Varghese
This code is licensed under MIT license (see LICENSE for details)

@author: PopcornPicks
"""
import logging
import smtplib
from smtplib import SMTPException
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import pandas as pd

def create_colored_tags(genres):
    """
        Utility function to create colored tags for different
        movie genres
    """
    if not isinstance(genres, list) or not all(isinstance(genre, str) for genre in genres):
        raise ValueError("Input must be a list of strings representing genres.")
    # Define colors for specific genres
    genre_colors = {
        'Musical': '#FF1493',  # DeepPink
        'Sci-Fi': '#00CED1',  # DarkTurquoise
        'Mystery': '#8A2BE2',  # BlueViolet
        'Thriller': '#FF6347',  # Tomato
        'Horror': '#FF4500',  # OrangeRed
        'Documentary': '#228B22',  # ForestGreen
        'Fantasy': '#FFA500',  # Orange
        'Adventure': '#FFD700',  # Gold
        'Children': '#32CD32',  # LimeGreen
        'Film-Noir': '#2F4F4F',  # DarkSlateGray
        'Comedy': '#FFB500',  # VividYellow
        'Crime': '#8B0000',  # DarkRed
        'Drama': '#8B008B',  # DarkMagenta
        'Western': '#FF8C00',  # DarkOrange
        'IMAX': '#20B2AA',  # LightSeaGreen
        'Action': '#FF0000',  # Red
        'War': '#B22222',  # FireBrick
        '(no genres listed)': '#A9A9A9',  # DarkGray
        'Romance': '#FF69B4',  # HotPink
        'Animation': '#4B0082'  # Indigo
    }
    tags = []
    for genre in genres:
        color = genre_colors.get(genre, '#CCCCCC')  # Default color if not found
        tag = f'<span style="background-color: {color}; color: #FFFFFF; padding: 5px; border-radius: 5px;">{genre}</span>'
        tags.append(tag)
    return ' '.join(tags)

def beautify_feedback_data(data):
    """
    Utility function to beautify the feedback json containing predicted movies for sending in email
    """
    # Create empty lists for each category
    yet_to_watch = []
    like = []
    dislike = []

    # Iterate through the data and categorize movies
    for movie, status in data.items():
        if status == 'Yet to watch':
            yet_to_watch.append(movie)
        elif status == 'Like':
            like.append(movie)
        elif status == 'Dislike':
            dislike.append(movie)


    # Create a category-dictionary of liked, disliked and yet to watch movies
    categorized_data_dict = {"Liked": like,
                             "Disliked": dislike, "Yet to Watch": yet_to_watch}

    return categorized_data_dict

def create_movie_genres(movie_genre_df):
    """
    Utility function for creating a dictionary for movie-genres mapping
    """
    # Create a dictionary to map movies to their genres
    movie_to_genres = {}

    # Iterating on all movies to create the map
    for row in movie_genre_df.iterrows():
        movie = row[1]['title']
        genres = row[1]['genres']  # get genres field

        # check if genres is None
        if genres is None:
            genres = []  # If None, set empty list
        else:
            genres = genres.split('|')  # otherwise split

        movie_to_genres[movie] = genres
    return movie_to_genres

def send_email_to_user(recipient_email, categorized_data):
    """
    Utility function to send movie recommendations to user over email
    """

    email_html_content = """
                        <html>
                        <head></head>
                        <body>
                            <h1 style="color: #333333;">Movie Recommendations from PopcornPicks</h1>
                            <p style="color: #555555;">Dear Movie Enthusiast,</p>
                            <p style="color: #555555;">We hope you're having a fantastic day!</p>
                            <div style="padding: 10px; border: 1px solid #cccccc; border-radius: 5px; background-color: #f9f9f9;">
                            <h2>Your Movie Recommendations:</h2>
                            <h3>Movies Liked:</h3>
                            <ul style="color: #555555;">
                                {}
                            </ul>
                            <h3>Movies Disliked:</h3>
                            <ul style="color: #555555;">
                                {}
                            </ul>
                            <h3>Movies Yet to Watch:</h3>
                            <ul style="color: #555555;">
                                {}
                            </ul>
                            </div>
                            <p style="color: #555555;">Enjoy your movie time with PopcornPicks!</p>
                            <p style="color: #555555;">Best regards,<br>PopcornPicks Team 🍿</p>
                        </body>
                        </html>
                        """

    # Email configuration
    smtp_server = 'smtp.gmail.com'
    # Port for TLS
    smtp_port = 587
    sender_email = 'popcornpicks504@gmail.com'

    # Use an app password since 2-factor authentication is enabled
    sender_password = ' '
    subject = 'Your movie recommendation from PopcornPicks'

    # Create the email message
    message = MIMEMultipart('alternative')
    message['From'] = sender_email
    message['To'] = recipient_email
    message['Subject'] = subject
    # Load the CSV file into a DataFrame
    movie_genre_df = pd.read_csv('../../data/movies.csv')
    # Creating movie-genres map
    movie_to_genres = create_movie_genres(movie_genre_df)
    # Create the email message with HTML content
    html_content = email_html_content.format(
        '\n'.join(f'<li>{movie} \
            {create_colored_tags(movie_to_genres.get(movie, ["Unknown Genre"]))}</li><br>' \
            for movie in categorized_data['Liked']),
        '\n'.join(f'<li>{movie} \
            {create_colored_tags(movie_to_genres.get(movie, ["Unknown Genre"]))}</li><br>' \
            for movie in categorized_data['Disliked']),
        '\n'.join(f'<li>{movie} \
            {create_colored_tags(movie_to_genres.get(movie, ["Unknown Genre"]))}</li><br>' \
            for movie in categorized_data['Yet to Watch']))

    # Attach the HTML email body
    message.attach(MIMEText(html_content, 'html'))

    # Connect to the SMTP server
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        # Start TLS encryption
        server.starttls()
        server.login(sender_email, sender_password)

        # Send the email
        server.sendmail(sender_email, recipient_email, message.as_string())
        logging.info("Email sent successfully!")

    except SMTPException as e:
        # Handle SMTP-related exceptions
        logging.error("SMTP error while sending email: %s", str(e))

    finally:
        server.quit()
