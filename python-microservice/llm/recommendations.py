import os
import google.generativeai as genai
import json
from dotenv import load_dotenv
from scrapers.drama_scraper import find_poster
import traceback 

load_dotenv()
GEMINI_API_CONFIGURED = False
PLACEHOLDER_POSTER = "https://via.placeholder.com/500x750.png?text=Poster+Not+Found"

try:
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
        GEMINI_API_CONFIGURED = True
        print("Gemini API Key configured.")
    else:
        print("Warning: GEMINI_API_KEY not found in environment variables.")
except Exception as e:
    print(f"Error configuring Gemini API: {e}")



def get_llm_recommendations_for_genre(genre, exclude_titles=None):
    if not GEMINI_API_CONFIGURED:
         print("Gemini API not configured. Cannot fetch recommendations.")
         return {"recommendations": []}

    if exclude_titles is None:
        exclude_titles = []

    exclusion_prompt_part = ""
    if exclude_titles:
        formatted_titles = ", ".join([json.dumps(title) for title in exclude_titles])
        exclusion_prompt_part = f"\n\nCRITICAL: Do NOT include any of the following titles in your recommendations, even if they fit the genre: {formatted_titles}."
    prompt = f"""
    Please recommend exactly 5 K-dramas similar to popular dramas in the **{genre}** genre.
    Focus on dramas that are generally well-regarded or popular within that genre.
    For each recommendation, provide the title, the release year (as a number), a brief reason (1-2 sentences explaining the similarity or appeal),
    the main genres (as a list of strings), and the status ('completed', 'ongoing', or 'upcoming') if known (default to 'completed' if unsure, verify if possible).
    Leave posterUrl null for now.
    {exclusion_prompt_part}

    Format the response strictly as a JSON object with a single key "recommendations",
    which is a list of exactly 5 objects, each having "title" (string), "year" (number or null), "reason" (string), "genres" (list of strings or null), "status" (string: 'completed', 'ongoing', or 'upcoming'), and "posterUrl" (null).

    Example structure for a recommendation object:
    {{
      "title": "Example Drama Title",
      "year": 2023,
      "reason": "This drama features similar thrilling plot twists and a strong female lead.",
      "genres": ["Thriller", "Romance"],
      "status": "completed",
      "posterUrl": null
    }}

    Ensure the output is ONLY the JSON object, starting with {{ and ending with }},
    with no introductory text, explanations, or markdown formatting like ```json ```.
    Make sure to provide exactly 5 unique recommendations that are not in the exclusion list. Prioritize dramas that are already completed or currently ongoing over upcoming ones if possible.
    """

    model = genai.GenerativeModel('gemini-2.5-flash') 

    try:
        print(f"Sending recommendation prompt to Gemini for genre: {genre}. Excluding {len(exclude_titles)} titles.")
        response = model.generate_content(prompt)

        if not hasattr(response, 'text') or not response.text:
             print("LLM response was empty.")
             safety_feedback = getattr(response, 'prompt_feedback', None)
             if safety_feedback:
                 print(f"Safety Feedback: {safety_feedback}")
             finish_reason = getattr(response, 'candidates', [{}])[0].get('finish_reason', 'UNKNOWN')
             print(f"Finish Reason: {finish_reason}")
             if finish_reason != 'STOP':
                 raise ValueError(f"LLM response potentially blocked or stopped unexpectedly. Reason: {finish_reason}")
             else:
                raise ValueError("LLM response was empty.")


        cleaned_response = response.text.strip().lstrip('```json').rstrip('```').strip()

        print(f"Cleaned Rec Response:\n{cleaned_response}")

        recommendations_data = json.loads(cleaned_response)

        if not isinstance(recommendations_data, dict) or "recommendations" not in recommendations_data or not isinstance(recommendations_data["recommendations"], list):
             raise ValueError("LLM response for recommendations is not in the expected format (missing 'recommendations' list).")

        exclude_titles_lower = {title.lower() for title in exclude_titles}
        filtered_recs = []
        titles_seen = set()
        for rec in recommendations_data.get("recommendations", []):
            title = rec.get("title")
            if title:
                 title_lower = title.lower()
                 if title_lower not in exclude_titles_lower and title_lower not in titles_seen:
                      if all(k in rec for k in ["title", "year", "reason", "status", "posterUrl", "genres"]):
                           filtered_recs.append(rec)
                           titles_seen.add(title_lower)
                      else:
                          print(f"Warning: Recommendation for '{title}' missing expected keys, skipping.")
            else:
                 print("Warning: Recommendation found with no title.")


        if len(filtered_recs) < len(recommendations_data.get("recommendations", [])):
             print(f"Filtered out {len(recommendations_data.get('recommendations', [])) - len(filtered_recs)} recommendations based on exclusion list or duplicates.")
        if len(filtered_recs) < 5 :
             print(f"Warning: LLM provided fewer than 5 unique, non-excluded recommendations ({len(filtered_recs)} found).")


        print(f"Successfully parsed {len(filtered_recs)} valid Gemini recommendations for '{genre}'")

        updated_recs = []
        for rec in filtered_recs:
            title = rec.get("title")
            status = str(rec.get("status", "completed")).lower()
            if status not in ['completed', 'ongoing', 'upcoming']:
                 status = 'completed'
            rec['status'] = status

            year = rec.get('year')
            if year is not None:
                try:
                    rec['year'] = int(year)
                except (ValueError, TypeError):
                    print(f"Warning: Invalid year '{year}' for title '{title}', setting to null.")
                    rec['year'] = None
            else:
                 rec['year'] = None

            genres_list = rec.get('genres')
            if genres_list is None:
                rec['genres'] = []
            elif not isinstance(genres_list, list):
                print(f"Warning: Invalid genres format '{genres_list}' for title '{title}', setting to empty list.")
                rec['genres'] = []
            else:
                rec['genres'] = [str(g) for g in genres_list if isinstance(g, (str, int, float))]


            if status == 'upcoming':
                 rec["posterUrl"] = "https://via.placeholder.com/500x750.png?text=Upcoming"
            elif title:
                rec["posterUrl"] = find_poster(title)
            else:
                 rec["posterUrl"] = PLACEHOLDER_POSTER
            updated_recs.append(rec)

        return {"recommendations": updated_recs}

    except json.JSONDecodeError as e:
        print(f"Error decoding JSON response from LLM for '{genre}' recommendations: {e}")
        print(f"Problematic response text: {cleaned_response}")
        return {"recommendations": []}
    except Exception as e:
        print(f"Error calling Gemini API or processing recommendations for '{genre}': {e}")
        traceback.print_exc()
        return {"recommendations": []}