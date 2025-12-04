"""
BERT-based Text Classification for Compliance Detection
Detects: allowed, t&cs, competition, green_claims, charity
"""

import torch
from transformers import BertTokenizer, BertForSequenceClassification
from transformers import Trainer, TrainingArguments
import numpy as np
import json
import os
from datetime import datetime

class ComplianceTextClassifier:
    """BERT classifier for detecting compliance violations in text"""
    
    # Label mapping
    LABELS = {
        0: 'allowed',        # Compliant text
        1: 'tcs',           # Terms & Conditions
        2: 'competition',   # Competition/Contest language
        3: 'green_claim',   # Environmental claims
        4: 'charity',       # Charity partnerships
        5: 'price_claim',   # Price/discount claims
        6: 'guarantee'      # Money-back guarantees
    }
    
    def __init__(self, model_path=None):
        """
        Initialize classifier
        
        Args:
            model_path: Path to fine-tuned model (None = use base BERT)
        """
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"🔧 Using device: {self.device}")
        
        if model_path and os.path.exists(model_path):
            print(f"📦 Loading fine-tuned model from {model_path}")
            self.tokenizer = BertTokenizer.from_pretrained(model_path)
            self.model = BertForSequenceClassification.from_pretrained(model_path)
        else:
            print("📦 Loading base BERT model (bert-base-uncased)")
            self.tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
            self.model = BertForSequenceClassification.from_pretrained(
                'bert-base-uncased',
                num_labels=len(self.LABELS)
            )
        
        self.model.to(self.device)
        self.model.eval()
        
        print("✅ BERT Classifier initialized")
    
    def classify_text(self, text, threshold=0.7):
        """
        Classify a single text input
        
        Args:
            text: Text to classify
            threshold: Confidence threshold (0-1)
        
        Returns:
            dict with prediction, confidence, and label
        """
        if not text or not text.strip():
            return {
                'label': 'allowed',
                'label_id': 0,
                'confidence': 1.0,
                'compliant': True
            }
        
        # Tokenize
        inputs = self.tokenizer(
            text,
            return_tensors='pt',
            truncation=True,
            padding=True,
            max_length=128
        ).to(self.device)
        
        # Predict
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=1)
            
            prediction = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][prediction].item()
        
        label = self.LABELS[prediction]
        
        return {
            'label': label,
            'label_id': prediction,
            'confidence': round(confidence, 3),
            'compliant': label == 'allowed' or confidence < threshold,
            'all_probabilities': {
                self.LABELS[i]: round(probabilities[0][i].item(), 3)
                for i in range(len(self.LABELS))
            }
        }
    
    def classify_batch(self, texts, threshold=0.7):
        """
        Classify multiple texts at once
        
        Args:
            texts: List of texts
            threshold: Confidence threshold
        
        Returns:
            List of classification results
        """
        results = []
        
        for text in texts:
            result = self.classify_text(text, threshold)
            results.append(result)
        
        return results
    
    def fine_tune(self, training_data, output_dir='./models/bert-compliance', epochs=3):
        """
        Fine-tune BERT on custom compliance data
        
        Args:
            training_data: List of dicts with 'text' and 'label' keys
            output_dir: Where to save fine-tuned model
            epochs: Number of training epochs
        """
        print(f"🎓 Starting fine-tuning with {len(training_data)} examples...")
        
        # Prepare dataset
        texts = [item['text'] for item in training_data]
        labels = [item['label'] for item in training_data]
        
        encodings = self.tokenizer(
            texts,
            truncation=True,
            padding=True,
            max_length=128,
            return_tensors='pt'
        )
        
        class ComplianceDataset(torch.utils.data.Dataset):
            def __init__(self, encodings, labels):
                self.encodings = encodings
                self.labels = labels
            
            def __getitem__(self, idx):
                item = {key: val[idx] for key, val in self.encodings.items()}
                item['labels'] = torch.tensor(self.labels[idx])
                return item
            
            def __len__(self):
                return len(self.labels)
        
        dataset = ComplianceDataset(encodings, labels)
        
        # Training arguments
        training_args = TrainingArguments(
            output_dir=output_dir,
            num_train_epochs=epochs,
            per_device_train_batch_size=8,
            warmup_steps=100,
            weight_decay=0.01,
            logging_dir=f'{output_dir}/logs',
            logging_steps=10,
            save_strategy='epoch',
            evaluation_strategy='no',
        )
        
        # Trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=dataset,
        )
        
        # Train
        print("🏋️ Training...")
        trainer.train()
        
        # Save
        print(f"💾 Saving model to {output_dir}")
        self.model.save_pretrained(output_dir)
        self.tokenizer.save_pretrained(output_dir)
        
        print("✅ Fine-tuning complete!")
        
        return output_dir
    
    def save_model(self, output_dir):
        """Save model to disk"""
        os.makedirs(output_dir, exist_ok=True)
        self.model.save_pretrained(output_dir)
        self.tokenizer.save_pretrained(output_dir)
        print(f"✅ Model saved to {output_dir}")
    
    def explain_prediction(self, text, result):
        """
        Generate human-readable explanation for prediction
        
        Args:
            text: Original text
            result: Classification result
        
        Returns:
            Explanation string
        """
        label = result['label']
        confidence = result['confidence']
        
        explanations = {
            'tcs': f"Detected Terms & Conditions language with {confidence:.1%} confidence. Remove phrases like 'T&Cs apply' or 'conditions apply'.",
            'competition': f"Detected competition/contest language with {confidence:.1%} confidence. Remove words like 'win', 'prize', 'enter', 'competition'.",
            'green_claim': f"Detected environmental claim with {confidence:.1%} confidence. Remove unverified claims like 'eco-friendly', 'sustainable', 'green'.",
            'charity': f"Detected charity partnership mention with {confidence:.1%} confidence. Remove references to donations or charity partnerships.",
            'price_claim': f"Detected price/discount claim with {confidence:.1%} confidence. Move pricing to value tiles only.",
            'guarantee': f"Detected money-back guarantee with {confidence:.1%} confidence. Remove guarantee or refund promises.",
            'allowed': f"Text appears compliant with {confidence:.1%} confidence."
        }
        
        return explanations.get(label, f"Classified as '{label}' with {confidence:.1%} confidence.")


