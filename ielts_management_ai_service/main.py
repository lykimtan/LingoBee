import io
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import base64

app = FastAPI(
    title="YOLOv10 Vocabulary Generator API",
    description="Microservice for Object Detection using YOLOv10",
    version="1.0.0"
)

# Allow CORS for Next.js and Express backends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the absolute path to the model relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "yolov10m.pt")

print("Loading YOLOv10 model...")
try:
    model = YOLO(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Warning: Model could not be loaded initially. It will be downloaded on first request. Error: {e}")
    # Ultralytics will auto-download yolov10m.pt if not found
    model = YOLO("yolov10m.pt") 

@app.post("/api/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image")
    
    try:
        # Read the image file into memory
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Run YOLO inference
        results = model(image, conf=0.25)
        
        # Draw bounding boxes and convert to base64
        plotted_image_array = results[0].plot()  # numpy array (BGR)
        plotted_image_pil = Image.fromarray(plotted_image_array[..., ::-1])  # Convert BGR to RGB
        
        buffered = io.BytesIO()
        plotted_image_pil.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        base64_image = f"data:image/jpeg;base64,{img_str}"
        
        # Extract unique detected objects
        detected_objects = []
        for r in results:
            for box in r.boxes:
                label = r.names[int(box.cls)]
                detected_objects.append(label)
                
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
    return {"message": "YOLOv10 AI Service is running. Access /docs for the API interface."}
