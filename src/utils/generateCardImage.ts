// Manually generate card image using Canvas API
// This avoids html2canvas issues with SVG images

const ORNAMENT_POSITIONS = [
    { x: 150, y: 70 }, { x: 90, y: 320 }, { x: 210, y: 320 }, { x: 190, y: 140 }, { x: 110, y: 140 },
    { x: 150, y: 250 }, { x: 135, y: 90 }, { x: 165, y: 90 }, { x: 125, y: 110 }, { x: 175, y: 110 },
    { x: 150, y: 110 }, { x: 130, y: 160 }, { x: 170, y: 160 }, { x: 100, y: 180 }, { x: 200, y: 180 },
    { x: 120, y: 190 }, { x: 180, y: 190 }, { x: 150, y: 170 }, { x: 90, y: 200 }, { x: 210, y: 200 },
    { x: 110, y: 230 }, { x: 190, y: 230 }, { x: 80, y: 240 }, { x: 220, y: 240 }, { x: 130, y: 260 },
    { x: 170, y: 260 }, { x: 100, y: 270 }, { x: 200, y: 270 }, { x: 120, y: 290 }, { x: 180, y: 290 },
    { x: 70, y: 300 }, { x: 230, y: 300 }, { x: 140, y: 310 }, { x: 160, y: 310 },
];

export async function generateCardImage(ornaments: string[], treeName: string): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Set canvas size
    canvas.width = 530;
    canvas.height = 700;

    // Draw candy cane border
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw white diagonal stripes
    ctx.fillStyle = 'white';
    for (let i = -10; i < 30; i++) {
        ctx.save();
        ctx.translate(i * 40, -150);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(0, 0, 25, 800);
        ctx.restore();
    }

    // Draw inner background
    ctx.fillStyle = '#0a192f';
    ctx.fillRect(60, 60, 410, 580);

    // Draw snowflakes
    ctx.fillStyle = 'white';
    for (let i = 0; i < 60; i++) {
        const x = 60 + ((i * 1.67) % 100) * 4.1;
        const y = 60 + ((i * 13.3) % 100) * 5.8;
        const size = i % 3 === 0 ? 3 : 2;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw glow
    const gradient = ctx.createRadialGradient(265, 280, 0, 265, 280, 160);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    gradient.addColorStop(0.7, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(105, 120, 320, 320);

    // Load and draw tree SVG
    const svgData = `
        <svg viewBox="0 0 300 410" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="treeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#43a047" />
              <stop offset="100%" stop-color="#1b5e20" />
            </linearGradient>
            <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#795548" />
              <stop offset="100%" stop-color="#5d4037" />
            </linearGradient>
          </defs>
          <rect x="120" y="280" width="60" height="120" fill="url(#trunkGrad)" rx="5" />
          <path d="M50 320 L250 320 L150 180 Z" fill="url(#treeGrad)" stroke="url(#treeGrad)" stroke-width="25" stroke-linejoin="round" />
          <path d="M75 230 L225 230 L150 110 Z" fill="url(#treeGrad)" stroke="url(#treeGrad)" stroke-width="25" stroke-linejoin="round" />
          <path d="M100 140 L200 140 L150 75 Z" fill="url(#treeGrad)" stroke="url(#treeGrad)" stroke-width="25" stroke-linejoin="round" />
          <text x="150" y="55" font-size="45" text-anchor="middle" dominant-baseline="central">⭐</text>
        </svg>
    `;

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const treeImg = new Image();

    await new Promise((resolve, reject) => {
        treeImg.onload = resolve;
        treeImg.onerror = reject;
        treeImg.src = svgUrl;
    });

    ctx.drawImage(treeImg, 105, 100, 300, 410);
    URL.revokeObjectURL(svgUrl);

    // Draw ornaments - convert URLs to data URLs first to avoid CORS
    for (let i = 0; i < ornaments.length && i < ORNAMENT_POSITIONS.length; i++) {
        try {
            let imageSrc = ornaments[i];

            // If it's a URL (not a data URL), fetch and convert to data URL
            if (!imageSrc.startsWith('data:')) {
                try {
                    const response = await fetch(imageSrc);
                    const blob = await response.blob();
                    imageSrc = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                } catch (fetchErr) {
                    console.error(`Failed to fetch ornament ${i}:`, fetchErr);
                    continue; // Skip this ornament
                }
            }

            const ornamentImg = new Image();

            // Wait for image to load completely
            const loaded = await new Promise<boolean>((resolve) => {
                ornamentImg.onload = () => resolve(true);
                ornamentImg.onerror = (err) => {
                    console.error(`Failed to load ornament ${i}:`, err);
                    resolve(false);
                };
                ornamentImg.src = imageSrc;
            });

            // Only draw if image loaded successfully
            if (loaded && ornamentImg.complete && ornamentImg.naturalWidth > 0) {
                const pos = ORNAMENT_POSITIONS[i];
                ctx.drawImage(ornamentImg, 105 + pos.x - 25, 100 + pos.y - 25, 50, 50);
            } else {
                console.warn(`Skipping ornament ${i} - failed to load`);
            }
        } catch (err) {
            console.error(`Error drawing ornament ${i}:`, err);
            // Continue with next ornament
        }
    }

    // Draw tree name
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText(treeName || '우리들의 크리스마스', 265, 540);
    ctx.shadowBlur = 0;

    // Draw divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(143, 565);
    ctx.lineTo(387, 565);
    ctx.stroke();

    // Draw website
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '500 18px sans-serif';
    ctx.fillText('draw-tree-ornament.vercel.app 🎄', 265, 595);

    // Convert to blob
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
        }, 'image/png');
    });
}
