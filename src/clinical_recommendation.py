import re
import pandas as pd


class ClinicalRecommendation:
    def __init__(self):
        self.real_clinical_recommendations = {}

    def extract_real_clinical_recommendations(self, symptoms_data):
        for condition in symptoms_data['condition'].unique():
            if pd.isna(condition):
                continue
            condition_data = symptoms_data[symptoms_data['condition'] == condition]
            all_notes = [str(t).lower() for t in condition_data['text'] if pd.notna(t)]
            if not all_notes:
                continue
            combined_text = ' '.join(all_notes)
            action_patterns = [
                r'rule out \w+\s?\w*',
                r'assess \w+\s?\w*', 
                r'monitor \w+\s?\w*',
                r'evaluate \w+\s?\w*',
                r'perform \w+\s?\w*',
                r'implement \w+\s?\w*',
                r'emphasize \w+\s?\w*'
            ]
            extracted_actions = []
            for pattern in action_patterns:
                extracted_actions.extend(re.findall(pattern, combined_text))
            self.real_clinical_recommendations[condition] = {
                'raw_notes_count': len(all_notes),
                'extracted_actions': list(set(extracted_actions))[:8],
                'sample_notes': all_notes[:1]
            }
