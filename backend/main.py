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

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []

class RepoRequest(BaseModel):
    github_url: str

def extract_github_details(url):
    """
    Extracts owner, repo, AND branch from URL.
    """
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
            target_url = "https://github.com/torvalds/linux" 

        owner, repo, branch = extract_github_details(target_url)
        
        if owner and repo:
            print(f"   💻 Target: {owner}/{repo} (Branch: {branch or 'Auto'})")
            code_context = ingest_github.fetch_repo_content(owner, repo, branch)
        else:
            code_context = "Error: Invalid URL."

        analysis_json = brain.analyze_resume_vs_code(resume_text, code_context)
        star_bullets = brain.generate_star_bullets(code_context)

        DB['current_user'] = {
            "resume": resume_text,
            "code": code_context[:50000],
            "analysis": analysis_json
        }

        return {
            "status": "success",
            "data": analysis_json,
            "initial_chat": f"I've analyzed your code. Here are 3 STAR bullet points you should add immediately:\n\n{star_bullets}"
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
        
        print(f"   💻 Fetching: {owner}/{repo} (Branch: {branch or 'Default'})")
        
        # Pass the extracted branch to the scraper
        code_context = ingest_github.fetch_repo_content(owner, repo, branch)

        if not code_context or len(code_context) < 100:
            return {"status": "error", "bullets": "⚠️ ACCESS DENIED: Repo is empty, Private, or Branch not found."}

        bullets = brain.generate_star_bullets(code_context)

        if 'current_user' in DB:
            DB['current_user']['code'] += f"\n\n--- NEW REPO: {repo} ---\n{code_context[:20000]}"

        return {"status": "success", "bullets": bullets}

    except Exception as e:
        return {"status": "error", "message": str(e)}

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