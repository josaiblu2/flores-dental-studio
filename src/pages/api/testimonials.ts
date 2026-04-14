import fs from 'node:fs/promises';
import path from 'node:path';
import type { APIRoute } from 'astro';

export const prerender = false;
const dataPath = path.join(process.cwd(), 'data/testimonials.json');

// --- SUBMISSION HANDLER ---
export const POST: APIRoute = async ({ request }) => {
  try {
    // Accept both JSON and FormData
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

    const rawData = await fs.readFile(dataPath, 'utf-8');
    const testimonials = JSON.parse(rawData);
    
    testimonials.push({
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      nombre_paciente: nombre,
      comentario,
      is_published: false
    });

    await fs.writeFile(dataPath, JSON.stringify(testimonials, null, 2));

    // --- EMAIL ALERT (RESEND) ---
    const RESEND_KEY = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    
    if (RESEND_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Flores Dental Studio <onboarding@resend.dev>',
            to: 'josaiblu2@yahoo.com.mx',
            subject: '🔔 Nuevo testimonio pendiente de aprobación',
            html: `
              <h2>Hola Dra. Flores,</h2>
              <p>Tiene un nuevo testimonio pendiente de revisión en su panel de administración.</p>
              <hr />
              <p><strong>Paciente:</strong> ${nombre}</p>
              <p><strong>Comentario:</strong> "${comentario}"</p>
              <hr />
              <p><a href="${request.url.replace('/api/testimonials', '/admin/moderacion')}">Ir al Panel de Moderación</a></p>
            `
          }),
        });
      } catch (e) {
        console.error("Error sending email alert:", e);
      }
    }

    // Return JSON success — client JS handles navigation
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
export const PATCH: APIRoute = async ({ request }) => {
  try {
    const { id, action } = await request.json();
    const rawData = await fs.readFile(dataPath, 'utf-8');
    let testimonials = JSON.parse(rawData);
    
    if (action === 'approve') {
      testimonials = testimonials.map((t: any) => t.id === id ? { ...t, is_published: true } : t);
    } else if (action === 'archive') {
      testimonials = testimonials.filter((t: any) => t.id !== id);
    }

    await fs.writeFile(dataPath, JSON.stringify(testimonials, null, 2));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/testimonials:", error);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
};
