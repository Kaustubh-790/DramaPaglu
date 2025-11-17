import os
import google.generativeai as genai
from google.generativeai import protos # Import protos for direct tool construction
import json
import urllib.parse
import traceback 
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- Gemini API Configuration ---
GEMINI_API_CONFIGURED = False
try:
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
        GEMINI_API_CONFIGURED = True
        print("Gemini API Key configured.")
except Exception as e:
    print(f"Error configuring Gemini API: {e}")

# --- JSON Structure Template ---
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
  "sourceUrl": "string (A relevant AsianWiki, MyDramaList, or TMDB link if easily found, otherwise null)",
  "type": "string ('drama' or 'movie')",
  "status": "string ('completed', 'ongoing', or 'upcoming')"
}
"""

def format_asianwiki_url(title: str) -> str:
    """
    Formats a drama title into an approximate AsianWiki URL slug.
    """
    base_url = "https://asianwiki.com/"
    # Replace spaces with underscores and URL-encode the title part
    encoded_title_part = urllib.parse.quote(title.replace(' ', '_'), safe='')
    return base_url + encoded_title_part

def get_structured_data_for_title_from_asianwiki(title: str):
    """
    Builds the AsianWiki URL for the title and instructs the Gemini API to 
    browse that URL and extract structured metadata using the GoogleSearch tool.
    """
    if not GEMINI_API_CONFIGURED:
        print("Gemini API not configured. Cannot fetch details.")
        return {"error": "LLM service not configured."}

    url = format_asianwiki_url(title)
    model = genai.GenerativeModel('gemini-2.5-flash') 

    prompt = f"""
    You are a precise web content extractor.

    Task:
    Access the content of the following specific URL: {url}
    Extract all relevant K-drama metadata from that page, including the plot, cast, and profile information.
    If the URL is non-specific or leads to an index, use the title "{title}" and the genre context to find the best match on the AsianWiki site.

    Rules:
    - **CRITICAL:** The output must ONLY be a single, valid JSON object—no extra text, no markdown block (e.g., no ```json), and no explanations.
    - The JSON must strictly adhere to the provided structure template.
    - Fill all fields by extracting or inferring data from the URL's content.
    - Leave the `"posterUrl"` field as an **empty string ""** (as specified in the template).
    - For the `"sourceUrl"` field, set the value to the provided URL: {url}

    Structure Template:
    {JSON_STRUCTURE_TEMPLATE}

    Return ONLY the JSON object.
    """
    cleaned_response = ""
    try:
        print(f"Sending prompt to Gemini to browse URL: {url} and extract structured data.")
        
        # FIX: Use protos.Tool to explicitly define the GoogleSearch tool.
        # This avoids the SDK trying to parse it as a user function declaration.
        search_tool = protos.Tool(google_search=protos.GoogleSearch())
        
        response = model.generate_content(
            contents=prompt,
            tools=[search_tool]
        )
        
        cleaned_response = response.text.strip().lstrip('```json').rstrip('```').strip()

        details = json.loads(cleaned_response)

        if not isinstance(details, dict) or "title" not in details:
             raise ValueError("LLM response is not a valid JSON object with a title.")

        print(f"Successfully parsed Gemini response for URL: {details.get('title')}")
        return details

    except json.JSONDecodeError as e:
        print(f"Error decoding JSON response from LLM: {e}")
        print(f"Problematic response text: {cleaned_response}")
        return {"error": f"Error decoding LLM response: {e}"}
    except Exception as e:
        print(f"Error calling Gemini API for URL: {e}")
        traceback.print_exc()
        return {"error": f"Error calling Gemini API: {e}"}