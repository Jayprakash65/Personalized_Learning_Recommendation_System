# Personalized Learning Recommendation System
## Comprehensive Technical Project Documentation & System Manual

**Academic Year**: 2024–2026  
**Institution**: Brainware University, Department of Computational Sciences  
**Degree**: Bachelor of Computer Application (BCA)  
**Developer**: Avinash Kr Mandal (Student Code: BWU/BCA/24/081 | Reg: 24103002860 | Roll: 24103460079)  
**Project Supervisor**: Dr. Rahul Kumar Ghosh, Assistant Professor  

---

## 1. Project Overview & Abstract

The **Personalized Learning Recommendation System** is an AI-driven educational web platform designed to analyze learner engagement, cluster student behavioral profiles using unsupervised machine learning, and dynamically recommend tailored academic resources across multiple undergraduate computer science and engineering modules.

Traditional learning management systems (LMS) present all students with identical, uncurated lists of learning materials regardless of their individual academic pace, prior performance, or engagement habits. This system addresses this challenge through:
1. **Unsupervised Machine Learning**: Training an optimal **K-Means Clustering Model** ($K=2$, Silhouette Score = $0.4759$) based on standardized student engagement features (`courses_enrolled`, `avg_feedback`, `previous_attempts`, `days_viewed`).
2. **Behavioral Profile Segmentation**: Differentiating between **Foundation Learners** (Cluster 0: fewer attempts, lower active days) and **Advanced / High-Engagement Learners** (Cluster 1: multiple re-attempts, high active days).
3. **Dynamic Resource Prioritization**: Generating course-specific recommendation paths for 5 distinct subjects, assigning high-priority to foundational/beginner content for Cluster 0, and challenging intermediate/practice content for Cluster 1.
4. **Full-Stack Reactive Delivery**: Exposing high-performance REST APIs via **FastAPI** with dual-origin CORS support and rendering a modern, accessible user interface built on **React 19** and **Vite**.

---

## 2. System Architecture & Data Flow

The project follows a decoupled, three-tier microservice-inspired architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   React 19 Frontend (Vite, Port 5173)                   │
│  - Neural-Orb Initialization & Preloader                               │
│  - Real-Time Learning Analytics KPI Cards                              │
│  - Student ID & Subject Dropdown Explorer                              │
│  - Dynamic Recommendation Cards with Pedagogical Rationales            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (JSON)
                                    │ (CORS: localhost & 127.0.0.1)
┌───────────────────────────────────▼────────────────────────────────────┐
│                   FastAPI Backend Service (Port 8000)                  │
│  - /api/stats, /api/students, /api/students/{id}                       │
│  - /api/students/{id}/personalized-recommendations?course_name=...     │
│  - Input Validation, Exception Handling, Dual-Origin Middleware        │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       Machine Learning Engine        │  │       Data Store Layer       │
│  - StandardScaler Normalizer         │  │  - student_profiles.csv      │
│  - Trained KMeans Model (k=2)        │  │  - resource_catalogue.csv    │
│  - Dynamic Cluster Prediction        │  │  - top_recommendations.csv   │
│  - Priority Sort & Difficulty Mapper │  │  - student_clusters.csv      │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

---

## 3. Machine Learning Pipeline & Cluster Analysis

### 3.1 Feature Selection & Data Preprocessing
The unsupervised learning model is trained on learner activity records derived from the LMS dataset:
- `courses_enrolled`: Count of concurrent modules pursued by the learner.
- `avg_feedback`: Historical learner satisfaction / feedback score on learning modules.
- `previous_attempts`: Number of previous course attempts or examination retakes.
- `days_viewed`: Cumulative days the learner accessed LMS learning materials.

To ensure features with larger magnitude (such as `days_viewed`) do not disproportionately bias the Euclidean distance calculations in K-Means, all four attributes are normalized using `StandardScaler`:
$$\mu = [1.2195, 3.2537, 0.5793, 14.9939], \quad \sigma = [0.4139, 0.5163, 0.5842, 7.0048]$$

### 3.2 Optimal Cluster Selection (Silhouette Analysis)
To determine the optimal number of clusters ($K$), silhouette score analysis was conducted for $K \in [2, 6]$:

