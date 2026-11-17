
import pandas as pd
import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Load saved ML files and datasets
MODEL_DIR = BASE_DIR / "backend/models"

model = joblib.load(MODEL_DIR / "kmeans_model.pkl")
scaler = joblib.load(MODEL_DIR / "scaler.pkl")

students = pd.read_csv(BASE_DIR / "backend/data/student_profiles.csv")
resources = pd.read_csv(BASE_DIR / "backend/data/resource_catalogue.csv")

FEATURES = [
    "courses_enrolled",
    "avg_feedback",
    "previous_attempts",
    "days_viewed"
]


def recommend(student_id, course_name):

    student = students[
        students["Student-Id"] == student_id
    ]

    if student.empty:
        return {"error": "Student not found"}

    student = student.iloc[0]

    # Predict student's cluster
    student_features = student[FEATURES].to_frame().T
    scaled_features = scaler.transform(student_features)

    cluster = int(model.predict(scaled_features)[0])

    # Filter resources by selected course
    course_resources = resources[
        resources["Course Name"].str.lower()
        == course_name.lower()
    ].copy()

    if course_resources.empty:
        return {"error": "Course not found"}

    # Cluster-based recommendation priority
    if cluster == 0:
        priority_map = {
            "Beginner": 1,
            "Intermediate": 2
        }
    else:
        priority_map = {
            "Intermediate": 1,
            "Beginner": 2
        }

    course_resources["Priority"] = course_resources[
        "Difficulty"
    ].map(priority_map)

    course_resources = course_resources.sort_values(
        ["Priority", "Resource ID"]
    )

    return {
        "student_id": student_id,
        "cluster": cluster,
        "recommendations": course_resources.to_dict(
            orient="records"
        )
    }


if __name__ == "__main__":

    test_students = [201801001, 201801002]

    for student_id in test_students:
        result = recommend(student_id, "Data Structures")

        print("\nStudent ID:", student_id)
        print("Cluster:", result.get("cluster"))
        print("Recommended Topics:")

        for item in result.get("recommendations", []):
            print(
                item["Topic"],
                "-",
                item["Difficulty"],
                "- Priority:",
                item["Priority"]
            )