import { NextResponse } from 'next/server';

export async function GET() {
    const checks = {
        database: !!process.env.MONGODB_URI,
        nextauth: !!process.env.NEXTAUTH_SECRET,
        nextauthUrl: !!process.env.NEXTAUTH_URL,
        gemini: !!process.env.GEMINI_API_KEY,
        resend: !!process.env.RESEND_API_KEY,
        googleOAuth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        githubOAuth: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    };

    const allRequired = checks.database && checks.nextauth;

    return NextResponse.json({
        status: allRequired ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        checks,
    }, { status: allRequired ? 200 : 200 });
}
