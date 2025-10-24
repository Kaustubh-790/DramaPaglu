import os
import time
import re
from ddgs import DDGS
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_SEARCH_API_KEY")
GOOGLE_CSE_ID = os.getenv("GOOGLE_SEARCH_ENGINE_ID")
PLACEHOLDER_POSTER = "https://via.placeholder.com/500x750.png?text=Poster+Not+Found"

def find_poster_google(title):
    if not GOOGLE_API_KEY or not GOOGLE_CSE_ID:
        print("Google Search API Key or Engine ID not configured.")
        return None

    print(f"Searching Google Images for: {title}")
    try:
        service = build("customsearch", "v1", developerKey=GOOGLE_API_KEY)
       
        query = f"{title} K-Drama poster cover"
        res = service.cse().list(
            q=query,
            cx=GOOGLE_CSE_ID,
            searchType='image',
            num=5,
            imgSize='large',
            safe='high'
        ).execute()

        items = res.get('items', [])
        print(f"Google Image Results for '{query}': {len(items)} found") 

        if not items:
            return None

        preferred_sources = ['pinterest.com','mydramalist.com', 'themoviedb.org','asianwiki.com', 'imdb.com', 'tvdb.com']
        for item in items:
            link = item.get('link')
            if link and any(source in link for source in preferred_sources):
                print(f"Found preferred Google poster: {link}")
                return link

        first_result_link = items[0].get('link')
        print(f"Using first Google image result as fallback: {first_result_link}")
        return first_result_link

    except Exception as e:
        print(f"Error searching Google Images: {e}")
        if "Quota exceeded" in str(e):
             print("Google Search Quota likely exceeded.")
        return None


def find_poster_ddgs(title):
    """Uses DuckDuckGo Image Search as a fallback."""
    print(f"Searching DuckDuckGo Images for: {title}")
    time.sleep(0.5) 
    try:
        with DDGS() as ddgs:
            query = f"{title} K-Drama poster cover"
            results = list(ddgs.images(query, max_results=10))
            print(f"DDGS Image Results for '{query}': {len(results)} found")
            if results:
                 preferred_sources = ['pinterest.com','mydramalist.com', 'themoviedb.org', 'asianwiki.com', 'imdb.com', 'tvdb.com']
                 results.sort(key=lambda x: x.get('width', 0) * x.get('height', 0), reverse=True)
                 for res in results:
                     image_url = res.get('image', '')
                     if any(source in image_url for source in preferred_sources):
                          print(f"Found preferred DDGS poster: {image_url}")
                          return image_url
                 first_result_url = results[0].get('image')
                 print(f"Using first DDGS image result as fallback: {first_result_url}")
                 return first_result_url
            print("No DDGS image results found.")
    except Exception as e:
        if "403" in str(e) or "Ratelimit" in str(e):
             print(f"DuckDuckGo Image Search Rate Limited: {e}")
        else:
             print(f"Error searching DuckDuckGo Images: {e}")
    return None

def find_poster(title):
    poster_url = find_poster_google(title)

    if not poster_url:
        print("Google search failed or yielded no results, trying DDGS...")
        poster_url = find_poster_ddgs(title)

    if not poster_url:
        print("All image searches failed, returning placeholder.")
        return PLACEHOLDER_POSTER
    
    if not poster_url or not re.match(r'^https?://.*\.(jpg|jpeg|png|webp|gif)(\?.*)?$', poster_url, re.IGNORECASE):
         print(f"Found URL '{poster_url}' doesn't look like a valid image URL. Returning placeholder.")
         return PLACEHOLDER_POSTER


    return poster_url
