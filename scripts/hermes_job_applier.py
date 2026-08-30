# -*- coding: utf-8 -*-
import os
import sys
import json
import subprocess
import datetime
from pathlib import Path

# Cross-Platform Auto-Detection (Windows vs WSL Ubuntu)
if sys.platform == 'win32':
    WORKSPACE_DIR = Path(r'c:\Users\HP\OneDrive\Pictures\Documents\Skills\Anti Gravity')
    HERMES_EXE = r'C:\Users\HP\AppData/Local\hermes\hermes-agent\venv\Scripts\hermes.exe'
else:
    WORKSPACE_DIR = Path('/mnt/c/Users/HP/OneDrive/Pictures/Documents/Skills/Anti Gravity')
    HERMES_EXE = '/mnt/c/Users/HP/AppData/Local/hermes/hermes-agent/venv/Scripts/hermes.exe'

LOG_FILE = WORKSPACE_DIR / 'job_applications_log.json'
SUMMARY_FILE = WORKSPACE_DIR / 'DAILY_JOB_SUMMARY.md'

RESUME_DATA = '''
PIYUSH SINGH
BCA Student | Aspiring AI/ML Engineer | AI and Software Development
Sikandrabad, Bulandshahr, Uttar Pradesh, India | th.piyushsingh2007@gmail.com | +91 95577 40764
LinkedIn: https://linkedin.com/in/piyush-singh2007 | GitHub: https://github.com/Piyush-Thakur7

EDUCATION:
Bachelor of Computer Applications (BCA) - AI/ML Specialization (Third Semester)
GL Bajaj Institute of Technology and Management, Greater Noida (Affiliated to CCSU)
Class XII (PCB): 78.8% | Class X: 80.2%

TECHNICAL SKILLS:
- Web Development: Next.js, React, Tailwind CSS, HTML, CSS, JavaScript
- Programming: Python, C
- Database: MongoDB Atlas, SQL
- Tools and Cloud: Git, GitHub, Vercel, Render, Google Cloud Run
- AI / GenAI: Prompt Engineering, RAG Architecture, AI-Assisted Development, Autonomous Agent Workflows (Hermes)

LIVE PROJECTS:
1. Fitness Platform (https://fitness.resence.in)
   - Deployed full-stack fitness web application featuring workout tracking, caloric analytics, and AI-assisted workflows.
2. AnytimeConverter (https://anytimeconverter.resence.in)
   - Deployed 100% offline client-side document and file conversion utility (PDF manipulation, OCR extraction).
3. ServeMATE (https://resence.in)
   - Gamified NGO-donor transparency MVP presented at MSME Idea Hackathon 6.0 (GLBCRI). Features JWT auth, MongoDB Atlas, and Razorpay API integration.

PROGRAMS AND INITIATIVES:
- Google Student Ambassador 2026 (Google Developer Communities)
- Gen AI Academy - APAC Edition, Cohort 3 (Google Cloud x Hack2Skill)
- AI-Assisted Development Exposure (Hermes agent workflows and automated build processes)

CERTIFICATIONS:
- Google AI Essentials Specialization (Coursera / Google)
- Google Prompting Essentials Specialization (Coursera / Google)
- Foundation Course on AI Readiness (IICT and Ministry of I&B, Govt. of India)
'''

def load_history():
    if LOG_FILE.exists():
        try:
            with open(LOG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_history(history):
    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=2)

def run_hermes_hunt():
    today_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f'[{today_str}] 🚀 Launching Hermes with Live Real-Time Output...')
    
    prompt = f'''
You are the autonomous Job Application and Talent Agent for Piyush Singh.

Candidate:
- Name: Piyush Singh (BCA AI/ML, Google Student Ambassador 2026)
- Email: th.piyushsingh2007@gmail.com
- Live Project 1: https://fitness.resence.in (Full-Stack SaaS)
- Live Project 2: https://anytimeconverter.resence.in (Offline WASM Utility)
- Target: Part-Time Remote (up to 3-4 hrs/day or 15-20 hrs/week) Web Development / Frontend / AI Internships. Paid only.

TASK:
Search and list 5-10 active part-time remote web/frontend/AI internship opportunities.
For each opportunity, output:
- **Company & Role Title**
- **Direct Application URL**
- **Hours & Stipend**
- **Tailored 2-Sentence Pitch** linking https://fitness.resence.in and https://anytimeconverter.resence.in ready to send.
'''

    if not os.path.exists(HERMES_EXE):
        print(f'Error: Hermes executable not found at {HERMES_EXE}')
        return None

    cmd = [HERMES_EXE, '-z', prompt]
    
    collected_output = []
    try:
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding='utf-8',
            bufsize=1
        )
        for line in iter(process.stdout.readline, ''):
            sys.stdout.write(line)
            sys.stdout.flush()
            collected_output.append(line)
        process.stdout.close()
        process.wait()
        return ''.join(collected_output)
    except Exception as e:
        print(f'Error executing Hermes: {e}')
        return None

def generate_daily_summary(hermes_output):
    now = datetime.datetime.now()
    today_formatted = now.strftime('%A, %B %d, %Y - %I:%M %p')
    
    summary_content = f'''# Daily Automated Internship and Job Report
**Candidate**: Piyush Singh (BCA AI/ML | Google Student Ambassador 2026)  
**Date**: {today_formatted}  
**Status**: Completed and Logged  

---

## Target Filters Enforced:
- **Daily Time Limit**: Up to 3-4 Hours / Day (Part-Time / Off-Cycle)
- **Work Arrangement**: 100% Remote (India and Global)
- **Compensation**: Paid / Stipend
- **Resume Proof-of-Work Injected**:
  - [fitness.resence.in](https://fitness.resence.in)
  - [anytimeconverter.resence.in](https://anytimeconverter.resence.in)
  - [resence.in](https://resence.in)

---

## Discovered Opportunities & Tailored Applications

{hermes_output if hermes_output else 'No results gathered. Check query or network.'}

---

## Instructions to Apply
1. Open the direct application URLs above.
2. Auto-fill with **Simplify Copilot** or 1-Click Apply.
3. Copy-paste the provided tailored pitch into the application note.
'''
    with open(SUMMARY_FILE, 'w', encoding='utf-8') as f:
        f.write(summary_content)
    print(f'\n✅ Daily summary successfully written to: {SUMMARY_FILE}')

def main():
    output = run_hermes_hunt()
    if output:
        generate_daily_summary(output)
        history = load_history()
        history.append({
            'timestamp': datetime.datetime.now().isoformat(),
            'status': 'success',
            'summary_path': str(SUMMARY_FILE)
        })
        save_history(history)
        print('🎉 Daily Job Hunting cycle complete!')
    else:
        print('⚠️ Failed to obtain output from Hermes.')

if __name__ == '__main__':
    main()
