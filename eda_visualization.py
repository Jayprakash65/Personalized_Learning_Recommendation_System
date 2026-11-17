
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load dataset
df = pd.read_csv("backend/data/student_profiles.csv")

# Display basic information
print("Dataset loaded successfully!")
print("Total students:", len(df))

# Feedback distribution
plt.figure(figsize=(8, 5))

sns.histplot(
    data=df,
    x="avg_feedback",
    bins=10,
    kde=True
)

plt.title("Distribution of Average Student Feedback")
plt.xlabel("Average Feedback")
plt.ylabel("Number of Students")

plt.tight_layout()
plt.savefig("feedback_distribution.png", dpi=300, bbox_inches="tight")
print("Graph saved successfully!")



# Previous Attempts Distribution
plt.figure(figsize=(8, 5))

sns.countplot(
    data=df,
    x="previous_attempts"
)

plt.title("Distribution of Previous Attempts")
plt.xlabel("Number of Previous Attempts")
plt.ylabel("Number of Students")

plt.tight_layout()

plt.savefig(
    "previous_attempts_distribution.png",
    dpi=300,
    bbox_inches="tight"
)

print("Previous attempts graph saved!")




# Days Viewed Distribution
plt.figure(figsize=(8, 5))

sns.histplot(
    data=df,
    x="days_viewed",
    bins=10,
    kde=True
)

plt.title("Distribution of Student Learning Days")
plt.xlabel("Number of Days Viewed")
plt.ylabel("Number of Students")

plt.tight_layout()

plt.savefig(
    "days_viewed_distribution.png",
    dpi=300,
    bbox_inches="tight"
)

print("Days viewed graph saved!")



features = [
    "courses_enrolled",
    "avg_feedback",
    "previous_attempts",
    "days_viewed"
]

plt.figure(figsize=(8, 6))

sns.heatmap(
    df[features].corr(),
    annot=True,
    cmap="coolwarm",
    fmt=".2f"
)

plt.title("Student Feature Correlation")
plt.tight_layout()

plt.savefig("correlation_heatmap.png", dpi=300)
print("Heatmap saved!")