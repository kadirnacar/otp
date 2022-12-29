import base64
import cv2
from flask import Flask, request, jsonify
import numpy as np
from paddleocr import PaddleOCR, draw_ocr

app = Flask(__name__)
paddleOcr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)

@app.post("/ocr")
def ocr():
    if request.is_json:
        data = request.get_json()
        baseImage = base64.b64decode(data["dataobj"]["image"])
        image = np.asarray(bytearray(baseImage), dtype=np.uint8)
        #  image = np.asarray(bytearray(binary), dtype="uint8")
        image = cv2.imdecode(image, cv2.IMREAD_COLOR)
        result = paddleOcr.ocr(image)
        plate = ""
        
        for idx in range(len(result)):
            res = result[idx]
            
            for line in res:
                plate = line[1][0]

        return {"plate": plate}, 201
    return {"error": "Request must be JSON"}, 415