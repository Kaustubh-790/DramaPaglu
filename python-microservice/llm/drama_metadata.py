import os
import google.generativeai as genai
import json
from dotenv import load_dotenv
import datetime

load_dotenv()

GEMINI_API_CONFIGURED = False 
try:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    genai.configure(api_key=api_key)
    print("Gemini API configured successfully.")
    GEMINI_API_CONFIGURED = True 
except Exception as e:
    print(f"Error configuring Gemini API: {e}")

JSON_STRUCTURE_TEMPLATE = """
{
  "title": "string (The official English title)",
  "altTitles": ["string (Native language title)", "string (Romanized title)"],
  "year": "number (Year of first broadcast)",
  "country": "string (Country of origin, e.g., 'South Korea')",
  "genres": ["string (List of genres)"],
  "posterUrl": "string (Leave empty, will be filled separately)",
  "description": "string (A concise synopsis, 2-3 sentences)",
  "cast": ["string (List of main actors, max 5-7)"],
  "rating": "string (Overall rating if available, e.g., '8.5/10 (Source)', otherwise null)",
  "sourceUrl": "string (A relevant MyDramaList or TMDB link if easily found, otherwise null)",
  "type": "string ('drama' or 'movie')",
  "status": "string ('completed', 'ongoing', or 'upcoming')"
}
"""

def get_llm_drama_details(title):
    if not GEMINI_API_CONFIGURED:
         print("Gemini API not configured. Cannot fetch details.")
         fallback_details = json.loads(JSON_STRUCTURE_TEMPLATE.replace('"string (Leave empty, will be filled separately)"', 'null'))
         fallback_details['title'] = title
         fallback_details['description'] = "LLM service not configured."
         return fallback_details

    model = genai.GenerativeModel('gemini-2.5-flash') 

    current_year = datetime.datetime.now().year

    prompt = f"""
    You are a precise K-drama information extractor.

    Task:
    Return verified metadata for the Korean drama or movie titled "{title}".
    If multiple exist, choose the most recent (prioritize releases from {current_year}; if unavailable, include the most notable version from the past 5 years).

    Rules:
    - Use verified and recent information (cross-check MyDramaList, TMDB, or official Korean sources).
    - Output only a single, valid JSON object—no extra text, no markdown, no explanations.
    - The JSON must strictly follow the provided structure.
    - Leave `"posterUrl"` as an empty string "".
    - Do not include speculative, upcoming, or rumored information unless officially confirmed.
    - Ensure `year` is the year of first broadcast or film release.

    Structure:
    {JSON_STRUCTURE_TEMPLATE}

    Return ONLY the JSON object below, nothing else.
    """

    try:
        print(f"Sending prompt to Gemini for title: {title}")
        print(f"Prompt:\n{prompt}\n")
        response = model.generate_content(prompt)

        cleaned_response = response.text.strip().lstrip('```json').rstrip('```').strip()

        print(f"Gemini Raw Response:\n{response.text}") 
        print(f"Cleaned Response:\n{cleaned_response}") 

        details = json.loads(cleaned_response)

        if not isinstance(details, dict) or "title" not in details:
             raise ValueError("LLM response is not a valid JSON object with a title.")

        print(f"Successfully parsed Gemini response for '{title}'")
        return details

    except json.JSONDecodeError as e:
        print(f"Error decoding JSON response from LLM for '{title}': {e}")
        print(f"Problematic response text: {cleaned_response}")
        fallback_details = json.loads(JSON_STRUCTURE_TEMPLATE.replace('"string (Leave empty, will be filled separately)"', 'null'))
        fallback_details['title'] = title 
        fallback_details['description'] = "Error fetching details from LLM."
        return fallback_details
    except Exception as e:
        print(f"Error calling Gemini API for '{title}': {e}")
        fallback_details = json.loads(JSON_STRUCTURE_TEMPLATE.replace('"string (Leave empty, will be filled separately)"', 'null'))
        fallback_details['title'] = title
        fallback_details['description'] = "Error connecting to LLM service."
        return fallback_details