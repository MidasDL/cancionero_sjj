import os
import glob

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.splitlines()

    # Step 1: If no empty lines, file is already processed — skip it
    if not any(line.strip() == "" for line in lines):
        return False  # skipped

    # Step 2: Concatenate lines 1, 3 and 5 (index 0, 2, 4) into line 1,
    #         separated by ". ", then delete lines 2–5 (index 1–4)
    if len(lines) >= 5:
        merged = f"{lines[0]}. {lines[2]}. {lines[4]}"
        lines = [merged] + lines[5:]
    elif len(lines) >= 3:
        merged = f"{lines[0]}. {lines[2]}"
        lines = [merged] + lines[3:]

    # Step 3: Remove all empty lines
    lines = [line for line in lines if line.strip() != ""]

    # Step 4: Remove lines that are exactly "(ESTRIBILLO)"
    lines = [line for line in lines if line.strip() != "(ESTRIBILLO)"]

    # Step 5: Remove leading "N." (digit + dot) from lines that start with 1, 2 or 3
    result = []
    for line in lines:
        if len(line) >= 2 and line[0] in "123" and line[1] == ".":
            line = line[2:]
        result.append(line)

    new_content = "\n".join(result) + "\n"

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)

    return True  # processed


def main():
    txt_files = sorted(glob.glob(os.path.join(DATA_DIR, "*.txt")))
    processed = 0
    skipped = 0

    for filepath in txt_files:
        filename = os.path.basename(filepath)
        changed = process_file(filepath)
        if changed:
            print(f"  Processed: {filename}")
            processed += 1
        else:
            print(f"  Skipped:   {filename}")
            skipped += 1

    print(f"\nDone. Processed: {processed}, Skipped: {skipped}, Total: {len(txt_files)}")


if __name__ == "__main__":
    main()
