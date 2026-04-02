import fs from 'node:fs/promises';
import path from 'node:path';
import type { APIRoute } from 'astro';

export const prerender = false;
const dataPath = path.join(process.cwd(), 'src/data/testimonials.json');

export const POST: APIRoute = async ({ request, redirect }) => {
  const data = await request.formData();
  const nombre = data.get('nombre_paciente') as string;
  const comentario = data.get('comentario') as string;

  if (!nombre || !comentario) return new Response("Missing fields", { status: 400 });

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

  // Return to homepage with a query param for success flash message
  return redirect('/?testimonial=submitted');
};

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
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
};