| Number of Clusters ($K$) | Silhouette Score | Evaluation Outcome |
|:---:|:---:|---|
| **$K = 2$** | **0.4759** | **Optimal Configuration (Selected Model)** |
| $K = 3$ | 0.3970 | Significant cluster overlap and boundary degradation |
| $K = 4$ | 0.4378 | Sub-clustering without distinct pedagogical distinction |
| $K = 5$ | 0.4604 | Lower silhouette compared to $K=2$ |
| $K = 6$ | 0.4505 | Redundant clustering with sparse cluster members |

### 3.3 Learner Cluster Profiles
Training Scikit-Learn's `KMeans(n_clusters=2, random_state=42, n_init=10)` produced two distinct learner archetypes:

| Cluster | Student Count | % Population | Avg Enrolled | Avg Feedback | Avg Previous Attempts | Avg Days Viewed | Academic Profile & Pedagogical Objective |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **Cluster 0** | **128** | **78.05%** | 1.00 | 3.27 | **0.44** | **12.19** | **Foundation Learner**: First-time attendees with moderate viewing days. Benefit most from beginner/foundational materials first to build mastery. |
| **Cluster 1** | **36** | **21.95%** | 2.00 | 3.21 | **1.08** | **24.97** | **High-Engagement / Re-attempt Learner**: High active days and re-attempt history. Need intermediate/practice resources first to address gaps. |

---

## 4. Personalized Recommendation Methodology

Recommendations are generated dynamically when a student and course are queried:
1. **Student Retrieval**: Student profile features are loaded from `student_profiles.csv`.
2. **Feature Transformation**: Features are standardized using `scaler.pkl`.
3. **Cluster Prediction**: `kmeans_model.pkl` predicts whether the student belongs to Cluster 0 or Cluster 1.
4. **Course Resource Filtering**: Course catalogue items matching the requested course (case-insensitive) are extracted.
5. **Priority Assignment**:
   - **If Cluster == 0**: `{"Beginner": Priority 1, "Intermediate": Priority 2}`
   - **If Cluster == 1**: `{"Intermediate": Priority 1, "Beginner": Priority 2}`
6. **Deterministic Secondary Sorting**: Resources are sorted by `["Priority", "Resource ID"]` in ascending order.

### Supported Courses & Catalogue Distribution

| Course Code | Course Name | Beginner Resources | Intermediate Resources | Total Resources |
|---|---|:---:|:---:|:---:|
| **CS8391** | Data Structures | 2 (Notes, Video) | 2 (Practice) | 4 |
| **CS8392** | Object Oriented Programming | 2 (Notes, Practice) | 2 (Video, Notes) | 4 |
| **CS8351** | Digital Principles and System Design | 2 (Notes, Video) | 1 (Practice) | 3 |
| **EC8395** | Communication Engineering | 1 (Notes) | 2 (Video, Practice) | 3 |
| **MA8351** | Discrete Mathematics | 2 (Notes, Practice) | 1 (Video) | 3 |
| **Total** | **5 Academic Subjects** | **9 Resources** | **8 Resources** | **17 Resources** |

---

## 5. Backend API Reference (FastAPI)

The backend provides high-performance RESTful JSON endpoints implemented in `backend/main.py`.

### 5.1 Endpoints Summary

| Method | Route | Description | Query / Path Parameters | Response Schema |
|---|---|---|---|---|
| `GET` | `/` | API Root Health & Status | None | `{"message": str, "status": "running"}` |
| `GET` | `/api/health` | Service Liveness Probe | None | `{"status": "healthy"}` |
| `GET` | `/api/stats` | Dataset & Coverage Metrics | None | `{"total_students": int, "total_courses": int, ...}` |
| `GET` | `/api/students` | List all 164 student profiles | None | Array of Student Profile objects |
| `GET` | `/api/students/{student_id}` | Profile for specific student | `student_id: int` | Student Profile object (404 if not found) |
| `GET` | `/api/students/{student_id}/recommendations` | Static top recommendations | `student_id: int` | Top recommendation items sorted by rank |
| `GET` | `/api/students/{student_id}/personalized-recommendations` | **ML Dynamic Recommendation** | `student_id: int`, `course_name: str` | `{"student_id": int, "cluster": int, "recommendations": [...]}` |

