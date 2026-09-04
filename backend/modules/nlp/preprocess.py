import re

try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        nlp = None
except ImportError:
    spacy = None
    nlp = None

def clean_text(text: str) -> str:
    """
    Clean unnecessary characters, null bytes, etc.
    Preserves important identifiers like phones, cases, dates, etc.
    """
    if not text:
        return ""
    # Remove control characters except newlines and tabs
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    return text

def normalize_whitespace(text: str) -> str:
    """
    Normalize repeated whitespace and line breaks into single spaces.
    """
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def sentence_segmentation(text: str) -> list:
    """
    Perform sentence segmentation.
    """
    if not text:
        return []
    if nlp:
        doc = nlp(text)
        return [sent.text.strip() for sent in doc.sents if sent.text.strip()]
    
    # Fallback if spacy is unavailable
    # Basic regex for sentence splitting (handles basic punctuation)
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip()]

def basic_tokenization(text: str) -> list:
    """
    Perform basic tokenization.
    """
    if not text:
        return []
    if nlp:
        doc = nlp(text)
        return [token.text for token in doc if not token.is_space]
    
    # Fallback if spacy is unavailable
    # Simple regex for words, numbers, and basic punctuation
    tokens = re.findall(r'\w+|[^\w\s]', text)
    return tokens

def preprocess(text: str) -> dict:
    """
    Complete preprocessing pipeline.
    """
    cleaned = clean_text(text)
    normalized = normalize_whitespace(cleaned)
    sentences = sentence_segmentation(normalized)
    tokens = basic_tokenization(normalized)
    
    return {
        "original_text": text,
        "normalized_text": normalized,
        "sentences": sentences,
        "tokens": tokens
    }

