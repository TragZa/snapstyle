from flask import Flask, request, jsonify
from transformers import SegformerImageProcessor, AutoModelForSemanticSegmentation
from PIL import Image
import requests
import torch.nn as nn
import numpy as np
import io
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/segment', methods=['POST'])
def get_url():
    data = request.get_json()
    url = data.get('url')
    image_file = data.get('image')

    processor = SegformerImageProcessor.from_pretrained("mattmdjaga/segformer_b2_clothes")
    model = AutoModelForSemanticSegmentation.from_pretrained("mattmdjaga/segformer_b2_clothes")

    if url:
        image = Image.open(requests.get(url, stream=True).raw)
    elif image_file:
        image = Image.open(io.BytesIO(base64.b64decode(image_file)))
    else:
        return jsonify({"error": "No url or image provided"}), 400

    inputs = processor(images=image, return_tensors="pt")

    outputs = model(**inputs)
    logits = outputs.logits.cpu()

    upsampled_logits = nn.functional.interpolate(
        logits,
        size=image.size[::-1],
        mode="bilinear",
        align_corners=False,
    )

    pred_seg = upsampled_logits.argmax(dim=1)[0]
    pred_seg_np = pred_seg.numpy()

    unique_labels = np.unique(pred_seg_np)

    excluded_labels = [0, 2, 11, 12, 13, 14, 15]

    segmented_images = {}

    for label in unique_labels:
        if label not in excluded_labels:
            mask = np.where(pred_seg_np == label, 1, 0).astype(np.uint8)
            segmented_part = np.array(image) * mask[:, :, None]
            segmented_image = Image.fromarray(segmented_part)

            byte_arr = io.BytesIO()
            segmented_image.save(byte_arr, format='PNG')
            encoded_image = base64.b64encode(byte_arr.getvalue()).decode('ascii')

            segmented_images[f"segmented_{label}"] = encoded_image

    return jsonify(segmented_images)

if __name__ == "__main__":
    app.run(debug=True)
