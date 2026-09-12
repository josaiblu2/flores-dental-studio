# Control de Versiones: Notificaciones de Formulario y Captura en Netlify Forms (v1.83)

**Archivo:** `docs/formulario_notificaciones_v1.83.md`  
**Fecha:** 12 de Septiembre de 2026  
**Componente:** `src/components/ContactForm.astro`  
**Recursos Relacionados:** `public/__forms.html`, `public/_redirects`, `astro.config.mjs`  
**Destinatario de Notificaciones:** `josaiblu2@yahoo.com.mx`  
**Estado:** Implementado, desplegado y validado en producción.

---

## 1. Antecedentes y Causa Raíz del Problema

### El Síntoma
El portal web no entregaba notificaciones al correo electrónico cuando un posible paciente llenaba y enviaba el formulario de contacto en la página principal (`#contacto`), a pesar de que la regla de notificación por correo en el panel de Netlify (**Site configuration > Notifications > Form submission notifications**) ya estaba configurada hacia `josaiblu2@yahoo.com.mx`.

### La Causa Técnica
1. **Conflicto entre Astro SSR y Netlify Forms:**  
   El proyecto utiliza Astro en modo Server-Side Rendering (`output: 'server'`) con el adaptador `@astrojs/netlify`. En `public/_redirects` existe la regla:
   ```text
   /*  /.netlify/functions/ssr  200
   ```
2. **Desvío del POST:**  
   El formulario en `src/components/ContactForm.astro` tenía configurado el atributo `action="/gracias/"`.  
   Al enviar el formulario, el navegador realizaba un `POST /gracias/`. Debido a la regla de redirección total hacia la función SSR, Netlify enrutaba la petición directamente a la función de Astro SSR sin que el bot de formularios de Netlify pudiera interceptarla a nivel CDN.  
   Como resultado:
   - La página `/gracias/` cargaba aparentemente con éxito.
   - Pero Netlify Forms **nunca recibía el envío ni lo registraba en el panel**.
   - Por ende, **jamás se disparaba la notificación por correo**.
3. **Parámetro Ocioso Eliminado:**  
   Existía en el HTML un campo `<input type="hidden" name="to" value="alanflco@yahoo.com.mx" />`. Netlify Forms ignora totalmente este campo, ya que los destinatarios solo se configuran en el panel de Netlify.

---

## 2. Solución Implementada (v1.83)

Se modificó `src/components/ContactForm.astro` aplicando los siguientes cambios arquitectónicos:

1. **Ruta hacia el Formulario Sombra:**  
   Se cambió el atributo `action` hacia `/__forms.html`.  
   `public/__forms.html` es el archivo estático detectado y post-procesado por Netlify durante el build. Al recibir peticiones en esa ruta estática, el CDN de Netlify Forms procesa la sumisión antes de cualquier regla de funciones dinámicas.
2. **Envío Asíncrono (AJAX / Fetch) con Fallback:**  
   Se implementó un script que intercepta el evento `submit`:
   - Deshabilita el botón de envío y cambia el texto a `"Enviando mensaje..."` para prevenir clics repetidos.
   - Empaqueta los campos del formulario con `URLSearchParams` y los envía vía `POST` con encabezado `application/x-www-form-urlencoded` hacia `/__forms.html`.
   - Al recibir la confirmación `200 OK` de Netlify Forms, redirige al usuario a la página de agradecimiento (`/gracias/`).
   - En caso de falla de red, reactiva el botón y muestra un mensaje de error claro en pantalla (`#form-error-msg`).
3. **Soporte para Astro View Transitions:**  
   El script se inicializa tanto en la carga inicial como en el evento `astro:page-load`.

---

## 3. Validación en Producción (Checklist)

- [x] **Prueba HTTP Directa:** Petición a `https://floresdentalstudio.work/__forms.html` respondió `200 OK`.
- [x] **Recepción en Bandeja:** Confirmada la llegada de los correos de prueba a `josaiblu2@yahoo.com.mx`.
- [x] **Despliegue de Producción:** Commit `46f545b` subido a GitHub y desplegado en Netlify.
- [x] **Prueba E2E en Navegador Real:** Simulación de paciente en `https://floresdentalstudio.work/#contacto`:
  - Llenado de todos los campos obligatorios y aceptación del Aviso de Privacidad.
  - Clic en *"Enviar Mensaje"*.
  - Transición fluida y confirmación en pantalla en `/gracias/`.
