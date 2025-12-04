"""Test BERT classifier"""

from ai_engine.compliance.bert_classifier import ComplianceTextClassifier, generate_training_data

def main():
    print("\n🧪 Testing BERT Compliance Classifier\n")
    
    # Initialize
    classifier = ComplianceTextClassifier()
    
    # Test cases
    tests = [
        ("Fresh orange juice available now", True),
        ("Win a £1000 prize today!", False),
        ("T&Cs apply see website", False),
        ("Eco-friendly packaging", False),
        ("Available at Tesco stores", True),
        ("Money-back guarantee", False),
    ]
    
    print("Testing classifications:\n")
    for text, expected_compliant in tests:
        result = classifier.classify_text(text)
        status = "✅" if result['compliant'] == expected_compliant else "❌"
        print(f"{status} \"{text}\"")
        print(f"   → {result['label']} ({result['confidence']:.1%})")
        print()

if __name__ == "__main__":
    main()