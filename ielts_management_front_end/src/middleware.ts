import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_ROLE = 'admin';
const TEACHER_ROLE = 'teacher';
const verifyRoleAccess = async (request: NextRequest, roles: string[]): Promise<boolean> => {
  const token = request.cookies.get('authToken')?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const role = typeof payload?.role === 'string' ? payload.role : '';
    return roles.includes(role);
  } catch {
    return false;
  }
};

export const middleware = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  const requiresAdmin = pathname.startsWith('/admin');
  const requiresTeacher = pathname.startsWith('/teacher');

  const isAuthorized = requiresAdmin
    ? await verifyRoleAccess(request, [ADMIN_ROLE])
    : requiresTeacher
      ? await verifyRoleAccess(request, [TEACHER_ROLE, ADMIN_ROLE])
      : true;

  if (!isAuthorized) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*'],
};
