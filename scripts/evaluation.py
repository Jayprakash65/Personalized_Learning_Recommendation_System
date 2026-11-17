
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

# Project paths
BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "backend/data/student_profiles.csv"
MODEL_PATH = BASE_DIR / "backend/models/student_clusters.csv"

# Load data
df = pd.read_csv(DATA_PATH)
cluster_df = pd.read_csv(MODEL_PATH)

# 1. Silhouette Score Comparison
k_values = [2, 3, 4, 5, 6]
scores = [0.4759, 0.3970, 0.4378, 0.4604, 0.4505]

plt.figure(figsize=(8, 5))
plt.plot(k_values, scores, marker="o")
plt.title("Silhouette Score Comparison")
plt.xlabel("Number of Clusters (K)")
plt.ylabel("Silhouette Score")
plt.xticks(k_values)
plt.grid(True)
plt.savefig(BASE_DIR / "silhouette_score_comparison.png")
plt.close()

# 2. Cluster Distribution
cluster_counts = cluster_df["cluster"].value_counts().sort_index()

plt.figure(figsize=(8, 5))
plt.bar(
    cluster_counts.index.astype(str),
    cluster_counts.values
)
plt.title("Student Cluster Distribution")
plt.xlabel("Cluster")
plt.ylabel("Number of Students")
plt.savefig(BASE_DIR / "cluster_distribution.png")
plt.close()

print("Evaluation graphs generated successfully!")
print("Silhouette Score Comparison saved.")
print("Cluster Distribution saved.")
