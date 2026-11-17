
import pandas as pd

# Load student dataset
df = pd.read_csv("backend/data/student_profiles.csv")

# Dataset information
print("Dataset Shape:", df.shape)

print("\nFirst Five Records:")
print(df.head())

print("\nColumn Names:")
print(df.columns.tolist())

print("\nData Types:")
print(df.dtypes)

print("\nMissing Values:")
print(df.isnull().sum())

print("\nStatistical Summary:")
print(df.describe())

print("\nDuplicate Records:", df.duplicated().sum())

print("\nUnique Students:", df["Student-Id"].nunique())

print("\n--- Click Records Analysis ---")

print(pd.crosstab(
    df["available_click_records"],
    df["total_clicks"].isnull(),
    margins=True
))

print("\n--- Exercise Records Analysis ---")

print(pd.crosstab(
    df["available_exercise_records"],
    df["total_exercises"].isnull(),
    margins=True
))

print("\n--- Sample Missing Click Records ---")

print(
    df.loc[
        df["total_clicks"].isnull(),
        ["Student-Id", "available_click_records", "total_clicks"]
    ].head(10)
)

print("\n--- Sample Missing Exercise Records ---")

print(
    df.loc[
        df["total_exercises"].isnull(),
        ["Student-Id", "available_exercise_records", "total_exercises"]
    ].head(10)
)
