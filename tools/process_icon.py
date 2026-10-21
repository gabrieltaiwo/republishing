#!/usr/bin/env python3
import sys
from PIL import Image

def process_image(input_path, output_path, opacity=1.0):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()

    new_data = []
    for item in data:
        lum = int(0.299 * item[0] + 0.587 * item[1] + 0.114 * item[2])
        alpha = int((255 - lum) * opacity)
        new_data.append((26, 26, 26, alpha))

    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    op = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
    process_image(sys.argv[1], sys.argv[2], op)
