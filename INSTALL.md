## Installation Guide

### Step 1: Git Clone the Repository
```bash
git clone https://github.com/GradHackersGuild/CSC-510-Movie-Mood.git
```

### Step 2: Install the required packages
```bash
pip install -r requirements.txt
```

### Step 3: Get API Keys

To get an API key from TMDB:

1. [Signup for an account](https://www.themoviedb.org/signup)
2. Under the Account icon, click **Settings**.
3. On the **API** page, click on the link under the **Request an API Key** section.
4. Register an API key.
5. Agree to the terms of use and fill in the required information.

To get an API key from Google Console for Youtube Data:
1. Sign up with google console (free tier). [Google Console](https://console.cloud.google.com/)
2. Select/Create a project.
3. Go to API/Services section and search for Youtube Data API v3 and add it.
4. Generate API credentials for it after agreeing to the terms of use.

### Step 4: Create a `.env` file
In the project directory, create a `.env` file and add your API keys:
```bash
# .env
TMDB_API_KEY=YOUR_TMDB_API_KEY
YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY
```

### Step 5: Host the database on Render.
Follow the following steps to setup the database on Render.
1. Go to [Render](https://render.com/).
2. Create a new PostgreSQL instance in the free tier.
3. Render will spin up an instance and provide you with hostname, database name, user:password and database URL.
4. In __init__.py, change the database URL with the one that was created by Render for your instance.

### Step 6: View DB data using pgAadmin4.
Follow the following steps to view DB data using pgAdmin4.
1. Download and install [pgAdmin](https://www.pgadmin.org/download/).
2. Click on Add new server and provide a name for your instance.
3. In the connection tab, provide necessary details.
4. The hostname you are required to enter here is a part of the external DB URL. Extract the text in the url after '@' up until .com.
5. Click save, and now your instance is ready to be viewed. 

### Step 7: Run the following commands
Navigate to the app directory and initialize the database:
```bash
cd app
python init_db.py
python run.py
```

### Step 8: Open the Application
Open your browser and go to:
```
http://127.0.0.1:8000/
```

### Enjoy!
Start matching your mood with the perfect movies!
