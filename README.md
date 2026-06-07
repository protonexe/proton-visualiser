# Proton Visualiser

A professional, AI-powered data visualization and analysis tool.

## Setup

### Backend
1. Navigate to the backend directory: `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate virtual environment:
   - Windows: `.\\venv\\Scripts\\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `python main.py`

### Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## How it works
- Upload a CSV, JSON, or XLSX file.
- The backend processes the data using Pandas and sends a summary to the Gemma 4 31B model.
- The AI suggests the most relevant insights and graphs.
- You can view the recommended graphs or create your own in the "Custom Analysis" section.
- Explore correlations and descriptive statistics in the built-in analytics dashboard.