### 5.2 Dynamic Recommendation Request & Response Example

**Request**:
```http
GET /api/students/201801001/personalized-recommendations?course_name=Data%20Structures HTTP/1.1
Host: 127.0.0.1:8000
Accept: application/json
```

**Response (`HTTP 200 OK`)**:
```json
{
  "student_id": 201801001,
  "cluster": 1,
  "recommendations": [
    {
      "Resource ID": "R003",
      "Course Code": "CS8391",
      "Course Name": "Data Structures",
      "Topic": "Trees and Graphs",
      "Resource Type": "Practice",
      "Difficulty": "Intermediate",
      "Priority": 1
    },
    {
      "Resource ID": "R004",
      "Course Code": "CS8391",
      "Course Name": "Data Structures",
      "Topic": "Sorting and Searching",
      "Resource Type": "Practice",
      "Difficulty": "Intermediate",
      "Priority": 1
    },
    {
      "Resource ID": "R001",
      "Course Code": "CS8391",
      "Course Name": "Data Structures",
      "Topic": "Arrays and Linked Lists",
      "Resource Type": "Notes",
      "Difficulty": "Beginner",
      "Priority": 2
    },
    {
      "Resource ID": "R002",
      "Course Code": "CS8391",
      "Course Name": "Data Structures",
      "Topic": "Stack and Queue",
      "Resource Type": "Video",
      "Difficulty": "Beginner",
      "Priority": 2
    }
  ]
}
```

### 5.3 Cross-Origin Resource Sharing (CORS) Configuration
To allow developer and browser access regardless of whether the frontend is served via `localhost` or loopback IP `127.0.0.1`, FastAPI is configured with dual-origin resolution:
```python
frontend_urls = [
    url.strip().rstrip("/")
    for url in os.getenv(
        "FRONTEND_URLS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if url.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_urls,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)
```

---

## 6. Frontend Architecture (React 19 & Vite)

### 6.1 Component Hierarchy & User Experience
The frontend is constructed using pure React 19 functional components without bulky CSS framework dependencies:
1. **Preloader Screen (`ml-loader`)**: An animated neural-orb loader initializes upon startup, giving visual feedback while the API connection and student profile records are fetched.
2. **Global Header**: Real-time status indicator displaying `API Connected` (green) or `API Disconnected` (red).
3. **Analytics Stats Grid**: Displays total student body count (164), course count (5), catalog resources (17), and total recommendation capacity (492).
4. **Student Explorer Controls**:
   - `Student ID` Select Dropdown populated from the API.
   - `Course Name` Select Dropdown covering all five accredited modules.
   - `Get Recommendations →` Action button triggering parallel fetching.
5. **Learner Profile Card**: Displays individual academic history (courses enrolled, average feedback, previous attempts, days viewed, total clicks).
6. **Personalized Learning Path Cards**: Renders prioritized resource cards with:
   - Priority Badge: `RECOMMENDATION · PRIORITY 1` vs `PRIORITY 2`.
   - Content Badges: Resource Type (`Notes`, `Video`, `Practice`), Difficulty (`Beginner`, `Intermediate`).
   - Pedagogical Explanation: Explains *why* the material was chosen based on the student's learning cluster.

---

## 7. Quality Assurance & Test Verification Report

A comprehensive 31-point test suite was executed against all project modules:

