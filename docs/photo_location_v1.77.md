Instrucciones para Antigravity (v1.77)
Tarea: Integración final de la imagen de marca y la sección de ubicación.

1. Actualización de Imagen (AboutFounder.astro)
Acción: Reemplaza el marcador de posición de la imagen de la fundadora por la ruta: /images/dra-flores-avatar.png.

Importante: Asegúrate de que la imagen sea responsiva y mantenga el estilo visual de alta gama del resto del sitio.

2. Creación de Sección de Mapa (Location.astro)
Acción: Crea un nuevo componente src/components/Location.astro e intégralo en index.astro antes del formulario de contacto.

Código del Mapa: Utiliza el siguiente bloque corregido (he ajustado el ancho al 100% para que sea responsivo):

HTML
<section id="ubicacion" class="py-20 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="font-serif text-4xl text-navy mb-4">Nuestra Ubicación</h2>
    <p class="font-sans text-gray-600 mb-12">Lo esperamos en Las Américas, Ecatepec, para brindarle atención dental de excelencia.</p>
    
    <div class="rounded-sm overflow-hidden shadow-lg border border-gray-200">
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15038.56306352945!2d-99.0183000!3d19.6133000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDM2JzQ3LjkiTiA5OcKwMDEnMDUuOSJX!5e0!3m2!1ses-419!2smx!4v1712790000000!5m2!1ses-419!2smx" 
        width="100%" 
        height="450" 
        style="border:0;" 
        allowfullscreen="" 
        loading="lazy" 
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>
    </div>
  </div>
</section>