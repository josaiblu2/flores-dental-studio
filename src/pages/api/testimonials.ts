import fs from 'node:fs/promises';
import path from 'node:path';
import type { APIRoute } from 'astro';
import { getAdminConfig, isAdmin } from '../../lib/adminAuth';

export const prerender = false;

// Helpers for persistence
const getTestimonialsStore = async () => {
  const { getStore } = await import('@netlify/blobs');
  return getStore({ name: 'testimonials' });
};

async function getStoredTestimonials() {
  const store = await getTestimonialsStore();
  let list = await store.get('all', { type: 'json' }) as any[];
  
  // Migration / Initialization
  if (!list) {
    try {
      const dataPath = path.join(process.cwd(), 'data/testimonials.json');
      const rawData = await fs.readFile(dataPath, 'utf-8');
      list = JSON.parse(rawData);
      // Seed the blob store with initial data
      await store.setJSON('all', list);
    } catch (e) {
      list = [];
    }
  }
  return list;
}

// --- SUBMISSION HANDLER ---
export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    let nombre: string;
    let comentario: string;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      nombre = body.nombre_paciente;
      comentario = body.comentario;
    } else {
      const data = await request.formData();
      nombre = data.get('nombre_paciente') as string;
      comentario = data.get('comentario') as string;
    }

    if (!nombre || !comentario) {
      return new Response(JSON.stringify({ success: false, error: 'Missing fields' }), { status: 400 });
    }

    const testimonials = await getStoredTestimonials();
    
    testimonials.push({
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      nombre_paciente: nombre,
      comentario,
      is_published: false
    });

    const store = await getTestimonialsStore();
    await store.setJSON('all', testimonials);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in POST /api/testimonials:", error);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
};

// --- MODERATION HANDLER ---
const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const PATCH: APIRoute = async ({ request, cookies }) => {
  if (!getAdminConfig()) {
    return json({ success: false, error: 'Admin panel not configured' }, 503);
  }
  if (!isAdmin(cookies)) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const { id, action } = await request.json();
    if (typeof id !== 'string' || !id || (action !== 'approve' && action !== 'archive')) {
      return json({ success: false, error: 'Invalid request' }, 400);
    }

    let testimonials = await getStoredTestimonials();
    
    if (action === 'approve') {
      testimonials = testimonials.map((t: any) => t.id === id ? { ...t, is_published: true } : t);
    } else {
      testimonials = testimonials.filter((t: any) => t.id !== id);
    }

    const store = await getTestimonialsStore();
    await store.setJSON('all', testimonials);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/testimonials:", error);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
};
