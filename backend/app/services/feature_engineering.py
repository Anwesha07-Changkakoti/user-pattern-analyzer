import pandas as pd

def preprocess(df: pd.DataFrame) -> pd.DataFrame:
    # Keeping numeric columns only
    num_df = df.select_dtypes(include="number")
    # Filling NaNs with column mean
    num_df = num_df.fillna(num_df.mean(numeric_only=True))
    return num_df
