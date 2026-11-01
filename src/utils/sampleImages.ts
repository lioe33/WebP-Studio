/**
 * Procedural sample images generated via HTML5 Canvas
 * Provides zero-latency, hermetic test images without external HTTP dependencies
 */

export interface SampleImage {
  id: string;
  title: string;
  description: string;
  aspect: string;
  width: number;
  height: number;
  generate: () => string;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sunset-peaks',
    title: '雪峰日落 (高动态风光 2400×1350)',
    description: '16:9 横构图大图，测试大尺寸风景画质在 1612×801 下的精细度',
    aspect: '16:9',
    width: 2400,
    height: 1350,
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2400;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d')!;

      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, 1350);
      sky.addColorStop(0, '#0c1024');
      sky.addColorStop(0.35, '#1e1b4b');
      sky.addColorStop(0.65, '#b45309');
      sky.addColorStop(0.85, '#f59e0b');
      sky.addColorStop(1, '#fde68a');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 2400, 1350);

      // Glowing Sun
      const sunGrad = ctx.createRadialGradient(1200, 780, 20, 1200, 780, 280);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.3, '#fef08a');
      sunGrad.addColorStop(0.7, 'rgba(251, 146, 60, 0.4)');
      sunGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(1200, 780, 280, 0, Math.PI * 2);
      ctx.fill();

      // Distant mountain range
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(0, 950);
      ctx.lineTo(280, 720);
      ctx.lineTo(600, 840);
      ctx.lineTo(950, 680);
      ctx.lineTo(1350, 820);
      ctx.lineTo(1750, 690);
      ctx.lineTo(2100, 810);
      ctx.lineTo(2400, 740);
      ctx.lineTo(2400, 1350);
      ctx.lineTo(0, 1350);
      ctx.closePath();
      ctx.fill();

      // Midground mountain peaks with crisp edges
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, 1100);
      ctx.lineTo(350, 850);
      ctx.lineTo(750, 990);
      ctx.lineTo(1200, 790);
      ctx.lineTo(1650, 960);
      ctx.lineTo(2050, 840);
      ctx.lineTo(2400, 1020);
      ctx.lineTo(2400, 1350);
      ctx.lineTo(0, 1350);
      ctx.closePath();
      ctx.fill();

      // Water reflection
      const water = ctx.createLinearGradient(0, 1020, 0, 1350);
      water.addColorStop(0, '#090d16');
      water.addColorStop(0.5, '#1e293b');
      water.addColorStop(1, '#020617');
      ctx.fillStyle = water;
      ctx.fillRect(0, 1050, 2400, 300);

      // Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 120; i++) {
        const x = (i * 137.5) % 2400;
        const y = (i * 61.3) % 650;
        const r = (i % 3) * 0.8 + 0.6;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      return canvas.toDataURL('image/jpeg', 0.95);
    },
  },
  {
    id: 'bauhaus-poster',
    title: '几何波普艺术 (竖构图 1200×1800)',
    description: '2:3 竖图肖像比例，用于测试智能裁剪与留白填充的对比效果',
    aspect: '2:3',
    width: 1200,
    height: 1800,
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1800;
      const ctx = canvas.getContext('2d')!;

      // Off-white canvas
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 1200, 1800);

      // Deep bold arch
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(600, 700, 420, Math.PI, 0, false);
      ctx.lineTo(1020, 1400);
      ctx.lineTo(180, 1400);
      ctx.closePath();
      ctx.fill();

      // Vibrant terracotta sphere
      const sphereGrad = ctx.createRadialGradient(500, 620, 50, 600, 700, 280);
      sphereGrad.addColorStop(0, '#fdba74');
      sphereGrad.addColorStop(0.6, '#ea580c');
      sphereGrad.addColorStop(1, '#9a3412');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(600, 700, 260, 0, Math.PI * 2);
      ctx.fill();

      // Sage green diagonal block
      ctx.fillStyle = '#0d9488';
      ctx.beginPath();
      ctx.moveTo(180, 1200);
      ctx.lineTo(1020, 1000);
      ctx.lineTo(1020, 1140);
      ctx.lineTo(180, 1340);
      ctx.closePath();
      ctx.fill();

      // Sharp Cobalt triangle
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.moveTo(350, 400);
      ctx.lineTo(600, 180);
      ctx.lineTo(850, 400);
      ctx.closePath();
      ctx.fill();

      // Clean typography lines
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('STUDIO COMPOSITION № 08', 220, 1550);
      ctx.font = '22px sans-serif';
      ctx.fillText('1200 × 1800 PIXELS · ORIGINAL PORTRAIT RATIO', 220, 1610);

      return canvas.toDataURL('image/png');
    },
  },
  {
    id: 'cyber-blueprint',
    title: '数字微架构 (超精细矢量网格 1920×1080)',
    description: '富含高频细线与字符，验证无损 WebP 压缩对边缘与微结构的保留',
    aspect: '16:9',
    width: 1920,
    height: 1080,
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d')!;

      // Dark slate background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 1920, 1080);

      // Subtle isometric grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      const step = 48;
      for (let x = 0; x <= 1920; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1080);
        ctx.stroke();
      }
      for (let y = 0; y <= 1080; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1920, y);
        ctx.stroke();
      }

      // Tech circuit highlights
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(240, 240);
      ctx.lineTo(600, 240);
      ctx.lineTo(840, 480);
      ctx.lineTo(1400, 480);
      ctx.lineTo(1680, 760);
      ctx.stroke();

      // Glowing nodes
      const nodes = [
        [240, 240],
        [600, 240],
        [840, 480],
        [1400, 480],
        [1680, 760],
        [960, 540],
      ];
      nodes.forEach(([nx, ny]) => {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(nx, ny, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Central core
      const coreGrad = ctx.createRadialGradient(960, 540, 40, 960, 540, 180);
      coreGrad.addColorStop(0, 'rgba(14, 165, 233, 0.45)');
      coreGrad.addColorStop(0.8, 'rgba(14, 165, 233, 0.05)');
      coreGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(960, 540, 180, 0, Math.PI * 2);
      ctx.fill();

      // Monospace annotations
      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 24px monospace';
      ctx.fillText('TARGET BUFFER: 1612 × 801 WEBP LOSSLESS', 240, 180);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px monospace';
      ctx.fillText('HIGH-FREQUENCY PIXEL FIDELITY BENCHMARK', 240, 210);

      return canvas.toDataURL('image/png');
    },
  },
];
