import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from llm.drama_metadata import get_llm_drama_details 
from scrapers.drama_scraper import find_poster as find_poster_url

load_dotenv()

app = Flask(__name__)

def get_llm_recommendations(genre):
    # TODO
    print(f"Getting LLM recommendations for: {genre}")
    return {"recommendations": []}

def scrape_top_dramas():
    # TODO: Implement scraping or LLM call for top dramas
    print("Fetching top dramas...")
    return {"dramas": []} # Update placeholder later

def scrape_new_releases():
    # TODO: Implement scraping or LLM call for new releases
    print("Fetching new releases...")
    return {"dramas": []} # Update placeholder later



@app.route('/fetch', methods=['GET'])
def fetch_drama():
    title = request.args.get('title')
    if not title:
        return jsonify({"error": "Title parameter is required"}), 400

    try:
        llm_details = get_llm_drama_details(title)

        if not llm_details or llm_details.get("description", "").startswith("Error"):
             print(f"LLM failed to provide details for '{title}'.")
             return jsonify({"error": f"Could not retrieve details for '{title}' from LLM."}), 500


        poster_url = find_poster_url(llm_details.get("title", title)) 

        final_details = llm_details
        final_details["posterUrl"] = poster_url 

        print(f"Combined details for '{title}': Poster found - {'Yes' if not poster_url.startswith('https://via.placeholder') else 'No'}")
        return jsonify(final_details)

    except Exception as e:
        print(f"Error in /fetch endpoint processing '{title}': {e}")
        return jsonify({"error": "Internal server error during detail fetching"}), 500

@app.route('/recommend', methods=['GET'])
def recommend_drama():
    genre = request.args.get('genre')
    if not genre:
        return jsonify({"error": "Genre parameter is required"}), 400
    try:
        recommendations = get_llm_recommendations(genre)
        return jsonify(recommendations)
    except Exception as e:
        print(f"Error in /recommend: {e}")
        return jsonify({"error": "Failed to generate recommendations"}), 500

@app.route('/top-dramas', methods=['GET'])
def get_top():
    try:
        top_dramas = scrape_top_dramas()
        return jsonify(top_dramas)
    except Exception as e:
        print(f"Error in /top-dramas: {e}")
        return jsonify({"error": "Failed to fetch top dramas"}), 500

@app.route('/new-releases', methods=['GET'])
def get_new():
    try:
        new_releases = scrape_new_releases()
        return jsonify(new_releases)
    except Exception as e:
        print(f"Error in /new-releases: {e}")
        return jsonify({"error": "Failed to fetch new releases"}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PYTHON_PORT', 8000))
    app.run(debug=True, port=port)