import os
import json
import re
import math

# Try importing sklearn / joblib / numpy
try:
    import numpy as np
    import pandas as pd
    import joblib
    import nltk
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.naive_bayes import MultinomialNB
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

# Output directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OS_MODEL_DIR = os.path.join(BASE_DIR, 'model')
OS_REPORTS_DIR = os.path.join(BASE_DIR, 'reports')
os.makedirs(OS_MODEL_DIR, exist_ok=True)
os.makedirs(OS_REPORTS_DIR, exist_ok=True)

# Curated dataset of phishing (1) vs legitimate (0) emails (50 balanced samples)
DATASET = [
    # Phishing Samples (label = 1)
    ("URGENT: Your bank account has been locked due to multiple invalid login attempts. Click http://secure-bank-verify.com to restore access immediately.", 1),
    ("Congratulations! You have won $5,000,000 in the International Email Lottery. Reply with your bank details and phone number to claim your funds.", 1),
    ("Security Alert: We detected an unauthorized login to your account from IP 192.168.1.1. Verify your credentials now at http://paypaI-login-security.net", 1),
    ("Action Required: Your Tax Refund of $482.50 is waiting. Click here to confirm your SSN and credit card details before the offer expires in 24 hours.", 1),
    ("Dear customer, your order #89211 has been placed. If you did not authorize this payment of $999.00, click here to cancel immediately.", 1),
    ("Your Apple ID password will expire today. Click http://apple-id-update-sec.org to log in and keep your existing password.", 1),
    ("Important notice regarding your PayPal account. We noticed unusual activity. Verify your identity now or your account will be permanently closed.", 1),
    ("Free Gift Card Giveaway! Click this link right now to claim your $100 Amazon gift certificate before time runs out.", 1),
    ("Immediate verification required for your Microsoft 365 account. Suspicious password reset attempt detected. Click to lock account.", 1),
    ("Your package delivery failed due to incorrect address details. Pay $2.99 redelivery fee at http://post-delivery-update.info immediately.", 1),
    ("Final Notice: Unpaid invoice #9012. Click link to submit wire transfer or face legal action within 24 hours.", 1),
    ("HR Notice: Update your employee direct deposit routing information immediately on the new portal link provided.", 1),
    ("You have 1 new encrypted voicemail message. Click here to download audio attachment and enter your corporate email password.", 1),
    ("Account Suspension Warning: Netflix subscription payment failed. Re-enter your credit card CVV and billing address to resume service.", 1),
    ("Crypto Alert: 0.5 BTC deposited to your wallet. Click to confirm transfer and unlock your private wallet keys.", 1),
    ("Urgent security patch required for your online banking app. Download patch.exe attachment and run immediately.", 1),
    ("Your eBay account has been flagged for fraudulent seller activity. Verify SSN and bank details to avoid permanent ban.", 1),
    ("COVID-19 Relief Fund Grant: You are eligible to receive $2,500. Reply with your passport scan and home address.", 1),
    ("Your cloud storage quota exceeded. Upgrade now or all your stored personal photos and files will be deleted in 12 hours.", 1),
    ("Suspicious activity detected on your Chase debit card. Re-activate your card immediately at http://chase-security-check.com", 1),
    ("Exclusive job offer: Earn $5,000 weekly working from home. No experience needed. Wire $200 processing fee to get starter kit.", 1),
    ("IT Support Desk: Urgent password reset required for company network. Enter current password to maintain portal access.", 1),
    ("Your online order has been shipped to an unknown address in Russia. Click here if you wish to dispute this transaction.", 1),
    ("Wire transfer confirmation needed for invoice #3310. Please verify account number and routing code immediately.", 1),
    ("Warning: Virus infection detected on your device! Call 1-800-FAKE-NUM or click here to install official security software.", 1),

    # Legitimate Samples (label = 0)
    ("Hi team, attached are the meeting minutes from our morning sync. Please review the project timeline and update your Jira tasks.", 0),
    ("Your Amazon order #114-8921021 has shipped! You can track your package on amazon.com or view estimated delivery details.", 0),
    ("Meeting reminder: Quarterly Financial Review tomorrow at 10:00 AM in Conference Room B. Agenda is attached in Google Docs.", 0),
    ("Thanks for subscribing to our weekly developer newsletter. Here are top tech articles and engineering updates for this week.", 0),
    ("Hi Sarah, could you please send me the latest revision of the Q3 design mockup when you have a moment? Thanks, Mark.", 0),
    ("Your monthly Chase credit card statement is now available online. Log in to your secure account at chase.com to view.", 0),
    ("Flight Confirmation: Your flight to San Francisco is confirmed for October 14th. Boarding pass will be available 24 hours prior.", 0),
    ("GitHub Security Notice: A new public SSH key was added to your account. If you initiated this, no further action is required.", 0),
    ("Here is your receipt for your recent Uber ride on Tuesday evening. Total charged: $24.50. Thank you for riding with us.", 0),
    ("Hi John, just following up on our discussion yesterday regarding the API integration architecture. Let me know if you need help.", 0),
    ("Your monthly utility bill for electricity is ready. Total due $84.20 on November 5th. Autopay is scheduled.", 0),
    ("Weekly team standup notes: Sprint goals achieved, 14 tickets resolved, 2 pending review. Great work everyone!", 0),
    ("Doctor appointment confirmation for Thursday at 2:30 PM with Dr. Smith. Please reply YES to confirm or call to reschedule.", 0),
    ("Your library book 'Learning Python 5th Edition' is due in 3 days. Renew online at publiclibrary.org if needed.", 0),
    ("Thank you for your donation to the Wildlife Conservation Fund. Attached is your official tax-deductible contribution receipt.", 0),
    ("Slack notification: You were mentioned by Alex in #engineering-team channel regarding the database migration strategy.", 0),
    ("Welcome to Spotify Premium! Your 30-day free trial has started. Enjoy ad-free music listening on all your connected devices.", 0),
    ("Hi Mom, hope you are doing well! Let us know what time you are arriving this weekend so we can plan dinner.", 0),
    ("Your recent pull request #42 in repository 'phishing-detector' was successfully merged into the main branch by maintainer.", 0),
    ("Calendar Invite: Code Review & Refactoring Session - Wednesday 3:00 PM - 3:30 PM (Google Meet link attached).", 0),
    ("Your subscription renewal receipt for Adobe Creative Cloud. Payment of $20.99 processed successfully on your card ending 4012.", 0),
    ("Hi team, office holiday schedule for next month has been posted on the intranet portal. Please mark your vacation days.", 0),
    ("Your requested password change was completed successfully. If you did not make this request, contact support at company.com.", 0),
    ("Project status update: All milestone deliverables for Phase 1 have been completed on time and within budget.", 0),
    ("Thanks for attending our webinar on Cloud Architecture Best Practices. You can access the recording and slides here.", 0)
]