# Training data generator
def generate_training_data():
    """Generate synthetic training data for compliance classification"""
    
    training_examples = [
        # ALLOWED (label 0)
        {"text": "Fresh and delicious every day", "label": 0},
        {"text": "New product available now", "label": 0},
        {"text": "Premium quality ingredients", "label": 0},
        {"text": "Taste the difference", "label": 0},
        {"text": "Available at Tesco", "label": 0},
        {"text": "Perfect for any occasion", "label": 0},
        {"text": "Made with care", "label": 0},
        {"text": "Your family will love it", "label": 0},
        {"text": "Great value for money", "label": 0},
        {"text": "Try something new today", "label": 0},
        
        # T&Cs (label 1)
        {"text": "Terms and conditions apply", "label": 1},
        {"text": "T&Cs apply see website", "label": 1},
        {"text": "Subject to terms and conditions", "label": 1},
        {"text": "See full terms at tesco.com", "label": 1},
        {"text": "Conditions apply while stocks last", "label": 1},
        {"text": "Terms apply to this offer", "label": 1},
        {"text": "T&C apply online only", "label": 1},
        {"text": "Subject to availability and terms", "label": 1},
        
        # COMPETITION (label 2)
        {"text": "Win a £1000 prize", "label": 2},
        {"text": "Enter our competition today", "label": 2},
        {"text": "Win amazing prizes", "label": 2},
        {"text": "Enter to win now", "label": 2},
        {"text": "Competition closes soon", "label": 2},
        {"text": "Prize draw ends Friday", "label": 2},
        {"text": "Win a holiday for two", "label": 2},
        {"text": "Enter our sweepstakes", "label": 2},
        
        # GREEN CLAIMS (label 3)
        {"text": "100% eco-friendly packaging", "label": 3},
        {"text": "Sustainable and environmentally friendly", "label": 3},
        {"text": "Carbon neutral product", "label": 3},
        {"text": "Good for the planet", "label": 3},
        {"text": "Recyclable and green", "label": 3},
        {"text": "Zero waste production", "label": 3},
        {"text": "Environmentally responsible choice", "label": 3},
        {"text": "Plastic-free and sustainable", "label": 3},
        
        # CHARITY (label 4)
        {"text": "Support our charity partner", "label": 4},
        {"text": "Proceeds go to charity", "label": 4},
        {"text": "We donate to good causes", "label": 4},
        {"text": "Help us support children in need", "label": 4},
        {"text": "For every purchase we donate", "label": 4},
        {"text": "Partnership with cancer research", "label": 4},
        
        # PRICE CLAIMS (label 5)
        {"text": "Save 50% off today only", "label": 5},
        {"text": "Half price special offer", "label": 5},
        {"text": "Buy one get one free", "label": 5},
        {"text": "20% discount this week", "label": 5},
        {"text": "Special deal just £9.99", "label": 5},
        
        # GUARANTEES (label 6)
        {"text": "Money-back guarantee", "label": 6},
        {"text": "100% satisfaction guaranteed", "label": 6},
        {"text": "Full refund if not satisfied", "label": 6},
        {"text": "Risk-free trial offer", "label": 6},
        {"text": "Guaranteed results or your money back", "label": 6},
    ]
    
    return training_examples


# Testing function
def test_classifier():
    """Test the classifier with sample texts"""
    
    print("\n" + "="*60)
    print("🧪 Testing BERT Compliance Classifier")
    print("="*60 + "\n")
    
    classifier = ComplianceTextClassifier()
    
    test_texts = [
        "Fresh orange juice available now",
        "Win a £1000 prize! T&Cs apply.",
        "Eco-friendly sustainable packaging",
        "Support our charity partner with every purchase",
        "Money-back guarantee if not satisfied",
        "Available at Tesco stores nationwide",
        "Save 50% off today only",
    ]
    
    for text in test_texts:
        result = classifier.classify_text(text)
        explanation = classifier.explain_prediction(text, result)
        
        print(f"Text: \"{text}\"")
        print(f"  → Label: {result['label']} ({result['confidence']:.1%} confidence)")
        print(f"  → Compliant: {result['compliant']}")
        print(f"  → {explanation}")
        print()


if __name__ == "__main__":
    test_classifier()