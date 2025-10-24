import os
import google.generativeai as genai
import json
from dotenv import load_dotenv
from scrapers.drama_scraper import find_poster 

load_dotenv()
GEMINI_API_CONFIGURED = bool(os.getenv("GEMINI_API_KEY"))

def get_top_dramas_llm():
    """
    Uses Gemini to get top dramas and then fetches poster URLs.
    """
    if not GEMINI_API_CONFIGURED:
         print("Gemini API not configured. Cannot fetch top dramas.")
         return {"dramas": []}

    prompt = f"""
    List the top 10 currently popular or highly-rated K-dramas.
    Provide the title, year, a brief description (1 sentence), and status ('completed', 'ongoing', 'upcoming').
    Leave posterUrl null for now.

    Format the response strictly as a JSON object with a single key "dramas",
    which is a list of objects, each having "title", "year", "description", "status", and "posterUrl".

    Example structure for a drama object:
    {{
      "title": "Example Top Drama",
      "year": 2024,
      "description": "A very popular drama about...",
      "status": "ongoing",
      "posterUrl": null
    }}

    Ensure the output is ONLY the JSON object, starting with {{ and ending with }},
    with no introductory text, explanations, or markdown formatting like ```json ```.
    """

    model = genai.GenerativeModel('gemini-1.5-flash')

    try:
        print("Sending top dramas prompt to Gemini...")
        response = model.generate_content(prompt)
        cleaned_response = response.text.strip().lstrip('```json').rstrip('```').strip()

        print(f"Gemini Raw Top Response:\n{response.text}")
        print(f"Cleaned Top Response:\n{cleaned_response}")

        top_dramas_data = json.loads(cleaned_response)

        if not isinstance(top_dramas_data, dict) or "dramas" not in top_dramas_data or not isinstance(top_dramas_data["dramas"], list):
             raise ValueError("LLM response for top dramas is not in the expected format.")

        print("Successfully parsed Gemini top dramas response.")

        updated_dramas = []
        for drama in top_dramas_data.get("dramas", []):
            title = drama.get("title")
            status = drama.get("status", "completed").lower() 

            if status == 'upcoming':
                 drama["posterUrl"] = "https://via.placeholder.com/500x750.png?text=Upcoming"
                 print(f"Skipping poster search for upcoming drama: {title}")
            elif title:
                print(f"Fetching poster for top drama: {title}")
                drama["posterUrl"] = find_poster(title)
            else:
                 drama["posterUrl"] = "https://via.placeholder.com/500x750.png?text=Missing+Title"
            updated_dramas.append(drama)

        top_dramas_data["dramas"] = updated_dramas

        return top_dramas_data

    except json.JSONDecodeError as e:
        print(f"Error decoding JSON response from LLM for top dramas: {e}")
        print(f"Problematic response text: {cleaned_response}")
        return {"dramas": []}
    except Exception as e:
        print(f"Error calling Gemini API or fetching posters for top dramas: {e}")
        return {"dramas": []}