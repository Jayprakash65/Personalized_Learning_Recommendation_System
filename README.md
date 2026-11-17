# Personalized Learning Recommendation System

An AI-powered educational web application that analyzes student learning activity using **unsupervised Machine Learning (K-Means Clustering)** to deliver personalized study recommendations across 5 academic courses.

Developed as a BCA Problem-Based Learning (PBL) project at **Brainware University, Department of Computational Sciences**.

---

## Key Highlights

- **Machine Learning Clustering**: Scikit-Learn `KMeans` ($K=2$, Silhouette Score = `0.4759`) trained on learner behavior (`courses_enrolled`, `avg_feedback`, `previous_attempts`, `days_viewed`).
- **Pedagogical Personalization**:
  - **Cluster 0 (Foundation Profile)**: Standard/beginner learners $\rightarrow$ Prioritizes **Beginner** resources first for conceptual strengthening.
  - **Cluster 1 (High-Engagement Profile)**: Re-attempt/high-activity learners $\rightarrow$ Prioritizes **Intermediate** practice resources first.
- **5 Supported Academic Courses**: Data Structures, Object Oriented Programming, Digital Principles & System Design, Communication Engineering, and Discrete Mathematics.
- **Full-Stack Implementation**: **FastAPI** backend with dual-origin CORS support (`localhost:5173` & `127.0.0.1:5173`) and a reactive **React 19 + Vite** frontend.

---

## Project Structure

```
├── backend/
│   ├── data/                   # Student profiles, catalogue, and recommendations datasets
│   ├── models/                 # Serialized kmeans_model.pkl and scaler.pkl
│   └── main.py                 # FastAPI REST API endpoints & CORS middleware
├── docs/
│   ├── PROJECT_DOCUMENTATION.md                               # Comprehensive Markdown project manual
│   ├── Personalized_Learning_Recommendation_System_documentation (1).docx  # Project report document
│   └── Personalized Learning Recommendation System Presentation.pptx      # Viva presentation slides
├── frontend/                   # React 19 + Vite web application
├── notebooks/                  # Jupyter exploratory and prototyping notebooks
├── eda_visualization.py        # EDA charts (correlation heatmap, feedback, days viewed)
├── evaluation.py               # Silhouette Score & cluster distribution plots
├── recommend.py                # Standalone recommendation logic module
├── train_model.py              # K-Means model training & persistence script
└── understand_data.py          # Data profiling & missing value inspection
```

---

## Quick Start

### 1. Backend Setup
```bash
# Create and activate virtual environment
python3 -m venv ml-env
source ml-env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be accessible at: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Dashboard will be accessible at: `http://localhost:5173` or `http://127.0.0.1:5173`

---

## Comprehensive Documentation
For in-depth architecture diagrams, mathematical formulations, API schemas, and QA test matrices, see:
- [docs/PROJECT_DOCUMENTATION.md](file:///home/jayprakash/Desktop/PersonalisedLearningSystem/docs/PROJECT_DOCUMENTATION.md)
- [docs/Personalized_Learning_Recommendation_System_documentation (1).docx](file:///home/jayprakash/Desktop/PersonalisedLearningSystem/docs/Personalized_Learning_Recommendation_System_documentation%20(1).docx)
- [docs/Personalized Learning Recommendation System Presentation.pptx](file:///home/jayprakash/Desktop/PersonalisedLearningSystem/docs/Personalized%20Learning%20Recommendation%20System%20Presentation.pptx)
