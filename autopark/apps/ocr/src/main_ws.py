import cv2
import numpy as np
import websocket
import _thread
import time
import rel
import json
from paddleocr import PaddleOCR, draw_ocr
import os
import base64
from threading import Thread
print(cv2.__version__)
def on_message(ws, message):
    def run(*args):
        jsonData = json.loads(message)
        baseImage = base64.standard_b64decode(jsonData["dataobj"]["image"])
        image = np.asarray(bytearray(baseImage), dtype=np.uint8)
        #  image = np.asarray(bytearray(binary), dtype="uint8")
        image = cv2.imdecode(image, cv2.IMREAD_COLOR)
        result = ocr.ocr(image)
    
        for idx in range(len(result)):
            res = result[idx]
            
            for line in res:
                ws.send("deneme:"+line[1][0])
    
    
    
    Thread(target=run).start()
    

    # filePath = jsonData["data"]
    # base64.b64decode()
    # f = os.path.join(directory, filePath)
    # if os.path.isfile(f):
    #     result = ocr.ocr(f, cls=False)

    #     for idx in range(len(result)):
    #         res = result[idx]
    #         print(f)
    #         for line in res:
    #             print(line)
    #             # ws.send(line)


def on_error(ws, error):
    print(error)


def on_close(ws, close_status_code, close_msg):
    print("### closed ###")


def on_open(ws):
    print("Opened connection")


if __name__ == "__main__":
    websocket.enableTrace(False)
    directory = '/Volumes/Veri/github/otp/autopark/dist/detects'
    ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
    ws = websocket.WebSocketApp("ws://localhost:3333/ws?ocr",
                                on_open=on_open,
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)

    # Set dispatcher to automatic reconnection, 5 second reconnect delay if connection closed unexpectedly
    ws.run_forever(dispatcher=rel, reconnect=5)
    rel.signal(2, rel.abort)  # Keyboard Interrupt
    rel.dispatch()
