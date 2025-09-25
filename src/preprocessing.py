import re
import pandas as pd

class Preprocessor:
    @staticmethod
    def advanced_text_preprocessing(text):
        text = str(text).lower()
        
        # Medical abbreviations expansion
        medical_expansions = {
            'gi': 'gastrointestinal',
            'dka': 'diabetic ketoacidosis', 
            'uri': 'upper respiratory infection',
            'uti': 'urinary tract infection'
        }
        
        for abbr, expansion in medical_expansions.items():
            text = re.sub(rf'\b{abbr}\b', expansion, text)
        
        text = re.sub(r'[^\w\s\-]', ' ', text)
        text = ' '.join(text.split())
        
        return text

    @staticmethod
    def simple_data_augmentation(df):
        original_size = len(df)
        augmented_data = []
        
        synonyms = {
            'vomiting': 'throwing up',
            'diarrhea': 'loose stool',
            'assess': 'evaluate',
            'monitor': 'observe',
            'implement': 'apply'
        }
        
        if len(df) < 1000:
            for _, row in df.iterrows():
                original_text = str(row['text'])
                augmented_text = original_text
                for original, synonym in synonyms.items():
                    if original in original_text.lower():
                        augmented_text = re.sub(rf'\b{original}\b', synonym, augmented_text, flags=re.IGNORECASE)
                        break
                if augmented_text != original_text:
                    augmented_data.append({'text': augmented_text, 'condition': row['condition']})
        
        if augmented_data:
            augmented_df = pd.DataFrame(augmented_data)
            combined_df = pd.concat([df, augmented_df], ignore_index=True)
            print(f"📈 Data augmentation: {original_size} → {len(combined_df)} samples")
            return combined_df
        else:
            print("📊 No augmentation applied")
            return df
