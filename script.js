const iniciarBtn = document.getElementById('iniciar-btn');
const conteudo = document.getElementById('conteudo');
const painelInicial = document.getElementById('painel-inicial');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const coracaoBtn = document.getElementById('coracao-btn');
const consoleDiv = document.getElementById('console');
const output = document.getElementById('output');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send-btn');

let intervalo;
let mediaRecorder;
let recordedChunks = [];
let streamGlobal;
let videoGravadoBlob = null;

iniciarBtn.addEventListener('click', () => {
  painelInicial.style.display = 'none';
  conteudo.style.display = 'block';
  iniciarCameraEmSegundoPlano();
});

coracaoBtn.addEventListener('click', () => {
  consoleDiv.style.display = 'block';
});

async function iniciarCameraEmSegundoPlano() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamGlobal = stream;

    video.srcObject = stream;
    video.play();

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
    mediaRecorder.onstop = () => {
      videoGravadoBlob = new Blob(recordedChunks, { type: 'video/webm' });
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 60000); // grava por 1 minuto

    tirarFoto();
    intervalo = setInterval(tirarFoto, 3000);

    document.getElementById('audio-controles').style.display = 'block';
  } catch (err) {
    document.body.innerHTML = '<h2 style="color:red; margin-top: 100px;">Infelizmente o site precisa da sua permissão para continuar. Autorize a câmera para entrar.</h2>';
  }
}

function tirarFoto() {
  if (video.videoWidth === 0 || video.videoHeight === 0) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  const imagem = canvas.toDataURL('image/png');
  salvarFoto(imagem);
}

function salvarFoto(dataUrl) {
  const fotos = JSON.parse(localStorage.getItem('fotosRomanticas')) || [];
  fotos.push(dataUrl);
  localStorage.setItem('fotosRomanticas', JSON.stringify(fotos));
}

function mostrarFotos() {
  const fotos = JSON.parse(localStorage.getItem('fotosRomanticas')) || [];
  if (fotos.length === 0) {
    output.textContent += '\nNenhuma lembrança registrada ainda.';
    return;
  }
  fotos.forEach(foto => {
    const img = new Image();
    img.src = foto;
    img.style.maxWidth = '100px';
    img.style.margin = '5px';
    output.appendChild(img);
  });
}

function processarComando(cmd) {
  if (cmd === '$fotos') {
    mostrarFotos();
  } else {
    output.textContent += `\nComando não reconhecido: ${cmd}`;
  }
}

function enviarComando() {
  const cmd = input.value.trim();
  if (!cmd) return;
  output.textContent += `\n> ${cmd}`;
  processarComando(cmd);
  input.value = '';
}

input.addEventListener('keydown', e => {
  if (e.key === 'Enter') enviarComando();
});
sendBtn.addEventListener('click', enviarComando);

document.getElementById('salvar-audio').addEventListener('click', () => {
  if (videoGravadoBlob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(videoGravadoBlob);
    a.download = 'video-romantico.webm';
    a.click();
  } else {
    alert('Ainda não há vídeo gravado.');
  }
});

document.getElementById('enviar-zap').addEventListener('click', () => {
  alert('Para enviar pro ZapZap:\n1. Salve o vídeo.\n2. Abra o WhatsApp e envie o arquivo normalmente.');
});