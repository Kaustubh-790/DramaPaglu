import os
import google.generativeai as genai
import json
from dotenv import load_dotenv
from scrapers.drama_scraper import find_poster
import traceback # For detailed error logging

load_dotenv()
GEMINI_API_CONFIGURED = bool(os.getenv("GEMINI_API_KEY"))
PLACEHOLDER_POSTER = "https://via.placeholder.com/500x750.png?text=Poster+Not+Found"


# Modify function to accept exclude_titles
def get_llm_recommendations_for_genre(genre, exclude_titles=None):
    """
    Uses Gemini to get drama recommendations, optionally excluding titles,
    and then fetches poster URLs.
    """
    if not GEMINI_API_CONFIGURED:
         print("Gemini API not configured. Cannot fetch recommendations.")
         return {"recommendations": []}

    if exclude_titles is None:
        exclude_titles = []

    # --- Construct the exclusion part of the prompt ---
    exclusion_prompt_part = ""
    if exclude_titles:
        # Format titles for clarity in the prompt
        # Ensure quotes within titles are handled if necessary, though unlikely for standard titles
        formatted_titles = ", ".join([json.dumps(title) for title in exclude_titles]) # Use json.dumps for safety
        exclusion_prompt_part = f"\n\nCRITICAL: Do NOT include any of the following titles in your recommendations, even if they fit the genre: {formatted_titles}."
    # --- End exclusion part ---

    # Updated Prompt
    prompt = f"""
    Please recommend exactly 5 K-dramas similar to popular dramas in the **{genre}** genre.
    Focus on dramas that are generally well-regarded or popular within that genre.
    For each recommendation, provide the title, the release year (as a number), a brief reason (1-2 sentences explaining the similarity or appeal),
    and the status ('completed', 'ongoing', or 'upcoming') if known (default to 'completed' if unsure, verify if possible).
    Leave posterUrl null for now.
    {exclusion_prompt_part}

    Format the response strictly as a JSON object with a single key "recommendations",
    which is a list of exactly 5 objects, each having "title" (string), "year" (number or null), "reason" (string), "status" (string: 'completed', 'ongoing', or 'upcoming'), and "posterUrl" (null).

    Example structure for a recommendation object:
    {{
      "title": "Example Drama Title",
      "year": 2023,
      "reason": "This drama features similar thrilling plot twists and a strong female lead.",
      "status": "completed",
      "posterUrl": null
    }}

    Ensure the output is ONLY the JSON object, starting with {{ and ending with }},
    with no introductory text, explanations, or markdown formatting like ```json ```.
    Make sure to provide exactly 5 unique recommendations that are not in the exclusion list. Prioritize dramas that are already completed or currently ongoing over upcoming ones if possible.
    """

    model = genai.GenerativeModel('gemini-2.5-flash') # Or your preferred model

    try:
        print(f"Sending recommendation prompt to Gemini for genre: {genre}. Excluding {len(exclude_titles)} titles.")
        # print(f"Prompt: {prompt}") # Optionally print the full prompt for debugging
        response = model.generate_content(prompt)

        # Basic check if response has content
        if not hasattr(response, 'text') or not response.text:
             print("LLM response was empty.")
             # Check for safety feedback if available in the response object structure
             safety_feedback = getattr(response, 'prompt_feedback', None)
             if safety_feedback:
                 print(f"Safety Feedback: {safety_feedback}")
             raise ValueError("LLM response was empty or potentially blocked.")

        cleaned_response = response.text.strip().lstrip('```json').rstrip('```').strip()

        # print(f"Gemini Raw Rec Response:\n{response.text}")
        print(f"Cleaned Rec Response:\n{cleaned_response}")

        recommendations_data = json.loads(cleaned_response)

        if not isinstance(recommendations_data, dict) or "recommendations" not in recommendations_data or not isinstance(recommendations_data["recommendations"], list):
             raise ValueError("LLM response for recommendations is not in the expected format (missing 'recommendations' list).")

        # Normalize and filter recommendations based on exclude_titles (case-insensitive)
        exclude_titles_lower = {title.lower() for title in exclude_titles}
        filtered_recs = []
        titles_seen = set() # To ensure uniqueness from LLM output
        for rec in recommendations_data.get("recommendations", []):
            title = rec.get("title")
            if title:
                 title_lower = title.lower()
                 if title_lower not in exclude_titles_lower and title_lower not in titles_seen:
                      filtered_recs.append(rec)
                      titles_seen.add(title_lower)
            else:
                 print("Warning: Recommendation found with no title.")


        # If filtering removed too many, log it. The frontend expects a list, even if short.
        if len(filtered_recs) < 5 : # Check if less than requested
             print(f"Warning: LLM provided fewer than 5 unique, non-excluded recommendations ({len(filtered_recs)} found).")


        print(f"Successfully parsed {len(filtered_recs)} valid Gemini recommendations for '{genre}'")

        updated_recs = []
        for rec in filtered_recs: # Use the filtered list
            title = rec.get("title")
            # Default status to 'completed' if missing or invalid
            status = str(rec.get("status", "completed")).lower()
            if status not in ['completed', 'ongoing', 'upcoming']:
                 status = 'completed'
            rec['status'] = status # Ensure status is valid in the object

            # Ensure year is a number or null
            year = rec.get('year')
            if year is not None:
                try:
                    rec['year'] = int(year)
                except (ValueError, TypeError):
                    print(f"Warning: Invalid year '{year}' for title '{title}', setting to null.")
                    rec['year'] = None
            else:
                 rec['year'] = None # Ensure it's explicitly null if missing


            # Fetch poster URL
            if status == 'upcoming':
                 rec["posterUrl"] = "https://via.placeholder.com/500x750.png?text=Upcoming"
                 # print(f"Skipping poster search for upcoming drama: {title}")
            elif title:
                # print(f"Fetching poster for recommendation: {title}")
                rec["posterUrl"] = find_poster(title) # find_poster handles fallback internally
            else:
                 rec["posterUrl"] = PLACEHOLDER_POSTER # Use constant
            updated_recs.append(rec)

        return {"recommendations": updated_recs} # Return the updated list within the expected structure

    except json.JSONDecodeError as e:
        print(f"Error decoding JSON response from LLM for '{genre}' recommendations: {e}")
        print(f"Problematic response text: {cleaned_response}")
        return {"recommendations": []}
    except Exception as e:
        print(f"Error calling Gemini API or processing recommendations for '{genre}': {e}")
        traceback.print_exc() # Print full traceback for debugging
        return {"recommendations": []}