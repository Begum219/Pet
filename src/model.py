from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

class PetModel:
    def __init__(self):
        self.vectorizer = None
        self.label_encoder = LabelEncoder()
        self.model = None
        self.actual_accuracy = None
        self.actual_classification_report = None

    def configure_optimized_vectorizer(self, texts):
        data_size = len(texts)
        if data_size < 500:
            max_features = min(300, data_size)
            ngram_range = (1, 2)
            min_df = 1
        elif data_size < 2000:
            max_features = min(800, data_size // 2)
            ngram_range = (1, 3)
            min_df = 2
        else:
            max_features = min(1500, data_size // 3)
            ngram_range = (1, 3)
            min_df = 3
        
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            ngram_range=ngram_range,
            min_df=min_df,
            stop_words='english'
        )
        return self.vectorizer

    def train_improved_model(self, df, preprocessor):
        df = df.dropna(subset=['text', 'condition'])
        df = preprocessor.simple_data_augmentation(df)
        df['processed_text'] = df['text'].apply(preprocessor.advanced_text_preprocessing)
        self.configure_optimized_vectorizer(df['processed_text'])
        
        X = self.vectorizer.fit_transform(df['processed_text'])
        y = self.label_encoder.fit_transform(df['condition'])
        
        if len(df) >= 20:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
        else:
            X_train, X_test, y_train, y_test = X, X, y, y
        
        n_estimators = min(200, max(50, len(df) // 10))
        max_depth = min(20, max(5, len(df) // 100 + 5))
        
        self.model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=max(2, len(df)//500),
            random_state=42
        )
        self.model.fit(X_train, y_train)
        
        y_pred = self.model.predict(X_test)
        self.actual_accuracy = accuracy_score(y_test, y_pred)
        self.actual_classification_report = classification_report(
            y_test, y_pred, target_names=self.label_encoder.classes_,
            output_dict=True, zero_division=0
        )
        return True

    def multi_label_diagnosis(self, symptom_description, preprocessor, confidence_threshold=0.15):
        from risk_calculator import RiskCalculator  # Confidence yorumları için

        cleaned_text = preprocessor.advanced_text_preprocessing(symptom_description)
        text_vector = self.vectorizer.transform([cleaned_text])
        probabilities = self.model.predict_proba(text_vector)[0]

        predictions = []
        for i, prob in enumerate(probabilities):
            condition = self.label_encoder.classes_[i]
            if prob >= confidence_threshold:
                confidence_level = "High" if prob > 0.6 else "Medium" if prob > 0.3 else "Low"
                predictions.append({
                    "condition": condition,
                    "probability": round(prob, 3),
                    "percentage": round(prob*100, 1),
                    "confidence_level": confidence_level
                })

        predictions.sort(key=lambda x: x['probability'], reverse=True)
        primary = predictions[0] if predictions else {
            "condition": "Uncertain",
            "probability": 0.0,
            "percentage": 0.0,
            "confidence_level": "Very Low"
        }

        return {
            "primary_diagnosis": primary,
            "possible_diagnoses": predictions,
            "multiple_possibilities": len(predictions) > 1,
            "confidence_interpretation": RiskCalculator.interpret_confidence(primary['confidence_level']),
            "recommendations": []  # Klinik öneriler daha sonra eklenebilir
        }
