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
    
    TASK: Analyze the Candidate's Resume against their Code.
    RESUME: {resume_text[:2000]}
    CODE: {code_context[:50000]}

    OUTPUT JSON (Strictly these 3 keys):
    {{
        "project_critique": [
            "Criticize the project compared to real-world/FAANG standards.",
            "E.g. 'Code is monolithic, lacks microservices pattern.'",
            "E.g. 'No unit tests found, risky for production.'"
        ],
        "false_claims": [
            "Check Resume vs Repo for lies/exaggerations.",
            "E.g. 'Resume says Expert in AWS, but no AWS config found.'",
            "E.g. 'Claims CI/CD pipeline, but no .github/workflows.'"
        ],
        "resume_suggestions": [
            "What SPECIFIC things should be added to the resume based on this code?",
            "E.g. 'Add 'Multithreading' - found complex threading in main.c'",
            "E.g. 'Highlight 'Optimization' - found custom memory allocator.'"
        ]
    }}
    """
    try:
        response = json_model.generate_content(prompt)
        return response.text
    except Exception as e:
        return json.dumps({
            "project_critique": ["Error analyzing project."],
            "false_claims": ["Could not verify claims."],
            "resume_suggestions": ["System Error."]
        })

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

def get_chat_response(history, message, context):
    """
    Handles the chat interaction.
    """
    chat = chat_model.start_chat(history=history)
    
    system_prompt = f"""
    You are Morpheus from The Matrix.
    You are talking to a candidate who wants to escape the simulation (get a job).
    
    CONTEXT:
    {context}
    
    RULES:
    1. Speak in metaphors about the Matrix, code, and reality.
    2. Be direct and slightly cryptic but helpful.
    3. Use the context provided to answer their questions about their code or resume.
    """
    
    try:
        response = chat.send_message(f"{system_prompt}\n\nUSER: {message}")
        return response.text
    except Exception as e:
        return f"The Matrix is glitching... {str(e)}"

def generate_interview_challenge(code_context, analysis_json):
    """
    Generates a tough technical question based on the code's weak points.
    """
    prompt = f"""
    You are 'GitReal', a skeptcial Technical Interviewer.
    You have analyzed this candidate's code and found some issues.
    
    ANALYSIS SUMMARY:
    {analysis_json}
    
    RAW CODE SEGMENT:
    {code_context[:20000]}

    YOUR TASK:
    Generate ONE hard, specific technical interview question to test if the candidate actually wrote this code or understands it.
    - Pick a specific file or function from the code.
    - Ask why they chose that specific implementation over a better alternative.
    - Be direct and intimidating.
    
    OUTPUT:
    Just the question. No greetings.
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except:
        return "Explain the architecture of your main API handler. Why is it structured this way?"

def generate_ats_resume(resume_text, code_context):
    """
    Rewrites the ENTIRE resume to be ATS compliant, injecting code evidence.
    """
    prompt = f"""
    You are an ATS (Applicant Tracking System) Optimization Engine.
    
    INPUT DATA:
    1. OLD RESUME: {resume_text[:2000]}
    2. CODE EVIDENCE: {code_context[:50000]}

    YOUR MISSION:
    Rewrite the candidate's resume completely.
    1. **Structure:** Use standard ATS headers (SUMMARY, EXPERIENCE, PROJECTS, SKILLS, EDUCATION). No columns.
    2. **Evidence Injection:** Replace generic bullet points in the 'Projects' or 'Experience' section with specific technical details found in the CODE EVIDENCE (e.g., specific libraries, architecture patterns).
    3. **Keywords:** Ensure high-value tech keywords from the code (e.g., "Redis", "FastAPI", "AsyncIO") are included in the SKILLS section.
    4. **Tone:** Action-oriented, professional, quantified.

    OUTPUT FORMAT:
    Markdown text. Ready to copy-paste.
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating resume: {str(e)}"