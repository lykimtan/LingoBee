# IELTS Management Backend

Backend server cho dự án quản lý IELTS sử dụng Express.js và MongoDB.

## Cấu Trúc Thư Mục

```
ielts_management_back_end/
├── src/
│   ├── config/              # Cấu hình ứng dụng
│   │   ├── database.js      # Kết nối MongoDB
│   │   └── constants.js     # Các hằng số toàn cục
│   ├── controllers/         # Xử lý logic request/response
│   ├── routes/              # Định tuyến API endpoints
│   ├── middleware/          # Middleware (xác thực, xử lý lỗi, v.v.)
│   │   └── errorHandler.js
│   ├── models/              # Database schemas/models
│   ├── services/            # Business logic, quản lý dữ liệu
│   └── utils/               # Các hàm tiện ích
│       └── logger.js
├── server.js                # Entry point của ứng dụng
├── .env.example             # Template cho biến môi trường
├── .gitignore               # Git ignore rules
└── package.json
```

## Cài Đặt

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Tạo file `.env` từ template:

```bash
cp .env.example .env
```

Chỉnh sửa `.env` với các giá trị của bạn:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ielts_management
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d
```

### 3. Chạy Server

**Development (với auto-reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

## Cấu Trúc Thư Mục Chi Tiết

### `/src/config`

- `database.js`: Kết nối MongoDB, export hàm `connectDB()` và `getDB()`
- `constants.js`: Defines các hằng số như HTTP status codes, environments

### `/src/controllers`

Xử lý logic để các route requests

```javascript
// Ví dụ: userController.js
const getUserById = async (req, res) => {
  try {
    // Logic xử lý
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### `/src/routes`

Định tuyến API endpoints

```javascript
// Ví dụ: userRoutes.js
const router = require("express").Router();
const userController = require("../controllers/userController");

router.get("/:id", userController.getUserById);
```

### `/src/middleware`

- `errorHandler.js`: Xử lý lỗi toàn cục

### `/src/models`

MongoDB schemas/models

```javascript
// Ví dụ: User.js
const userSchema = {
  name: String,
  email: String,
  createdAt: Date,
};
```

### `/src/services`

Business logic, repository pattern cho truy vấn database

```javascript
// Ví dụ: userService.js
const getUser = async (userId) => {
  const db = require("../config/database").getDB();
  return db.collection("users").findOne({ _id: userId });
};
```

### `/src/utils`

Hàm tiện ích, helpers

- `logger.js`: Logging function với info, error, warn, debug

## API Endpoints

### Health Check

```
GET /api/health
```

## Flow Tổng Quan

```
Request → Routes → Controllers → Services → Database
   ↓                                           ↓
Response ← Middleware (Error Handler) ← Database Result
```

## Best Practices

1. **Separation of Concerns**: Logic được phân chia thành controllers, services, models
2. **Error Handling**: Sử dụng errorHandler middleware để xử lý lỗi tập trung
3. **Environment Variables**: Sử dụng `.env` cho các giá trị nhạy cảm
4. **Logging**: Sử dụng logger utility cho debugging
5. **Validation**: Validate dữ liệu ở controller level trước khi xử lý

## Tiếp Theo

1. Tạo models cho các entity (User, Course, Test, v.v.)
2. Tạo services cho business logic
3. Tạo controllers để xử lý requests
4. Tạo routes để định tuyến API
5. Thêm authentication middleware (JWT)
6. Thêm validation middleware (Joi, Ajv, v.v.)
7. Thêm unit tests

## Công Nghệ Sử Dụng

- **Express.js**: Web framework cho Node.js
- **MongoDB**: NoSQL database
- **Nodemon**: Auto-reload server khi thay đổi code
- **dotenv**: Load environment variables từ .env file
- **CORS**: Cross-Origin Resource Sharing
- **Body-parser**: Parse request body
