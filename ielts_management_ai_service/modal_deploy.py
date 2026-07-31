import modal

# 1. Định nghĩa môi trường chạy
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "fastapi",
        "uvicorn",
        "ultralytics",
        "python-multipart",
        "opencv-python-headless",
        "numpy"
    )
    # Cài thêm thư viện hệ thống cần thiết cho OpenCV
    .apt_install("libgl1-mesa-glx", "libglib2.0-0") 
    # Đưa toàn bộ thư mục hiện tại (chứa app.py và các file .pt) vào /root của container
    # Ignore các thư mục rác (venv, .git, pycache) để tránh upload hàng vạn file thừa
    .add_local_dir(".", remote_path="/root", ignore=["venv/**", ".venv/**", ".git/**", "__pycache__/**", "*.log"])
)

app = modal.App("ielts-ai-service")

# 2. Định nghĩa API và cấp phát GPU T4
@app.function(
    image=image, 
    gpu="T4",
    min_containers=0, # Cho phép scale về 0 khi không có request để tiết kiệm chi phí
)
@modal.asgi_app()
def fastapi_app():
    # Khai báo đường dẫn để Python tìm thấy file app.py
    import sys
    if "/root" not in sys.path:
        sys.path.insert(0, "/root")
    
    # Import biến `app` (chính là instance của FastAPI) từ file app.py hiện tại của bạn
    from app import app as web_app
    return web_app
