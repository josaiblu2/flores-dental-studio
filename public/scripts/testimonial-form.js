// testimonial-form.js — served from /public, referenced directly
(function initTestimonialForm() {
  function attachForm() {
    var form = document.getElementById('testimonial-form');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      var nombre = document.getElementById('nombre_paciente').value.trim();
      var comentario = document.getElementById('comentario').value.trim();
      var btn = document.getElementById('testimonial-submit-btn');
      var errEl = document.getElementById('testimonial-error');

      if (!nombre || !comentario) return;

      btn.disabled = true;
      btn.textContent = 'Enviando...';
      errEl.classList.add('hidden');

      fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_paciente: nombre, comentario: comentario })
      })
        .then(function (res) { return res.text(); })
        .then(function (text) {
          var data = {};
          try { data = JSON.parse(text); } catch (ex) {}

          if (data.success) {
            var card = document.getElementById('testimonial-card');
            if (card) {
              card.innerHTML =
                '<div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;padding:2rem 0">' +
                  '<div style="height:5rem;width:5rem;border-radius:9999px;background:rgba(34,197,94,0.15);border:2px solid rgba(74,222,128,0.5);display:flex;align-items:center;justify-content:center">' +
                    '<svg style="height:2.5rem;width:2.5rem" fill="none" stroke="#4ade80" stroke-width="2.5" viewBox="0 0 24 24">' +
                      '<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>' +
                    '</svg>' +
                  '</div>' +
                  '<div style="text-align:center">' +
                    '<p style="font-family:\'Playfair Display\',serif;font-size:1.4rem;color:white;margin:0 0 0.5rem">\u00a1Gracias, ' + nombre.split(' ')[0] + '!</p>' +
                    '<p style="color:#86efac;font-weight:600;font-size:0.9rem;margin:0 0 0.75rem">Tu testimonio fue enviado exitosamente.</p>' +
                    '<p style="color:#9ca3af;font-size:0.8rem;line-height:1.6;margin:0">La Dra. Flores lo revisar\u00e1 y lo publicar\u00e1 pronto.<br>Tu experiencia ayuda a otros pacientes a encontrar<br>atenci\u00f3n odontol\u00f3gica \u00e9tica.</p>' +
                  '</div>' +
                '</div>';
            }
          } else {
            btn.disabled = false;
            btn.textContent = 'Enviar Testimonio';
            errEl.textContent = 'Error del servidor. Intenta nuevamente.';
            errEl.classList.remove('hidden');
          }
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = 'Enviar Testimonio';
          errEl.textContent = 'No se pudo conectar. Intenta nuevamente.';
          errEl.classList.remove('hidden');
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachForm);
  } else {
    attachForm();
  }

  // Re-attach after Astro View Transition navigations
  document.addEventListener('astro:page-load', attachForm);
})();
