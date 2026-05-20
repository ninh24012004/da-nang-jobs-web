import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    if (
        pathname.startsWith('/_next') || 
        pathname.includes('.') || 
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next()
    }

    const userCookie = request.cookies.get('user')?.value
    let user = null
    
    if (userCookie) {
        try {
            user = JSON.parse(decodeURIComponent(userCookie))
        } catch (e) {
        }
    }

    if (pathname.startsWith('/admin')) {
        if (pathname === '/admin/login') return NextResponse.next()
        if (user?.roleName !== 'ADMIN') {
            return NextResponse.redirect(new URL('/candidate/login', request.url))
        }
    }

    if (pathname.startsWith('/employer')) {
        if (pathname === '/employer/login') return NextResponse.next()
        if (user && user.roleName !== 'EMPLOYER') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    const protectedCandidatePaths = [
        '/candidate/profile',
        '/candidate/saved-jobs',
        '/candidate/applied-jobs',
        '/candidate/settings'
    ]

    if (protectedCandidatePaths.some(path => pathname.startsWith(path))) {
        if (user?.roleName !== 'CANDIDATE') {
            return NextResponse.redirect(new URL('/candidate/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*', 
        '/employer/:path*',
        '/candidate/:path*',
    ],
}
