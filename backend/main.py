import os
import shutil
import re
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

import ingest_github
import ingest_pdf
import brain

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB = {}
REPO_CACHE = {}

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []

class RepoRequest(BaseModel):
    github_url: str

def extract_github_details(url):
    """
    Extracts owner, repo, AND branch from URL.
    """
    if not url:
        return None, None, None
        
    # Clean up
    clean = url.replace("https://", "").replace("http://", "").replace("github.com/", "")
    parts = clean.split("/")
    
    if len(parts) < 2:
        return None, None, None
        
    owner = parts[0]
    repo = parts[1]
    branch = None
    
    # Check for /tree/BRANCH_NAME
    if "tree" in parts:
        try:
            tree_index = parts.index("tree")
            if len(parts) > tree_index + 1:
                branch = parts[tree_index + 1]
        except:
            pass
            
    return owner, repo, branch

@app.get("/")
def health_check():
    return {"status": "GitReal System Online", "mode": "Matrix"}

@app.post("/analyze")
async def analyze_portfolio(
    file: UploadFile = File(...),
    github_url: Optional[str] = Form(None)
):
    print(f"📥 Received Analysis Request.")
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        resume_text = ingest_pdf.parse_pdf(temp_filename)
        
        target_url = github_url
        if not target_url or target_url == "null":
            # Attempt to find in resume
            # Look for github.com/username/repo
            match = re.search(r"github\.com/([a-zA-Z0-9-_]+)/([a-zA-Z0-9-_]+)", resume_text)
            if match:
                target_url = f"https://{match.group(0)}"
                print(f"   🕵️‍♀️ Found GitHub URL in Resume: {target_url}")
            else:
                target_url = None

        code_context = ""
        if target_url:
            owner, repo, branch = extract_github_details(target_url)
            if owner and repo:
                cache_key = f"{owner}/{repo}/{branch}"
                if cache_key in REPO_CACHE:
                    print(f"   ⚡ Cache Hit: {cache_key}")
                    code_context = REPO_CACHE[cache_key]
                else:
                    print(f"   💻 Target: {owner}/{repo} (Branch: {branch or 'Auto'})")
                    code_context = ingest_github.fetch_repo_content(owner, repo, branch)
                    # Cache if valid
                    if code_context and len(code_context) > 100:
                        REPO_CACHE[cache_key] = code_context
            else:
                code_context = "Error: Invalid URL extracted."
        else:
            code_context = "No GitHub URL found in resume or provided."

        if os.path.exists(temp_filename):
            os.remove(temp_filename)

        analysis_json = brain.analyze_resume_vs_code(resume_text, code_context)
        
        # Parse JSON to construct chat message
        import json
        try:
            data = json.loads(analysis_json)
            critique = "\n".join([f"- {x}" for x in data.get("project_critique", [])])
            claims = "\n".join([f"- {x}" for x in data.get("false_claims", [])])
            suggestions = "\n".join([f"- {x}" for x in data.get("resume_suggestions", [])])
            
            chat_msg = f"""**REAL WORLD CRITIQUE:**
{critique}

**FALSE CLAIMS / VERIFICATION:**
{claims}

**RESUME ADDITIONS:**
{suggestions}"""
        except:
            chat_msg = "Analysis Complete. Check Dashboard for details."

        DB['current_user'] = {
            "resume": resume_text,
            "code": code_context[:50000],
            "analysis": analysis_json
        }

        return {
            "status": "success",
            "data": analysis_json,
            "initial_chat": chat_msg
        }

    except Exception as e:
        print(f"❌ Error: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@app.post("/add_repo")
async def add_repo_context(request: RepoRequest):
    print(f"📥 Adding Repo: {request.github_url}")
    try:
        owner, repo, branch = extract_github_details(request.github_url)
        
        if not owner or not repo:
             raise HTTPException(status_code=400, detail="Invalid GitHub URL")
        
        cache_key = f"{owner}/{repo}/{branch}"
        if cache_key in REPO_CACHE:
            print(f"   ⚡ Cache Hit: {cache_key}")
            code_context = REPO_CACHE[cache_key]
        else:
            print(f"   💻 Fetching: {owner}/{repo} (Branch: {branch or 'Default'})")
            # Pass the extracted branch to the scraper
            code_context = ingest_github.fetch_repo_content(owner, repo, branch)
            if code_context and len(code_context) >= 100:
                REPO_CACHE[cache_key] = code_context

        if not code_context or len(code_context) < 100:
            return {"status": "error", "bullets": "⚠️ ACCESS DENIED: Repo is empty, Private, or Branch not found."}

        bullets = brain.generate_star_bullets(code_context)

        if 'current_user' in DB:
            DB['current_user']['code'] += f"\n\n--- NEW REPO: {repo} ---\n{code_context[:20000]}"

        return {"status": "success", "bullets": bullets}

    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/interview_start")
async def start_interview():
    user_data = DB.get('current_user')
    if not user_data:
        return {"status": "error", "message": "No data found."}
    
    # Generate the "Opening Shot"
    question = brain.generate_interview_challenge(user_data['code'], user_data['analysis'])
    
    return {"status": "success", "question": question}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    user_data = DB.get('current_user')
    if not user_data:
        return {"response": "⚠️ SYSTEM ERROR: No data found."}

    context_summary = f"""
    --- RESUME ---
    {user_data['resume'][:1000]}...
    --- CODE EVIDENCE ---
    {user_data['code']}
    """

    gemini_history = [] 
    for msg in request.history:
        role = "user" if msg['type'] == 'user' else "model"
        gemini_history.append({"role": role, "parts": [msg['text']]})

    response_text = brain.get_chat_response(gemini_history, request.message, context_summary)
    
    return {"response": response_text}

@app.post("/generate_resume")
async def generate_resume_endpoint():
    user_data = DB.get('current_user')
    if not user_data:
        return {"response": "⚠️ ERROR: No data found."}

    # Call the new brain function
    new_resume = brain.generate_ats_resume(user_data['resume'], user_data['code'])
    
    return {"status": "success", "resume": new_resume}