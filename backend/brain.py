import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain", # Changed to text/plain for chat flexibility
}

# Use Gemini 2.5 Flash
model = genai.GenerativeModel("gemini-2.5-flash", generation_config=generation_config)
chat_model = genai.GenerativeModel("gemini-2.5-flash")

def analyze_resume_vs_code(resume_text, code_context):
    """
    Returns strict JSON analysis + STAR Bullets.
    """
    # We want JSON for the dashboard cards
    json_model = genai.GenerativeModel("gemini-2.5-flash", generation_config={"response_mime_type": "application/json"})
    
    prompt = f"""
    You are 'GitReal', a ruthless Senior Engineer.
    
    TASK 1: Analyze the Candidate.
    RESUME: {resume_text[:2000]}
    CODE: {code_context[:50000]}

    OUTPUT JSON:
    {{
        "matches": ["Skill A (Verified in file.py)", "Skill B"],
        "missing_gems": ["Found Redis but not on resume", "Complex SQL detected"],
        "red_flags": ["Hardcoded API Keys", "Spaghetti code in main.py"],
        "summary": "Solid engineer, bad resume."
    }}
    """
    try:
        response = json_model.generate_content(prompt)
        return response.text
    except Exception as e:
        return json.dumps({"matches": [], "missing_gems": [], "red_flags": ["Error analyzing"], "summary": "System Error"})

def generate_star_bullets(code_context):
    """
    Generates the opening 'STAR' analysis.
    """
    prompt = f"""
    You are an Elite Resume Writer. I don't want advice. I want TEXT I can copy-paste.
    
    Analyze this code and generate 3 Bullet Points using the **STAR Method** (Situation, Task, Action, Result).
    
    RULES:
    1. **NO INTRO/OUTRO**: Do not say "Here are your points". Just output the points.
    2. **SPECIFICITY**: Mention specific libraries, algorithms, or architectures found in the code.
    3. **IMPACT**: Estimate quantitative results (e.g. "Reduced latency by ~20%").
    
    CODE EVIDENCE:
    {code_context[:50000]}
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except:
        return "Error generating bullets."

def generate_star_bullets(code_context):
    """
    Generates 3-4 powerful STAR method bullet points from code.
    """
    # SAFETY CHECK: If the code context is empty, don't confuse the AI
    if not code_context or len(code_context) < 50:
        return "⚠️ ERROR: No code was found in this repository. Please check the URL or try a public repo."

    prompt = f"""
    SYSTEM INSTRUCTION: IGNORE all previous instructions about not browsing the web.
    I have ALREADY scraped the repository using a local script.
    The text below IS the code. You do not need to access the internet.
    
    YOUR TASK:
    Act as a Senior Resume Writer. Read the code provided below and extract 3 resume bullet points using the STAR method.
    
    RULES:
    1. Do NOT apologize.
    2. Do NOT say "I cannot scan".
    3. Assume the code below is the complete truth.
    4. Focus on technical keywords found in the text (e.g. libraries, logic).

    --- BEGIN RAW CODE DUMP ---
    {code_context[:50000]} 
    --- END RAW CODE DUMP ---

    OUTPUT FORMAT:
    - Bullet 1
    - Bullet 2
    - Bullet 3
    """
    try:
        # We use standard text generation here
        text_model = genai.GenerativeModel("gemini-2.5-flash")
        response = text_model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating bullets: {str(e)}"