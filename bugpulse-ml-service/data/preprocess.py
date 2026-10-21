
import json
import random
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
INPUT_FILE = DATA_DIR / "function.json"
SEED = 42


def main():
    with INPUT_FILE.open("r", encoding="utf-8") as file:
        records = json.load(file)

    if not isinstance(records, list):
        raise ValueError("Expected function.json to contain a list.")

    cleaned = []

    for index, record in enumerate(records):
        code = record.get("func")
        label = record.get("target")

        if not isinstance(code, str) or not code.strip():
            continue

        if isinstance(label, bool):
            label = int(label)

        if label not in (0, 1):
            continue

        cleaned.append({
            "func": code,
            "target": int(label),
            "idx": index,
        })

    # Shuffle reproducibly, then split each class separately
    # to preserve the original class proportions.
    rng = random.Random(SEED)
    by_label = {
        0: [r for r in cleaned if r["target"] == 0],
        1: [r for r in cleaned if r["target"] == 1],
    }

    splits = {"train": [], "valid": [], "test": []}

    for label_records in by_label.values():
        rng.shuffle(label_records)
        n = len(label_records)
        train_end = int(n * 0.8)
        valid_end = train_end + int(n * 0.1)

        splits["train"].extend(label_records[:train_end])
        splits["valid"].extend(label_records[train_end:valid_end])
        splits["test"].extend(label_records[valid_end:])

    for name, rows in splits.items():
        rng.shuffle(rows)
        output = DATA_DIR / f"{name}.jsonl"

        with output.open("w", encoding="utf-8") as file:
            for row in rows:
                file.write(json.dumps(row) + "\n")

        print(f"{name}.jsonl: {len(rows)} records")

    print("Preprocessing complete.")


if __name__ == "__main__":
    main()
