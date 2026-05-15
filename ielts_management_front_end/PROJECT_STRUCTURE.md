# IELTS Management Front-end - Project Structure

## 📁 Cấu trúc Thư mục

```
ielts_management_front_end/
├── src/
│   ├── app/                    # App router pages (Next.js 13+)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # Reusable React components
│   │   ├── Button.tsx          # Button component
│   │   ├── Header.tsx          # Header component
│   │   └── ...
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hook
│   │   └── ...
│   │
│   ├── services/               # API services
│   │   ├── authService.ts      # Auth API calls
│   │   └── ...
│   │
│   ├── context/                # React Context providers
│   │   ├── AuthContext.tsx     # Auth context
│   │   └── ...
│   │
│   ├── utils/                  # Utility functions
│   │   ├── api.ts              # API client
│   │   ├── helpers.ts          # Helper functions
│   │   └── ...
│   │
│   ├── types/                  # TypeScript types & interfaces
│   │   └── index.ts            # Global types
│   │
│   ├── constants/              # Application constants
│   │   └── index.ts            # Global constants
│   │
│   └── styles/                 # Custom styles (if needed)
│
├── public/                     # Static files
├── .env.local                  # Environment variables (local)
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── eslint.config.mjs           # ESLint configuration
└── package.json                # Project dependencies
```

## 📖 Hướng dẫn từng Thư mục

### `src/app/` - Next.js App Router

- Chứa các routes và pages của ứng dụng
- Sử dụng File-based Routing
- `layout.tsx` là layout chung cho ứng dụng

### `src/components/` - React Components

- Các component tái sử dụng được
- Chia thành các subfolder nếu cần (e.g., `components/ui/`, `components/layout/`)
- Mỗi component nên có một file riêng

### `src/hooks/` - Custom Hooks

- Chứa các custom React hooks
- Dùng prefix `use` cho tên hook
- VD: `useAuth`, `usePagination`, `useForm`

### `src/services/` - API Services

- Chứa các hàm gọi API
- Chia theo modules (e.g., `authService.ts`, `userService.ts`)
- Mỗi service nên có một interface riêng cho request/response

### `src/context/` - React Context

- Chứa Context providers cho global state management
- VD: `AuthContext.tsx`, `ThemeContext.tsx`

### `src/utils/` - Utility Functions

- `api.ts` - API client class
- `helpers.ts` - Helper functions
- Các utility khác cần thiết

### `src/types/` - TypeScript Types

- Chứa tất cả global types, interfaces, enums
- Tổ chức theo modules nếu cần

### `src/constants/` - Constants

- Chứa các hằng số toàn cầu
- Routes, API endpoints, error messages, etc.

## 🚀 Cách Sử Dụng

### Import Path Alias

Sử dụng `@/` để import từ thư mục src:

```typescript
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { ROUTES } from "@/constants";
import type { User } from "@/types";
```

### Tạo Trang Mới

1. Tạo folder trong `src/app/`
2. Tạo file `page.tsx` trong folder đó
3. Export default React component

```typescript
// src/app/dashboard/page.tsx
export default function DashboardPage() {
  return <div>Dashboard</div>;
}
```

### Tạo Component Mới

1. Tạo file `.tsx` trong `src/components/`
2. Export component

```typescript
// src/components/Card.tsx
export const Card = ({ children }) => {
  return <div className="border rounded-lg p-4">{children}</div>;
};
```

### Tạo Service Mới

1. Tạo file `.ts` trong `src/services/`
2. Define TypeScript interfaces
3. Implement API calls

```typescript
// src/services/userService.ts
import { apiClient } from "@/utils/api";
import { User } from "@/types";

export const userService = {
  getUsers: () => apiClient.get<User[]>("/api/users"),
  getUserById: (id: string) => apiClient.get<User>(`/api/users/${id}`),
};
```

## 🛠️ Lệnh Chạy

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🔗 Kết Nối Backend

- Backend API URL được cấu hình trong `.env.local`
- Sử dụng variable `NEXT_PUBLIC_API_URL`
- Đã implement `ApiClient` trong `utils/api.ts`

```javascript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📝 Ghi Chú

- Sử dụng TypeScript cho type safety
- Tailwind CSS đã được cấu hình
- ESLint được setup sẵn
- Dùng `'use client'` cho client-side components
