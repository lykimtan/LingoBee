import io
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import base64
import cv2
import numpy as np

app = FastAPI(
    title="YOLO11 Vocabulary Generator API",
    description="Microservice for Object Detection using YOLO11 (yolo11m + custom)",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. HÀM TÍNH TOÁN IOU ---
def calculate_iou(box1, box2):
    """Tính toán phần trăm diện tích đè lên nhau giữa 2 bounding box"""
    x_left = max(box1[0], box2[0])
    y_top = max(box1[1], box2[1])
    x_right = min(box1[2], box2[2])
    y_bottom = min(box1[3], box2[3])

    if x_right < x_left or y_bottom < y_top:
        return 0.0

    intersection_area = (x_right - x_left) * (y_bottom - y_top)
    box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
    box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])

    iou = intersection_area / float(box1_area + box2_area - intersection_area)
    return iou

# --- 2. TẢI MÔ HÌNH ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH_BASE = os.path.join(BASE_DIR, "yolo11m.pt")
MODEL_PATH_CUSTOM = os.path.join(BASE_DIR, "best.pt")

print("⏳ Đang tải các mô hình...")
try:
    base_model = YOLO(MODEL_PATH_BASE)
    print("Base model loaded successfully!")
except Exception as e:
    print(f"Warning: Base model could not be loaded initially. Error: {e}")
    base_model = YOLO("yolo11m.pt")

try:
    custom_model = YOLO(MODEL_PATH_CUSTOM)
    print("Custom model loaded successfully!")
except Exception as e:
    print(f"Error loading custom model: {e}")

@app.post("/api/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image")
    
    try:
        # Read the image file into memory
        image_bytes = await file.read()
        
        # Convert to numpy array for OpenCV
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
             raise HTTPException(status_code=400, detail="Invalid image data")

        img_display = img.copy()

        # Run YOLO inference
        res_base = base_model.predict(source=img, conf=0.25)[0]
        res_custom = custom_model.predict(source=img, conf=0.25)[0]
        
        # --- 3. TRÍCH XUẤT VÀ LỌC DỮ LIỆU BOX ---
        custom_boxes = []
        detected_objects = []

        # Lưu lại toàn bộ box của model custom
        for box in res_custom.boxes:
            coords = list(map(int, box.xyxy[0]))
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            label_name = custom_model.names[cls_id]
            detected_objects.append(label_name)
            custom_boxes.append({
                'coords': coords, 'conf': conf,
                'label': f"{label_name} {conf:.2f}",
                'color': (0, 0, 255) # Màu đỏ (BGR)
            })

        base_boxes = []
        # Lưu box của model gốc NHƯNG phải kiểm tra xem có bị trùng với custom_boxes không
        IOU_THRESHOLD = 0.5 

        for box in res_base.boxes:
            coords = list(map(int, box.xyxy[0]))
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            label_name = base_model.names[cls_id]

            is_overlapping = False
            for c_box in custom_boxes:
                if calculate_iou(coords, c_box['coords']) > IOU_THRESHOLD:
                    is_overlapping = True
                    break 

            # Chỉ lấy box này nếu nó KHÔNG đè lên box của model custom
            if not is_overlapping:
                detected_objects.append(label_name)
                base_boxes.append({
                    'coords': coords, 'conf': conf,
                    'label': f"{label_name} {conf:.2f}",
                    'color': (0, 255, 0) # Màu xanh lá (BGR)
                })

        # --- 4. VẼ TẤT CẢ BOX ĐÃ ĐƯỢC LỌC LÊN ẢNH ---
        final_boxes = custom_boxes + base_boxes

        for item in final_boxes:
            x1, y1, x2, y2 = item['coords']
            color = item['color']
            label_text = item['label']

            # Vẽ viền
            cv2.rectangle(img_display, (x1, y1), (x2, y2), color, 2)

            # Vẽ nền text và chèn chữ
            (w, h), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
            cv2.rectangle(img_display, (x1, y1 - 25), (x1 + w, y1), color, -1)
            cv2.putText(img_display, label_text, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # Chuyển ảnh đã vẽ sang base64 để trả về
        _, buffer = cv2.imencode('.jpg', img_display)
        img_str = base64.b64encode(buffer).decode("utf-8")
        base64_image = f"data:image/jpeg;base64,{img_str}"
        
        unique_objects = list(set(detected_objects))
        
        return {
            "success": True,
            "detected_objects": unique_objects,
            "processed_image_base64": base64_image,
            "count": len(unique_objects)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "YOLO11 AI Service (Base + Custom) is running. Access /docs for the API interface."}