| Test Identifier | Category | Test Target | Input / Parameters | Expected Status | Actual Result |
|---|---|---|---|:---:|:---:|
| `TC-BE-01` | Backend Startup | `GET /` | Root endpoint | HTTP 200 | **PASS** |
| `TC-BE-02` | Backend Health | `GET /api/health` | Health check probe | HTTP 200 | **PASS** |
| `TC-BE-03` | Analytics Stats | `GET /api/stats` | Aggregated metrics | HTTP 200 | **PASS** |
| `TC-BE-04` | Student Directory | `GET /api/students` | All student profiles | HTTP 200 | **PASS** |
| `TC-ML-01` | Model Loading | `kmeans_model.pkl` | Model file presence & type | KMeans object | **PASS** |
| `TC-ML-02` | Scaler Loading | `scaler.pkl` | Scaler file presence & type | StandardScaler | **PASS** |
| `TC-ML-03` | Student 201801001 | ML Cluster Prediction | Features: [2, 2.92, 1, 27] | Cluster 1 | **PASS** |
| `TC-ML-04` | Student 201801002 | ML Cluster Prediction | Features: [1, 4.01, 0, 16] | Cluster 0 | **PASS** |
| `TC-REC-01` | Course 1 Dynamic Rec | Data Structures | Student 201801001 & 201801002 | Priority sorted | **PASS** |
| `TC-REC-02` | Course 2 Dynamic Rec | Object Oriented Prog | Student 201801001 & 201801002 | Priority sorted | **PASS** |
| `TC-REC-03` | Course 3 Dynamic Rec | Digital Principles | Student 201801001 & 201801002 | Priority sorted | **PASS** |
| `TC-REC-04` | Course 4 Dynamic Rec | Communication Eng | Student 201801001 & 201801002 | Priority sorted | **PASS** |
| `TC-REC-05` | Course 5 Dynamic Rec | Discrete Mathematics | Student 201801001 & 201801002 | Priority sorted | **PASS** |
| `TC-NEG-01` | Non-existent Student | `GET /api/students/999999999` | Student ID: 999999999 | HTTP 404 | **PASS** |
| `TC-NEG-02` | Negative Student ID | `GET /api/students/-1` | Student ID: -1 | HTTP 404 | **PASS** |
| `TC-NEG-03` | Invalid ID Datatype | `GET /api/students/abc` | String student ID | HTTP 422 | **PASS** |
| `TC-NEG-04` | Invalid Course Name | `GET ...?course_name=Invalid` | Invalid course name | HTTP 404 | **PASS** |
| `TC-NEG-05` | Empty Course Name | `GET ...?course_name=` | Empty string query | HTTP 404 | **PASS** |
| `TC-NEG-06` | Missing Query Param | `GET .../personalized-recommendations` | No course_name param | HTTP 422 | **PASS** |
| `TC-INT-01` | CORS Localhost | `Origin: http://localhost:5173` | Pre-flight / GET | Allowed Header | **PASS** |
| `TC-INT-02` | CORS 127.0.0.1 | `Origin: http://127.0.0.1:5173` | Pre-flight / GET | Allowed Header | **PASS** |
| `TC-INT-03` | CORS Unauthorized | `Origin: http://unauthorized.com` | Pre-flight / GET | Header Omitted | **PASS** |

---

## 8. Installation, Setup & Execution Manual

### 8.1 Prerequisites
- Linux / macOS / Windows with WSL
- Python 3.10+ (Python 3.12 recommended)
- Node.js v18+ and npm v9+

### 8.2 Backend Setup & Execution
1. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv ml-env
   source ml-env/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. (Optional) Re-train the K-Means clustering model and generate evaluation plots:
   ```bash
   python train_model.py
   python evaluation.py
   python eda_visualization.py
   ```
4. Start the FastAPI backend server:
   ```bash
   uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The backend API and Swagger UI documentation will be live at `http://127.0.0.1:8000/docs`.

### 8.3 Frontend Setup & Execution
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Verify environment configuration in `frontend/.env`:
   ```properties
   VITE_API_URL=http://127.0.0.1:8000
   ```
4. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   The interactive dashboard will be available at `http://localhost:5173` or `http://127.0.0.1:5173`.

---

## 9. Conclusion & Future Roadmap

The Personalized Learning Recommendation System demonstrates a practical and effective application of unsupervised machine learning in modern educational technology. By grouping learners into actionable behavioral clusters, the system moves beyond generic one-size-fits-all curricula to deliver meaningful, adaptive study paths.

### Future Enhancements:
- **Collaborative Filtering & Deep Learning**: Integrating Matrix Factorization (SVD) and Neural Collaborative Filtering (NCF) to incorporate implicit feedback (quiz scores, completion rates).
- **Relational Database Migration**: Migrating CSV flat-file storage to PostgreSQL with SQLAlchemy ORM for production scale and concurrent transactions.
- **Real-Time LMS Webhooks**: Connecting live LMS activity streams (Moodle / Canvas) for continuous model retraining and dynamic profile updates.
