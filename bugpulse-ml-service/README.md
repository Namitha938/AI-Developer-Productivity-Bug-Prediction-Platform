# BugPulse ML Service

A separate FastAPI service for **file-level bug-risk prediction**. It is designed to sit beside the existing FastAPI application and React frontend; it does not replace Firebase Authentication, Firestore, Cloudinary, or the current deterministic code analyzer.

## Important status

The service starts without a trained model so `/health` and `/features` remain usable. `/predict` returns HTTP 503 until a model artifact has been trained from a real labeled dataset. It intentionally does not ship with synthetic training labels or made-up accuracy metrics.

The current feature extractor is lexical and language-agnostic. It is not an AST parser, does not prove a vulnerability exists, and does not produce line-level bug locations. Keep deterministic rule-based findings separate from the model's file-level probability.

## Setup (Windows PowerShell)

```powershell
cd ml-service
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

Open `http://127.0.0.1:8001/docs` for the API docs.

## Endpoints

- `GET /health` — reports whether a trained model artifact is available.
- `POST /features` — extracts numeric features without needing a trained model.
- `POST /predict` — estimates file-level bug-proneness; returns 503 until a model is available.

Example request body:

```json
{
  "filename": "example.py",
  "language": "python",
  "code": "def find_item(items, target):\n    for item in items:\n        if item == target:\n            return item\n    return None"
}
```

## Training data contract

Provide a CSV with columns `code,is_buggy`, where each row is one source file/code unit and `is_buggy` is a trustworthy historical label:

- `1`, `true`, `yes`, `buggy`, `defective` -> bug-prone
- `0`, `false`, `no`, `clean`, `non-buggy` -> not bug-prone

Use examples from historical repositories or a reputable defect dataset. Do not label examples using the current heuristic's risk score and then claim the ML model independently predicts bugs; that would only teach the model to imitate the heuristic. Ensure labels and code samples align at the same unit (e.g. file revision and its subsequent defect label), avoid duplicate/revision leakage between train and test, and prefer repository/time-based evaluation when a sufficiently large dataset is available.

Minimum enforced for a basic holdout run: 20 labeled samples and at least 5 per class. This is only a technical floor, not enough evidence for production reliability.

```powershell
python scripts/train.py --data data/bug_dataset.csv --output models/bug_risk_model.joblib
```

The script uses a stratified 80/20 holdout split and writes accuracy, precision, recall, F1, confusion matrix, and ROC-AUC where available. These are a first sanity check, not a production validation. The training script does not automatically download datasets.

## Tests

```powershell
pytest -q
```

## Integration plan

1. Establish a suitable labeled dataset and train/evaluate the model.
2. Run this service independently and test `/health`, `/features`, and `/predict`.
3. Add a server-to-server client in the existing FastAPI backend; do not expose the ML service publicly without suitable access controls.
4. Define the frontend integration contract, preserve existing `AnalysisResult` fields, and replace mock analysis state only after end-to-end tests pass.
5. Persist analysis history in Firestore only through the authenticated backend, scoped to the verified Firebase UID.
