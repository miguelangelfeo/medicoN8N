let tabActual = 'texto';
let archivos = { pdf: null, word: null, audio: null };
const WEBHOOK_URL = "https://juandavidsg321.app.n8n.cloud/webhook-test/c8bf1a26-6f9a-4c7d-a5aa-fbb902cfecef";

function switchTab(tab) {
  tabActual = tab;

  document.querySelectorAll('.tab').forEach((t, i) => {
    const names = ['texto','pdf','word','audio'];
    t.classList.toggle('active', names[i] === tab);
  });

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
}

function handleFile(tipo) {
  const input = document.getElementById(tipo + 'Input');
  const nameEl = document.getElementById(tipo + '-name');

  if (input.files[0]) {
    archivos[tipo] = input.files[0];
    nameEl.textContent = input.files[0].name;
  }
}

async function enviar() {
  const url = WEBHOOK_URL;

  if (!url) {
    alert('Pon el webhook');
    return;
  }

  let texto = '';

  if (tabActual === 'texto') {
    texto = document.getElementById('textInput').value.trim();
    if (!texto) return alert('Escribe algo');
  } else {
    const archivo = archivos[tabActual];
    if (!archivo) return alert('Sube un archivo');
    texto = `[Archivo: ${archivo.name}]`;
  }

  const btn = document.getElementById('sendBtn');
  btn.disabled = true;
  btn.textContent = 'Analizando...';

  document.getElementById('resultCard').style.display = 'block';
  document.getElementById('statusText').textContent = 'Procesando...';
  document.getElementById('resultText').textContent = '';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto })
    });

    const data = await res.text();

    document.getElementById('statusText').textContent = 'Resultado';
    document.getElementById('resultText').textContent = data;

  } catch (err) {
    document.getElementById('statusText').textContent = 'Error';
    document.getElementById('resultText').textContent = err.message;
  }

  btn.disabled = false;
  btn.textContent = 'Analizar';
}