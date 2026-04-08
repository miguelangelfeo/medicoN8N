// ===========================
//  MedAI — Lógica principal
// ===========================

// URL del webhook de n8n
// IMPORTANTE: usa la URL de producción (sin "-test") cuando el flujo esté activo
const WEBHOOK_URL = "https://juandavidsg321.app.n8n.cloud/webhook/c8bf1a26-6f9a-4c7d-a5aa-fbb902cfecef";

let tabActual = 'texto';
let archivos = {};

// Cambia la pestaña activa
function switchTab(tab, btn) {
  tabActual = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
}

// Guarda el archivo seleccionado y muestra su nombre
function handleFile(tipo, input) {
  if (input.files[0]) {
    archivos[tipo] = input.files[0];
    const el = document.getElementById(tipo + '-name');
    el.textContent = '📎 ' + input.files[0].name;
    el.style.display = 'block';
  }
}

// Envía los datos al webhook
async function enviar() {
  const btn       = document.getElementById('sendBtn');
  const resultWrap = document.getElementById('resultWrap');
  const resultDot  = document.getElementById('resultDot');
  const resultLabel = document.getElementById('resultLabel');
  const resultBody  = document.getElementById('resultBody');

  let body, headers;

  if (tabActual === 'texto') {
    // Entrada de texto: se envía como JSON
    const texto = document.getElementById('textInput').value.trim();
    if (!texto) {
      alert('Por favor escribe algunos valores antes de analizar.');
      return;
    }
    body = JSON.stringify({ texto });
    headers = { 'Content-Type': 'application/json' };

  } else {
    // Entrada de archivo: se envía como FormData (binario)
    const archivo = archivos[tabActual];
    if (!archivo) {
      alert('Por favor sube un archivo antes de continuar.');
      return;
    }
    const fd = new FormData();
    fd.append('file', archivo);
    fd.append('tipo', tabActual); // 'pdf', 'word' o 'audio'
    body = fd;
    headers = {}; // FormData no necesita Content-Type manual
  }

  // Estado: cargando
  btn.disabled = true;
  document.getElementById('btnIcon').textContent = '⏳';
  document.getElementById('btnText').textContent = 'Analizando...';

  resultWrap.style.display = 'block';
  resultDot.className = 'result-dot loading';
  resultLabel.textContent = 'Procesando tu examen...';
  resultBody.textContent = '';

  try {
    const res = await fetch(WEBHOOK_URL, { method: 'POST', headers, body });

    if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);

    const data = await res.text();

    resultDot.className = 'result-dot done';
    resultLabel.textContent = 'Resultado de tu análisis';
    resultBody.textContent = data;

  } catch (err) {
    resultDot.className = 'result-dot error';
    resultLabel.textContent = 'Ocurrió un error';
    resultBody.textContent = 'No se pudo conectar con el servidor. Verifica que el flujo de n8n esté activo.\n\nDetalle: ' + err.message;
  }

  // Restaurar botón
  btn.disabled = false;
  document.getElementById('btnIcon').textContent = '🔍';
  document.getElementById('btnText').textContent = 'Analizar resultados';
}