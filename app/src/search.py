"""
Copyright (c) 2023 Makarand Pundlik, Varun Varatharajan, Michelle Varghese
This code is licensed under MIT license (see LICENSE for details)

@author: PopcornPicks
"""
import os
import pandas as pd
import requests
#from flask import jsonify, request, render_template


app_dir = os.path.dirname(os.path.abspath(__file__))
code_dir = os.path.dirname(app_dir)
project_dir = os.path.dirname(code_dir)


class Search:
    """
    Search feature for landing page
    """

    df = pd.read_csv(project_dir + "/data/movies.csv")

    def __init__(self):
        pass

    def starts_with(self, word):
        """
        Function to check movie prefix
        """
        n = len(word)
        res = []
        word = word.lower()
        for x in self.df["title"]:
            curr = x.lower()
            if curr[:n] == word:
                res.append(x)
        return res

    def anywhere(self, word, visited_words):
        """
        Function to check visited words
        """
        res = []
        word = word.lower()
        for x in self.df["title"]:
            if x not in visited_words:
                curr = x.lower()
                if word in curr:
                    res.append(x)
        return res

    def results(self, word):
        """
        Function to serve the result render
        """
        starts_with = self.starts_with(word)
        visited_words = set()
        for x in starts_with:
            visited_words.add(x)
        anywhere = self.anywhere(word, visited_words)
        starts_with.extend(anywhere)
        return starts_with

    def results_top_ten(self, word):
        """
        Function to get top 10 results
        """
        return self.results(word)[:10]

    def format_movie_name(self,movie):
        return movie.replace(" ", "%20")

    def get_movie_from_tmdb(self,query):
        TMDB_API_KEY = os.getenv("TMDB_API_KEY")
        timeout = 100
        movie = self.format_movie_name(query)
        print('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',movie)
        url = f"https://api.themoviedb.org/3/search/movie?query={self.format_movie_name(query)}&page=1&api_key={TMDB_API_KEY}&language=en-US"
        response = requests.get(url, timeout=timeout)
        data = response.json()
        print(data['results'],'---------------')
#if __name__ == "__main__":
#    app.run()
