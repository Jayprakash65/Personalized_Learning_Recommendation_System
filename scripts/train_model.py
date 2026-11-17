
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import joblib
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "backend/data/student_profiles.csv"
MODEL_DIR = BASE_DIR / "backend/models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Load dataset
df = pd.read_csv(DATA_PATH)

# Features selected for clustering
features = [
    "courses_enrolled",
    "avg_feedback",
    "previous_attempts",
    "days_viewed"
]

X = df[features].copy()

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Find suitable K using silhouette score

print("\nEvaluating different cluster values:")

for k in range(2, 7):
    temp_model = KMeans(
        n_clusters=k,
        random_state=42,
        n_init=10
    )

    labels = temp_model.fit_predict(X_scaled)

    score = silhouette_score(X_scaled, labels)

    print(f"K = {k}, Silhouette Score = {score:.4f}")

# Train final K-Means model
best_k = 2

# Train final K-Means model
best_k = 2

kmeans = KMeans(
    n_clusters=best_k,
    random_state=42,
    n_init=10
)

df["cluster"] = kmeans.fit_predict(X_scaled)

# Save trained model and scaler
joblib.dump(kmeans, MODEL_DIR / "kmeans_model.pkl")
joblib.dump(scaler, MODEL_DIR / "scaler.pkl")

# Save student cluster information
df.to_csv(MODEL_DIR / "student_clusters.csv", index=False)

print("\nFinal model trained successfully!")
print("\nCluster distribution:")
print(df["cluster"].value_counts().sort_index())

print("\nCluster profiles:")
print(df.groupby("cluster")[features].mean().round(2))

print("\nModel and scaler saved successfully!")

