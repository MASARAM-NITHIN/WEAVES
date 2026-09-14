import { NextResponse } from 'next/server';

// Server-to-server backend address (runtime env; works on localhost and Replit).
const BACKEND_BASE = (process.env.BACKEND_INTERNAL_URL || 'http://localhost:8080').replace(/\/$/, '');

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');

    const fetchCount = async (endpoint) => {
      try {
        const headers = authHeader ? { 'Authorization': authHeader } : {};
        // Add ?size=1 to heavily optimize any paginated Spring Boot endpoints to avoid N+1 DB latency
        const separator = endpoint.includes('?') ? '&' : '?';
        const res = await fetch(`${BACKEND_BASE}/api${endpoint}${separator}size=1`, { headers });
        if (!res.ok) return 0;
        const data = await res.json();
        
        // If it's a Spring Page object, read the exact total elements instantly!
        if (data && typeof data.totalElements === 'number') {
          return data.totalElements;
        }
        
        // Fallback for raw arrays
        const arr = data.content || data.data || data;
        return Array.isArray(arr) ? arr.length : 0;
      } catch (e) {
        return 0;
      }
    };

    const [sarees, themes, categories, orders, queries, reviews] = await Promise.all([
      fetchCount('/sarees'),
      fetchCount('/collections'),
      fetchCount('/fabric-types'),
      fetchCount('/admin/orders'),
      fetchCount('/admin/enquiries'),
      fetchCount('/reviews/all')
    ]);

    return NextResponse.json({
      success: true,
      data: { sarees, themes, categories, orders, queries, reviews }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
