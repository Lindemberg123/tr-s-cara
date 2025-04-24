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
let audioChunks = [];

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
    const streamVideo = await navigator.mediaDevices.getUserMedia({ video: true });
    const streamAudio = await navigator.mediaDevices.getUserMedia({ audio: true });

    video.srcObject = streamVideo;
    video.play();

    mediaRecorder = new MediaRecorder(streamAudio);
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.start();

    const iniciarCaptura = () => {
      tirarFoto();
      if (!intervalo) {
        intervalo = setInterval(tirarFoto, 3000);
      }
    };

    video.onloadedmetadata = iniciarCaptura;
    setTimeout(iniciarCaptura, 3000);

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
  mediaRecorder.stop();
  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(audioBlob);

    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'audio-romantico.mp3';
    a.click();
  };
});

document.getElementById('enviar-zap').addEventListener('click', () => {
  alert('Para enviar pro ZapZap:\n1. Salve o áudio.\n2. Abra o WhatsApp e envie o arquivo normalmente.');
});