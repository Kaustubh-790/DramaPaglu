import os
from flask import Flask, request, jsonify
import json 
from dotenv import load_dotenv
from llm.drama_metadata import get_llm_drama_details
from llm.url_metadata import get_structured_data_for_title_from_asianwiki # NEW IMPORT
from scrapers.drama_scraper import find_poster as find_poster_url
# Pass exclude_titles to the function
from llm.recommendations import get_llm_recommendations_for_genre
from llm.top_dramas import get_top_dramas_llm

load_dotenv()

app = Flask(__name__)

@app.route('/fetch', methods=['GET'])
def fetch_drama():
    title = request.args.get('title')
    if not title:
        return jsonify({"error": "Title parameter is required"}), 400
    try:
        llm_details = get_llm_drama_details(title)
        if not llm_details or llm_details.get("description", "").startswith("Error"):
             print(f"LLM failed to provide details for '{title}'.")
             # Fallback: Still try to find poster with original title
             poster_url = find_poster_url(title)
             fallback_details = {
                 "title": title, # Use original title
                 "posterUrl": poster_url,
                 "description": "Details unavailable.",
                 # Add other fields as null or default if needed by frontend
                 "year": None,
                 "genres": [],
                 "status": "unknown",
                 "altTitles": [],
                 "country": "Unknown",
                 "cast": [],
                 "rating": None,
                 "sourceUrl": None,
                 "type": "drama"
             }
             # Return the fallback with a 200 OK but indicate partial data
             return jsonify(fallback_details), 200
             # Or return 500 if you prefer errors for LLM failures:
             # return jsonify({"error": f"Could not retrieve details for '{title}' from LLM."}), 500

        # If LLM details are good, find poster using the (potentially corrected) LLM title
        poster_url = find_poster_url(llm_details.get("title", title))
        final_details = llm_details
        final_details["posterUrl"] = poster_url
        print(f"Combined details for '{title}': Poster found - {'Yes' if poster_url and not poster_url.startswith('[https://via.placeholder](https://via.placeholder)') else 'No'}")
        return jsonify(final_details)
    except Exception as e:
        print(f"Error in /fetch endpoint processing '{title}': {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal server error during detail fetching"}), 500

# NEW ENDPOINT: Fetch Structured Data from AsianWiki URL (derived from title)
@app.route('/fetch-from-url', methods=['GET'])
def fetch_drama_from_url():
    title = request.args.get('title')
    if not title:
        return jsonify({"error": "Title parameter is required"}), 400
    
    try:
        llm_details = get_structured_data_for_title_from_asianwiki(title)
        
        if llm_details.get("error"):
            # If LLM failed, return the error
            return jsonify(llm_details), 500
        
        # If LLM details are good, find poster using the extracted title
        extracted_title = llm_details.get("title", title)
        poster_url = find_poster_url(extracted_title)
        
        llm_details["posterUrl"] = poster_url
        
        print(f"URL Fetch successful for '{extracted_title}': Poster found - {'Yes' if poster_url and not poster_url.startswith('[https://via.placeholder](https://via.placeholder)') else 'No'}")
        return jsonify(llm_details)
        
    except Exception as e:
        print(f"Error in /fetch-from-url endpoint processing '{title}': {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal server error during structured detail fetching"}), 500


@app.route('/recommend', methods=['GET'])
def recommend_drama():
    genre = request.args.get('genre')
    exclude_titles_str = request.args.get('exclude_titles') # Get as string

    if not genre:
        return jsonify({"error": "Genre parameter is required"}), 400

    exclude_titles = []
    if exclude_titles_str:
        try:
            exclude_titles = json.loads(exclude_titles_str) # Parse JSON string
            if not isinstance(exclude_titles, list):
                 print("Warning: exclude_titles parameter was not a valid JSON list.")
                 exclude_titles = []
        except json.JSONDecodeError:
            print("Warning: Could not decode exclude_titles JSON.")
            exclude_titles = [] # Default to empty list on error

    try:
        # Pass the parsed list to the LLM function
        recommendations = get_llm_recommendations_for_genre(genre, exclude_titles)
        return jsonify(recommendations)
    except Exception as e:
        print(f"Error in /recommend endpoint for genre '{genre}': {e}")
        # Consider more specific error logging if needed
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to generate recommendations"}), 500

@app.route('/top-dramas', methods=['GET'])
def get_top():
    try:
        top_dramas = get_top_dramas_llm()
        return jsonify(top_dramas)
    except Exception as e:
        print(f"Error in /top-dramas endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch top dramas"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PYTHON_PORT', 8000))
    # Ensure host='0.0.0.0' if running in Docker or needs external access
    app.run(host='0.0.0.0', debug=True, port=port)