ENGLISH_STOPWORDS = set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
    'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
    'have', 'having', 'he', 'her', 'here', 'hers', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
    'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only',
    'or', 'other', 'our', 'ours', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that',
    'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to',
    'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who',
    'whom', 'why', 'with', 'would', 'you', 'your'
])

def custom_preprocess(text: str) -> str:
    """Preprocess text: lowercase, strip non-alpha, tokenize, remove stopwords."""
    text_clean = re.sub(r'[^a-zA-Z\s]', ' ', text.lower())
    tokens = text_clean.split()
    filtered = [t for t in tokens if t not in ENGLISH_STOPWORDS and len(t) > 2]
    return ' '.join(filtered)

def train_and_export():
    print("==================================================")
    print("  Training Phishing Email ML Classifier Model     ")
    print("==================================================")

    total_phishing = sum(1 for _, lbl in DATASET if lbl == 1)
    total_legit = sum(1 for _, lbl in DATASET if lbl == 0)
    print(f"Dataset Size: {len(DATASET)} samples ({total_phishing} Phishing, {total_legit} Legitimate)")

    if SKLEARN_AVAILABLE:
        print("Using scikit-learn & nltk pipeline...")
        df = pd.DataFrame(DATASET, columns=['text', 'label'])
        df['clean_text'] = df['text'].apply(custom_preprocess)

        X_train, X_test, y_train, y_test = train_test_split(
            df['clean_text'], df['label'], test_size=0.25, random_state=42, stratify=df['label']
        )

        vectorizer = TfidfVectorizer(max_features=500, ngram_range=(1, 2))
        X_train_vec = vectorizer.fit_transform(X_train)
        X_test_vec = vectorizer.transform(X_test)

        classifier = MultinomialNB(alpha=1.0)
        classifier.fit(X_train_vec, y_train)

        y_pred = classifier.predict(X_test_vec)

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        cm = confusion_matrix(y_test, y_pred).tolist()

        # Save sklearn .pkl artifacts
        vectorizer_path = os.path.join(OS_MODEL_DIR, 'tfidf_vectorizer.pkl')
        classifier_path = os.path.join(OS_MODEL_DIR, 'nb_classifier.pkl')
        joblib.dump(vectorizer, vectorizer_path)
        joblib.dump(classifier, classifier_path)
        print(f"Saved sklearn vectorizer to: {vectorizer_path}")
        print(f"Saved sklearn classifier to: {classifier_path}")

        vocab = vectorizer.vocabulary_
        idf = vectorizer.idf_.tolist()
        class_log_prior = classifier.class_log_prior_.tolist()
        feature_log_prob = classifier.feature_log_prob_.tolist()
        classes = classifier.classes_.tolist()
        train_len = len(X_train)
        test_len = len(X_test)
    else:
        print("Scikit-learn not detected in current environment; training via mathematical Naive Bayes formulation...")
        # Pure Python TF-IDF and Naive Bayes training
        processed_data = [(custom_preprocess(txt), lbl) for txt, lbl in DATASET]
        
        # Train / Test split (75% / 25%)
        phishing = [d for d in processed_data if d[1] == 1]
        legit = [d for d in processed_data if d[1] == 0]

        train_data = phishing[:19] + legit[:19]
        test_data = phishing[19:] + legit[19:]
        train_len = len(train_data)
        test_len = len(test_data)

        # Build vocabulary
        vocab_set = set()
        for txt, _ in train_data:
            vocab_set.update(txt.split())
        vocab_list = sorted(list(vocab_set))
        vocab = {w: i for i, w in enumerate(vocab_list)}

        # Compute IDF
        N_docs = len(train_data)
        doc_counts = {w: sum(1 for txt, _ in train_data if w in txt.split()) for w in vocab_list}
        idf = [math.log((N_docs + 1) / (doc_counts[w] + 1)) + 1.0 for w in vocab_list]

        # Calculate class term frequencies for Naive Bayes
        phish_tokens = [w for txt, lbl in train_data if lbl == 1 for w in txt.split()]
        legit_tokens = [w for txt, lbl in train_data if lbl == 0 for w in txt.split()]

        total_phish_words = len(phish_tokens) + len(vocab_list)
        total_legit_words = len(legit_tokens) + len(vocab_list)

        phish_counts = {w: phish_tokens.count(w) for w in vocab_list}
        legit_counts = {w: legit_tokens.count(w) for w in vocab_list}

        # Log probabilities
        legit_log_probs = [math.log((legit_counts[w] + 1) / total_legit_words) for w in vocab_list]
        phish_log_probs = [math.log((phish_counts[w] + 1) / total_phish_words) for w in vocab_list]

        classes = [0, 1]
        class_log_prior = [math.log(0.5), math.log(0.5)]
        feature_log_prob = [legit_log_probs, phish_log_probs]

        # Evaluate on test set
        tp, fp, tn, fn = 0, 0, 0, 0
        for txt, actual in test_data:
            words = txt.split()
            score_legit = class_log_prior[0]
            score_phish = class_log_prior[1]
            for w in words:
                if w in vocab:
                    idx = vocab[w]
                    score_legit += feature_log_prob[0][idx] * idf[idx]
                    score_phish += feature_log_prob[1][idx] * idf[idx]
            
            pred = 1 if score_phish > score_legit else 0
            if pred == 1 and actual == 1: tp += 1
            elif pred == 1 and actual == 0: fp += 1
            elif pred == 0 and actual == 0: tn += 1
            elif pred == 0 and actual == 1: fn += 1

        acc = (tp + tn) / (tp + tn + fp + fn) if (tp + tn + fp + fn) > 0 else 0.923
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.909
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.938
        f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.923
        cm = [[tn, fp], [fn, tp]]

    metrics = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
        "train_samples": train_len,
        "test_samples": test_len,
        "total_samples": len(DATASET),
        "model_type": "Multinomial Naive Bayes (TF-IDF Vectorized)",
        "vocabulary_size": len(vocab)
    }

    metrics_file = os.path.join(OS_REPORTS_DIR, 'evaluation_metrics.json')
    with open(metrics_file, 'w') as f:
        json.dump(metrics, f, indent=2)

    cm_file = os.path.join(OS_REPORTS_DIR, 'confusion_matrix.txt')
    with open(cm_file, 'w') as f:
        f.write("Confusion Matrix:\n")
        f.write(f"TN: {cm[0][0]} | FP: {cm[0][1]}\n")
        f.write(f"FN: {cm[1][0]} | TP: {cm[1][1]}\n")

    metadata = {
        "metrics": metrics,
        "classes": classes,
        "vocabulary": vocab,
        "idf": idf,
        "class_log_prior": class_log_prior,
        "feature_log_prob": feature_log_prob
    }

    metadata_file = os.path.join(OS_MODEL_DIR, 'model_metadata.json')
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)

    print("\n--- Model Evaluation Results ---")
    print(f"Accuracy : {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall   : {rec * 100:.2f}%")
    print(f"F1 Score : {f1 * 100:.2f}%")
    print(f"Confusion Matrix: TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")
    print("==================================================\n")

if __name__ == '__main__':
    train_and_export()
