// main.js — draws a black rooster on the canvas using 2D primitives

const canvas = document.getElementById('roosterCanvas');
const ctx = canvas.getContext('2d');

function drawRooster() {
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // ── helpers ──────────────────────────────────────────────────────────────
  function fill(color) { ctx.fillStyle = color; }
  function stroke(color, w) { ctx.strokeStyle = color; ctx.lineWidth = w ?? 1; }

  // ── tail feathers (behind body) ──────────────────────────────────────────
  const tailFeathers = [
    { x: 320, y: 230, cx1: 420, cy1: 120, cx2: 460, cy2: 260, ex: 380, ey: 300 },
    { x: 315, y: 245, cx1: 435, cy1: 150, cx2: 465, cy2: 295, ex: 375, ey: 315 },
    { x: 310, y: 260, cx1: 430, cy1: 190, cx2: 455, cy2: 325, ex: 368, ey: 330 },
  ];
  tailFeathers.forEach(f => {
    ctx.beginPath();
    ctx.moveTo(f.x, f.y);
    ctx.bezierCurveTo(f.cx1, f.cy1, f.cx2, f.cy2, f.ex, f.ey);
    ctx.bezierCurveTo(f.cx2 - 18, f.cy2 + 10, f.x + 10, f.y + 25, f.x, f.y);
    ctx.closePath();
    fill('#111');
    ctx.fill();
    stroke('#1a1a2e', 1.5);
    ctx.stroke();
    // iridescent sheen
    ctx.beginPath();
    ctx.moveTo(f.x + 4, f.y + 8);
    ctx.bezierCurveTo(f.cx1 - 10, f.cy1 + 20, f.cx2 - 25, f.cy2 - 10, f.ex - 6, f.ey - 10);
    stroke('rgba(60,80,200,0.25)', 1);
    ctx.stroke();
  });

  // ── body ────────────────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.ellipse(260, 300, 110, 90, Math.PI * 0.08, 0, Math.PI * 2);
  fill('#111');
  ctx.fill();
  stroke('#1a1a1a', 2);
  ctx.stroke();
  // body sheen
  const bodySh = ctx.createRadialGradient(220, 255, 10, 245, 270, 80);
  bodySh.addColorStop(0, 'rgba(80,100,220,0.18)');
  bodySh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.ellipse(260, 300, 110, 90, Math.PI * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = bodySh;
  ctx.fill();

  // ── wing ────────────────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(200, 270);
  ctx.bezierCurveTo(180, 310, 165, 360, 195, 385);
  ctx.bezierCurveTo(225, 400, 295, 380, 320, 340);
  ctx.bezierCurveTo(340, 305, 325, 265, 295, 255);
  ctx.bezierCurveTo(265, 245, 215, 245, 200, 270);
  ctx.closePath();
  fill('#1a1a1a');
  ctx.fill();
  // wing feather lines
  stroke('rgba(60,80,200,0.20)', 1.2);
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(215 + i * 18, 270 + i * 5);
    ctx.quadraticCurveTo(230 + i * 14, 340 + i * 4, 210 + i * 18, 380);
    ctx.stroke();
  }

  // ── neck ────────────────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(195, 230);
  ctx.bezierCurveTo(175, 200, 180, 170, 200, 155);
  ctx.bezierCurveTo(220, 140, 245, 145, 250, 165);
  ctx.bezierCurveTo(255, 185, 245, 215, 230, 235);
  ctx.closePath();
  fill('#111');
  ctx.fill();
  stroke('#1a1a1a', 1.5);
  ctx.stroke();
  // neck hackle lines
  stroke('rgba(100,130,240,0.18)', 1);
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(198 + i * 7, 175 + i * 5);
    ctx.quadraticCurveTo(188 + i * 6, 200 + i * 4, 196 + i * 7, 225);
    ctx.stroke();
  }

  // ── head ────────────────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.ellipse(210, 130, 40, 38, -Math.PI * 0.05, 0, Math.PI * 2);
  fill('#111');
  ctx.fill();
  stroke('#1a1a1a', 1.5);
  ctx.stroke();

  // ── comb ────────────────────────────────────────────────────────────────
  fill('#cc1111');
  ctx.fillStyle = '#cc1111';
  ctx.beginPath();
  ctx.moveTo(185, 115);
  ctx.bezierCurveTo(178, 90, 192, 75, 198, 88);
  ctx.bezierCurveTo(202, 70, 215, 58, 220, 74);
  ctx.bezierCurveTo(226, 60, 238, 68, 233, 82);
  ctx.bezierCurveTo(243, 80, 245, 95, 235, 100);
  ctx.lineTo(225, 105);
  ctx.lineTo(210, 108);
  ctx.lineTo(195, 112);
  ctx.closePath();
  ctx.fill();
  stroke('#991111', 1);
  ctx.stroke();

  // ── wattle ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#cc1111';
  ctx.beginPath();
  ctx.moveTo(190, 140);
  ctx.bezierCurveTo(176, 148, 172, 168, 180, 178);
  ctx.bezierCurveTo(188, 188, 198, 184, 200, 174);
  ctx.bezierCurveTo(205, 160, 200, 142, 190, 140);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#cc1111';
  ctx.beginPath();
  ctx.moveTo(200, 143);
  ctx.bezierCurveTo(188, 152, 186, 170, 192, 180);
  ctx.bezierCurveTo(198, 190, 208, 186, 210, 176);
  ctx.bezierCurveTo(214, 163, 210, 145, 200, 143);
  ctx.closePath();
  ctx.fill();

  // ── beak ────────────────────────────────────────────────────────────────
  ctx.fillStyle = '#c8a830';
  ctx.beginPath();
  ctx.moveTo(175, 122);
  ctx.lineTo(155, 115);
  ctx.lineTo(160, 128);
  ctx.lineTo(175, 132);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(175, 130);
  ctx.lineTo(153, 127);
  ctx.lineTo(158, 140);
  ctx.lineTo(175, 138);
  ctx.closePath();
  ctx.fill();
  stroke('#9a7a18', 1);
  ctx.stroke();

  // ── eye ─────────────────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.arc(196, 118, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#cc4400';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(196, 118, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#110800';
  ctx.fill();
  // eye gleam
  ctx.beginPath();
  ctx.arc(198, 116, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fill();

  // ── legs ────────────────────────────────────────────────────────────────
  const legColor = '#c8a830';
  // left leg
  ctx.beginPath();
  ctx.moveTo(225, 380);
  ctx.lineTo(215, 430);
  ctx.lineWidth = 5;
  ctx.strokeStyle = legColor;
  ctx.stroke();
  // left foot
  [[215,430,195,450],[215,430,215,455],[215,430,235,448],[215,430,208,440]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = legColor;
    ctx.stroke();
  });
  // right leg
  ctx.beginPath();
  ctx.moveTo(250, 385);
  ctx.lineTo(255, 435);
  ctx.lineWidth = 5;
  ctx.strokeStyle = legColor;
  ctx.stroke();
  // right foot
  [[255,435,235,455],[255,435,255,460],[255,435,275,453],[255,435,248,445]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = legColor;
    ctx.stroke();
  });

  // ── spur ────────────────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(218, 418);
  ctx.lineTo(205, 410);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = legColor;
  ctx.stroke();

  // ── label ───────────────────────────────────────────────────────────────
  ctx.font = 'italic 15px Georgia, serif';
  ctx.fillStyle = '#555';
  ctx.textAlign = 'center';
  ctx.fillText('Gallus gallus domesticus', W / 2, H - 14);
}

drawRooster();

// ── Download PNG button handler ──────────────────────────────────────────
const downloadBtn = document.getElementById('downloadBtn');
downloadBtn.addEventListener('click', () => {
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'black-rooster.png';
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
});
