import pandas as pd
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
import io
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("backend.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("visualiser-backend")

app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

AI_API_KEY = os.getenv("AI_API_KEY")
AI_MODEL = "Gemma 4 31B"
AI_ENDPOINT = os.getenv("AI_ENDPOINT", "https://api.example.com/v1/chat/completions")

def clean_for_json(val):
    """
    Recursively clean python objects to ensure they are 100% JSON compliant.
    Replaces NaN, Inf, -Inf, and NaT with None or standard values.
    """
    if isinstance(val, dict):
        return {k: clean_for_json(v) for k, v in val.items()}
    elif isinstance(val, list):
        return [clean_for_json(v) for v in val]
    elif isinstance(val, float):
        if np.isnan(val) or np.isinf(val):
            return None
        return val
    elif pd.isna(val):
        return None
    return val

def get_ai_insights(data_summary, data_head):
    try:
        # Attempt to get insights from AI API
        prompt = (
            f"You are an expert data scientist. Analyze this dataset summary and the first 10 rows of data:\n"
            f"Summary: {data_summary}\n"
            f"Data Head: {data_head}\n\n"
            f"Provide your analysis in a strict JSON format with the following structure:\n"
            f"{{\n"
            f"  'insights': [\n"
            f"    'A key observation about a trend or outlier',\n"
            f"    'A correlation between two variables',\n"
            f"    'A summary of the data distribution',\n"
            f"    'A surprising or important finding'\n"
            f"  ],\n"
            f"  'suggested_graphs': [\n"
            f"    {{\n"
            f"      'type': 'bar' | 'line' | 'scatter' | 'pie' | 'area' | 'radar' | 'treemap' | 'heatmap',\n"
            f"      'x': 'column_name_for_x_axis',\n"
            f"      'y': 'column_name_for_y_axis_optional',\n"
            f"      'reason': 'Explain why this graph is useful for these specific columns'\n"
            f"    }}\n"
            f"  ]\n"
            f"}}\n"
            f"Ensure 'x' and 'y' exactly match the column names provided in the summary."
        )
        
        if not AI_API_KEY:
            raise ValueError("AI_API_KEY environment variable is not set")

        headers = {
            "Authorization": f"Bearer {AI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": AI_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"}
        }
        
        response = requests.post(AI_ENDPOINT, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        
        ai_data = response.json()
        content = ai_data['choices'][0]['message']['content']
        
        # Validate that content is actually JSON
        json.loads(content)
        return content
        
    except Exception as e:
        logger.error(f"AI API Error: {str(e)}. Using fallback logic.")
        try:
            summary = json.loads(data_summary)
            cols = summary.get("columns", [])
            numeric_cols = summary.get("numeric_columns", [])
            categorical_cols = summary.get("categorical_columns", [])
            
            insights = [
                f"The dataset contains {summary.get('shape', [0])[0]} rows and {summary.get('shape', [0])[1]} columns.",
                f"Identified {len(numeric_cols)} numeric columns and {len(categorical_cols)} categorical columns."
            ]
            
            # Dynamic Insight generation based on stats
            stats = summary.get("stats", {})
            for num_col in numeric_cols[:2]:
                col_stat = stats.get(num_col, {})
                if col_stat and "mean" in col_stat and col_stat["mean"] is not None:
                    insights.append(f"The average for `{num_col}` is {col_stat['mean']:.2f}, ranging from {col_stat['min']} to {col_stat['max']}.")
            
            suggested_graphs = []
            
            # Smart graph selection
            if len(categorical_cols) >= 1 and len(numeric_cols) >= 1:
                suggested_graphs.append({
                    "type": "bar", 
                    "x": categorical_cols[0], 
                    "y": numeric_cols[0], 
                    "reason": f"Distribution of {numeric_cols[0]} by {categorical_cols[0]}."
                })
                suggested_graphs.append({
                    "type": "pie", 
                    "x": categorical_cols[0], 
                    "y": numeric_cols[0], 
                    "reason": f"Proportional break down of {numeric_cols[0]} across {categorical_cols[0]} categories."
                })
            
            if len(numeric_cols) >= 2:
                suggested_graphs.append({
                    "type": "scatter", 
                    "x": numeric_cols[0], 
                    "y": numeric_cols[1], 
                    "reason": f"Correlation mapping between {numeric_cols[0]} and {numeric_cols[1]}."
                })
                suggested_graphs.append({
                    "type": "line", 
                    "x": numeric_cols[0], 
                    "y": numeric_cols[1], 
                    "reason": f"Trend progression showing {numeric_cols[1]} relative to {numeric_cols[0]}."
                })
                suggested_graphs.append({
                    "type": "area", 
                    "x": numeric_cols[0], 
                    "y": numeric_cols[1], 
                    "reason": f"Area distribution of {numeric_cols[1]} across {numeric_cols[0]} progression."
                })

            if len(categorical_cols) >= 1 and len(numeric_cols) >= 1:
                suggested_graphs.append({
                    "type": "radar", 
                    "x": categorical_cols[0], 
                    "y": numeric_cols[0], 
                    "reason": f"Radar profile comparing {numeric_cols[0]} across {categorical_cols[0]} facets."
                })

            return json.dumps({"insights": insights, "suggested_graphs": suggested_graphs})
        except Exception as fallback_e:
            logger.error(f"Fallback Error: {str(fallback_e)}")
            return json.dumps({"insights": ["AI insights unavailable"], "suggested_graphs": []})

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        filename = file.filename
        
        if not filename:
            logger.error("Filename is missing")
            return {"error": "Filename is missing"}

        filename_lower = filename.lower()
        if filename_lower.endswith('.csv'):
            try:
                df = pd.read_csv(io.BytesIO(contents))
            except UnicodeDecodeError as e:
                logger.warning(f"UnicodeDecodeError: {e}. Trying latin1 encoding...")
                df = pd.read_csv(io.BytesIO(contents), encoding='latin1')
        elif filename_lower.endswith('.json'):
            df = pd.read_json(io.BytesIO(contents))
        elif filename_lower.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            logger.error(f"Unsupported file format: {filename}")
            return {"error": "Unsupported file format"}

        # Extract stats & categories
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
        
        stats_summary = {}
        for col in numeric_cols:
            mean_val = df[col].mean()
            median_val = df[col].median()
            min_val = df[col].min()
            max_val = df[col].max()
            std_val = df[col].std()
            
            stats_summary[col] = {
                "mean": float(mean_val) if not pd.isna(mean_val) and not np.isinf(mean_val) else None,
                "median": float(median_val) if not pd.isna(median_val) and not np.isinf(median_val) else None,
                "min": float(min_val) if not pd.isna(min_val) and not np.isinf(min_val) else None,
                "max": float(max_val) if not pd.isna(max_val) and not np.isinf(max_val) else None,
                "std": float(std_val) if not pd.isna(std_val) and not np.isinf(std_val) else None,
            }

        # Correlation Matrix Calculation
        correlations = []
        if len(numeric_cols) >= 2:
            corr_df = df[numeric_cols].corr()
            for i in range(len(numeric_cols)):
                for j in range(i + 1, len(numeric_cols)):
                    correlations.append({
                        "x": numeric_cols[i],
                        "y": numeric_cols[j],
                        "correlation": float(corr_df.iloc[i, j]) if not pd.isna(corr_df.iloc[i, j]) else 0
                    })

        summary = {
            "columns": df.columns.tolist(),
            "shape": df.shape,
            "numeric_columns": numeric_cols,
            "categorical_columns": categorical_cols,
            "stats": stats_summary
        }
        
        data_head = df.head(10).to_json()
        
        # Get AI Insights
        ai_response_str = get_ai_insights(json.dumps(clean_for_json(summary)), data_head)
        try:
            ai_analysis = json.loads(ai_response_str)
        except:
            ai_analysis = {"insights": ["Could not parse AI response"], "suggested_graphs": []}
        
        # Merge correlation data into analysis
        ai_analysis["correlations"] = correlations

        # Handle nulls and infinites gracefully for json conversion
        df_cleaned = df.where(pd.notnull(df), None)
        raw_data = df_cleaned.to_dict(orient="records")
        
        response_data = {
            "summary": summary,
            "data": raw_data,
            "analysis": ai_analysis
        }
        
        # Recursively clean the entire response to guarantee JSON compliance
        return clean_for_json(response_data)
        
    except Exception as e:
        logger.exception(f"Internal Server Error during upload: {str(e)}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)