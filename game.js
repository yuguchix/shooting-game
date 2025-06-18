function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // プレイヤーの初期位置もリセット（中央下）
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - 80;
}
window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bgImage = new Image();
bgImage.src = "background.png";

const explosionImage = new Image();
explosionImage.src = "explosion.png";

let bgY = 0;
let player = { x: 240, y: 560, width: 20, height: 20 };
let bullets = [];
let enemies = [];
let explosions = [];
let isGameOver = false;
let score = 0;


class Explosion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.frameSize = 64; // 1コマのサイズ
    this.totalFrames = 16;
    this.finished = false;
  }

  update() {
    this.frame++;
    if (this.frame >= this.totalFrames) {
      this.finished = true;
    }
  }

  draw(ctx) {
    const fx = (this.frame % 4) * this.frameSize;
    const fy = Math.floor(this.frame / 4) * this.frameSize;
    ctx.drawImage(
      explosionImage,
      fx, fy, this.frameSize, this.frameSize,
      this.x - this.frameSize / 2, this.y - this.frameSize / 2,
      this.frameSize, this.frameSize
    );
  }
}

document.addEventListener("keydown", (e) => {
  if (!isGameOver) {
    if (e.key === "ArrowLeft") player.x -= 10;
    if (e.key === "ArrowRight") player.x += 10;
    if (e.key === " ") {
      bullets.push({ x: player.x + 8, y: player.y });
    }
  } else {
    if (e.key.toLowerCase() === "r") {
      // ★ ゲームリスタート処理
      isGameOver = false;
      bullets = [];
      enemies = [];
      explosions = [];
      score = 0;
      player.x = canvas.width / 2 - player.width / 2;
      player.y = canvas.height - 80;
    }
  }
});

function spawnEnemy() {
  enemies.push({ x: Math.random() * 460, y: 0 });
}
setInterval(spawnEnemy, 1000);

function drawBackground() {
  ctx.drawImage(bgImage, 0, bgY, canvas.width, canvas.height);
  ctx.drawImage(bgImage, 0, bgY - canvas.height, canvas.width, canvas.height);
}

function update() {
  if (isGameOver) return; // ゲームオーバー時は更新停止


  bgY += 2;
  if (bgY >= canvas.height) bgY = 0;

  bullets.forEach(b => b.y -= 5);
  enemies.forEach(e => e.y += 2);
  explosions.forEach(ex => ex.update());

  // 当たり判定（弾 vs 敵）
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      const b = bullets[i], e = enemies[j];
      if (
        b.x < e.x + 20 && b.x + 4 > e.x &&
        b.y < e.y + 20 && b.y + 10 > e.y
      ) {
        explosions.push(new Explosion(e.x + 10, e.y + 10));
        bullets.splice(i, 1);
        enemies.splice(j, 1);
        score += 100;  // ★ スコア加算
        break;
      }
    }
  }

  // 敵とプレイヤーの当たり判定（ゲームオーバー）
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (
      player.x < e.x + 20 &&
      player.x + player.width > e.x &&
      player.y < e.y + 20 &&
      player.y + player.height > e.y
    ) {
      explosions.push(new Explosion(player.x + player.width / 2, player.y + player.height / 2));
      isGameOver = true;
      ctx.font = "24px sans-serif";
      ctx.fillStyle = "yellow";
      ctx.fillText(`SCORE: ${score}`, canvas.width / 2, canvas.height / 2 + 70);

      break;
    }
  }
  // 爆発が終了したら削除
  explosions = explosions.filter(ex => !ex.finished);
}

canvas.addEventListener("touchstart", handleTouch);
canvas.addEventListener("touchmove", handleTouch);

function handleTouch(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  player.x = x - player.width / 2;
}


setInterval(() => {
  if (!isGameOver) {
    bullets.push({ x: player.x + 8, y: player.y });
  }
}, 300); // 300ミリ秒ごとに自動発射

function handleTouch(e) {
  e.preventDefault(); // スクロールを防止
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width); // ← スケーリング補正
  player.x = x - player.width / 2;
}
canvas.addEventListener("touchstart", handleTouch, { passive: false });
canvas.addEventListener("touchmove", handleTouch, { passive: false });


function draw() {
  drawBackground();

  if (!isGameOver) {
    ctx.fillStyle = "lime";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  ctx.fillStyle = "red";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));

  ctx.fillStyle = "white";
  enemies.forEach(e => ctx.fillRect(e.x, e.y, 20, 20));

  explosions.forEach(ex => ex.draw(ctx));

  if (isGameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = "24px sans-serif";
    ctx.fillStyle = "white";
    ctx.fillText("[Ctr + R]キーで再スタート", canvas.width / 2, canvas.height / 2 + 30);

    ctx.fillStyle = "white";
    ctx.font = "20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${score}`, 10, 30);
  }
}


function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
  }

gameLoop();
