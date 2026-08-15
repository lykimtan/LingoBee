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
MODEL_PATH_CUSTOM = os.path.join(BASE_DIR, "50classes/best.pt")

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
        
        # --- 3. TRÍCH XUẤT VÀ LỌC DỮ LIỆU BOX THEO ĐỘ TIN CẬY (NMS) ---
        all_boxes = []
        detected_objects = []
        IOU_THRESHOLD = 0.5 

        # Đưa toàn bộ box của model custom vào mảng chung
        for box in res_custom.boxes:
            coords = list(map(int, box.xyxy[0]))
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            label_name = custom_model.names[cls_id]
            all_boxes.append({
                'coords': coords, 'conf': conf,
                'label_name': label_name,
                'label': f"{label_name} {conf:.2f}",
                'color': (0, 0, 255) # Màu đỏ (BGR) cho custom model
            })

        # Đưa toàn bộ box của model gốc vào mảng chung
        for box in res_base.boxes:
            coords = list(map(int, box.xyxy[0]))
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            label_name = base_model.names[cls_id]
            
            # Tạo màu ngẫu nhiên nhưng cố định cho từng loại vật thể (cls_id) theo hệ BGR
            b = int((cls_id * 83) % 255)
            g = int((cls_id * 149) % 255)
            r = int((cls_id * 211) % 255)
            
            # Tránh trùng với màu đỏ (0, 0, 255) của custom model
            if r > 150 and g < 100 and b < 100:
                g += 100
                b += 50
                
            all_boxes.append({
                'coords': coords, 'conf': conf,
                'label_name': label_name,
                'label': f"{label_name} {conf:.2f}",
                'color': (b, g, r) 
            })

        # Sắp xếp tất cả các box theo độ tin cậy (confidence) giảm dần
        all_boxes.sort(key=lambda x: x['conf'], reverse=True)

        final_boxes = []
        
        # Áp dụng Non-Maximum Suppression (NMS) chung cho cả 2 model
        for box in all_boxes:
            is_overlapping = False
            for f_box in final_boxes:
                if calculate_iou(box['coords'], f_box['coords']) > IOU_THRESHOLD:
                    is_overlapping = True
                    break 

            # Chỉ giữ lại box nếu nó KHÔNG đè lên bất kỳ box nào có confidence cao hơn (đã được thêm vào final_boxes trước đó)
            if not is_overlapping:
                final_boxes.append(box)
                detected_objects.append(box['label_name'])

        # --- 4. VẼ TẤT CẢ BOX ĐÃ ĐƯỢC LỌC LÊN ẢNH ---

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
