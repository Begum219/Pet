class RiskCalculator:
    @staticmethod
    def interpret_confidence(confidence_level):
        interpretations = {
            "High": "Strong indication - recommend veterinary consultation",
            "Medium": "Possible condition - monitor symptoms and consider veterinary advice", 
            "Low": "Uncertain diagnosis - veterinary examination recommended",
            "Very Low": "Unable to determine - professional evaluation necessary"
        }
        return interpretations.get(confidence_level, "Unknown confidence level")
