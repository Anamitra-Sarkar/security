"""
Weight calibration script.
Reads sample analysis results and adjusts ensemble weights.
Does NOT train any model — only calibrates thresholds and weights.

Usage: python scripts/calibrate.py [--input samples.json] [--output weights.json]
"""
import json
import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.app.services.ensemble import calibrate_weights


def main():
    parser = argparse.ArgumentParser(description="Calibrate ensemble weights")
    parser.add_argument("--input", default="scripts/sample_results.json",
                        help="Path to sample results JSON file")
    parser.add_argument("--output", default=None,
                        help="Path to write calibrated weights (prints to stdout if not set)")
    args = parser.parse_args()

    if os.path.exists(args.input):
        with open(args.input) as f:
            samples = json.load(f)
    else:
        print(f"No sample file found at {args.input}, using defaults")
        samples = []

    weights = calibrate_weights(samples)
    output = json.dumps(weights, indent=2)

    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
        print(f"Weights written to {args.output}")
    else:
        print("Calibrated weights:")
        print(output)


if __name__ == "__main__":
    main()
