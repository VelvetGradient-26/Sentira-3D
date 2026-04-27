import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import time
from collections import Counter
from sklearn.feature_extraction.text import CountVectorizer
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# Set aesthetic parameters for seaborn
sns.set_theme(style="whitegrid", palette="muted")

# PATH SETUP
PATH = "/Users/deepak/Desktop/Sentira-3D/data/raw/dataset.csv"

def load_data():
    """BLOCK 1: Data Loading and Basic Overview"""
    print("\n" + "="*50)
    print("BLOCK 1: DATA LOADING & BASIC METRICS")
    print("="*50)
    
    start_time = time.time()
    column_names = ['target', 'id', 'date', 'flag', 'user', 'text']
    
    # latin-1 is strictly required for this dataset
    df = pd.read_csv(PATH, encoding='latin-1', names=column_names)
    
    print(f"Dataset loaded in {time.time() - start_time:.2f} seconds.")
    print(f"Total Rows: {df.shape[0]:,}")
    print(f"Total Columns: {df.shape[1]}")
    
    print("\nMissing Values per Column:")
    print(df.isnull().sum())
    
    print("\nData Types:")
    print(df.dtypes)
    
    return df

def analyze_target_distribution(df):
    """BLOCK 2: Target Variable (Sentiment) Analysis"""
    print("\n" + "="*50)
    print("BLOCK 2: TARGET DISTRIBUTION ANALYSIS")
    print("="*50)
    
    # 0 = negative, 2 = neutral, 4 = positive
    # The training set typically only contains 0 and 4, but we must verify.
    target_counts = df['target'].value_counts().sort_index()
    
    print("Exact Target Counts:")
    for val, count in target_counts.items():
        label = "Negative" if val == 0 else "Neutral" if val == 2 else "Positive"
        print(f"[{val}] {label}: {count:,} ({count/len(df)*100:.2f}%)")

def analyze_text_metadata(df):
    """BLOCK 3: Text Length and Structure Analysis"""
    print("\n" + "="*50)
    print("BLOCK 3: TEXT LENGTH & METADATA")
    print("="*50)
    
    # Calculate character count and word count
    df['char_count'] = df['text'].apply(len)
    df['word_count'] = df['text'].apply(lambda x: len(str(x).split()))
    df['avg_word_length'] = df['char_count'] / df['word_count']
    
    print("Summary Statistics for Word Count:")
    print(df['word_count'].describe().round(2))
    
    print("\nSummary Statistics for Character Count:")
    print(df['char_count'].describe().round(2))
    
    # 99th Percentile Calculation (Crucial for Transformer max_length)
    p99 = np.percentile(df['word_count'], 99)
    print(f"\n💡 Architectural Insight: 99% of tweets have {int(p99)} words or fewer.")
    print(f"   We should set our DistilBERT tokenizer max_length to roughly {int(p99) + 5} to capture edge cases without wasting compute.")
    print("-> Saved plot: 02_word_count_distribution.png")

def analyze_temporal_patterns(df):
    """BLOCK 4: Temporal Analysis (When do people tweet?)"""
    print("\n" + "="*50)
    print("BLOCK 4: TEMPORAL & TIMESTAMP ANALYSIS")
    print("="*50)
    
    print("Parsing dates (this may take 30-60 seconds on 1.6M rows)...")
    # Date format: Sat May 16 23:58:44 UTC 2009
    # Pandas can handle this, but dropping 'UTC' makes parsing much faster
    cleaned_dates = df['date'].str.replace(' PDT', '').str.replace(' UTC', '')
    
    # We take a sample of 100k rows for temporal analysis to keep EDA fast
    sample_df = df.sample(100000, random_state=42).copy()
    sample_df['parsed_date'] = pd.to_datetime(cleaned_dates.loc[sample_df.index], format='%a %b %d %H:%M:%S %Y', errors='coerce')
    
    sample_df = sample_df.dropna(subset=['parsed_date'])
    sample_df['day_of_week'] = sample_df['parsed_date'].dt.day_name()
    sample_df['hour_of_day'] = sample_df['parsed_date'].dt.hour
    
def analyze_users(df):
    """BLOCK 5: User Behavior and Anomalies"""
    print("\n" + "="*50)
    print("BLOCK 5: USER BEHAVIOR")
    print("="*50)
    
    unique_users = df['user'].nunique()
    print(f"Total Unique Users: {unique_users:,}")
    print(f"Average Tweets per User: {len(df) / unique_users:.2f}")
    
    top_users = df['user'].value_counts().head(10)
    print("\nTop 10 Most Active Users:")
    print(top_users)

def analyze_ngrams(df):
    """BLOCK 6: Lexical & N-Gram Analysis (Positive vs Negative)"""
    print("\n" + "="*50)
    print("BLOCK 6: N-GRAM & LEXICAL ANALYSIS")
    print("="*50)
    
    print("Extracting top bigrams for Negative tweets (Sampling 50k rows for speed)...")
    neg_tweets = df[df['target'] == 0]['text'].sample(50000, random_state=42)
    pos_tweets = df[df['target'] == 4]['text'].sample(50000, random_state=42)
    
    def get_top_n_bigrams(corpus, n=10):
        # We use english stop words to filter out "is the", "of a", etc.
        vec = CountVectorizer(ngram_range=(2, 2), stop_words='english').fit(corpus)
        bag_of_words = vec.transform(corpus)
        sum_words = bag_of_words.sum(axis=0) 
        words_freq = [(word, sum_words[0, idx]) for word, idx in vec.vocabulary_.items()]
        words_freq =sorted(words_freq, key = lambda x: x[1], reverse=True)
        return words_freq[:n]

    top_neg_bigrams = get_top_n_bigrams(neg_tweets, 10)
    top_pos_bigrams = get_top_n_bigrams(pos_tweets, 10)
    
    print("\nTop 5 Negative Bigrams:")
    for word, freq in top_neg_bigrams[:5]:
        print(f"  '{word}': {freq}")
        
    print("\nTop 5 Positive Bigrams:")
    for word, freq in top_pos_bigrams[:5]:
        print(f"  '{word}': {freq}")

if __name__ == "__main__":
        df = load_data()
        analyze_target_distribution(df)
        analyze_text_metadata(df)
        analyze_temporal_patterns(df)
        analyze_users(df)
        analyze_ngrams(df)
        
        print("\n" + "="*50)
        print("EDA COMPLETE. Check the 'notebooks/eda_outputs/' folder for high-res plots.")
        print("="*50)