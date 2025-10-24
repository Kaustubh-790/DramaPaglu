import os
import google.generativeai as genai
import json
from dotenv import load_dotenv
from scrapers.drama_scraper import find_poster 

load_dotenv()
GEMINI_API_CONFIGURED = bool(os.getenv("GEMINI_API_KEY"))

def get_llm_recommendations_for_genre(genre):
    """
    Uses Gemini to get drama recommendations and then fetches poster URLs.
    """
    if not GEMINI_API_CONFIGURED:
         print("Gemini API not configured. Cannot fetch recommendations.")
         return {"recommendations": []}

    # Prompt to get recommendations (ensure it includes 'status' if possible, or assume not 'upcoming')
    # If the LLM *can* reliably provide the status, add it to the JSON structure request.
    # For now, we'll assume recommendations are generally for existing/completed shows.
    prompt = f"""
    Please recommend 5 K-dramas similar to popular dramas in the {genre} genre.
    For each recommendation, provide the title, a brief reason (1-2 sentences),
    and a source URL (e.g., MyDramaList, TMDB, if readily available, otherwise null).
    Also include the status ('completed', 'ongoing', or 'upcoming') if known.

    Format the response strictly as a JSON object with a single key "recommendations",
    which is a list of objects, each having "title", "reason", "sourceUrl", and "status".
    Leave posterUrl null for now.

    Example structure for a recommendation object:
    {{
      "title": "Example Drama Title",
      "reason": "This drama features similar themes and actors...",
      "sourceUrl": "https://mydramalist.com/example-drama",
      "status": "completed",
      "posterUrl": null
    }}

    Ensure the output is ONLY the JSON object, starting with {{ and ending with }},
    with no introductory text, explanations, or markdown formatting like ```json ```.
    """

    model = genai.GenerativeModel('gemini-2.5-flash')

    try:
        print(f"Sending recommendation prompt to Gemini for genre: {genre}")
        response = model.generate_content(prompt)
        cleaned_response = response.text.strip().lstrip('```json').rstrip('```').strip()

        print(f"Gemini Raw Rec Response:\n{response.text}")
        print(f"Cleaned Rec Response:\n{cleaned_response}")

        recommendations_data = json.loads(cleaned_response)

        if not isinstance(recommendations_data, dict) or "recommendations" not in recommendations_data or not isinstance(recommendations_data["recommendations"], list):
             raise ValueError("LLM response for recommendations is not in the expected format.")

        print(f"Successfully parsed Gemini recommendations for '{genre}'")

        updated_recs = []
        for rec in recommendations_data.get("recommendations", []):
            title = rec.get("title")
            status = rec.get("status", "completed").lower() 

            if status == 'upcoming':
                 rec["posterUrl"] = "https://via.placeholder.com/500x750.png?text=Upcoming"
                 print(f"Skipping poster search for upcoming drama: {title}")
            elif title:
                print(f"Fetching poster for recommendation: {title}")
                rec["posterUrl"] = find_poster(title)
            else:
                 rec["posterUrl"] = "https://via.placeholder.com/500x750.png?text=Missing+Title" 
            updated_recs.append(rec)

        recommendations_data["recommendations"] = updated_recs

        return recommendations_data

    except json.JSONDecodeError as e:
        print(f"Error decoding JSON response from LLM for '{genre}' recommendations: {e}")
        print(f"Problematic response text: {cleaned_response}")
        return {"recommendations": []}
    except Exception as e:
        print(f"Error calling Gemini API or fetching posters for '{genre}' recommendations: {e}")
        return {"recommendations": []}