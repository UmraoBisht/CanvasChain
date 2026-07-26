import { CanvasNodeWithPath } from '../store/useCanvasStore';

export function exportToJson(nodes: Record<string, CanvasNodeWithPath>, filename = 'canvas-chain-board.json') {
  const jsonString = JSON.stringify(nodes, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function importFromJson(file: File): Promise<Record<string, CanvasNodeWithPath>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON whiteboard file format.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

export function exportToSvg(nodes: Record<string, CanvasNodeWithPath>, filename = 'canvas-chain-board.svg') {
  const nodeList = Object.values(nodes).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  if (nodeList.length === 0) return;

  const minX = Math.min(...nodeList.map((n) => n.x)) - 40;
  const minY = Math.min(...nodeList.map((n) => n.y)) - 40;
  const maxX = Math.max(...nodeList.map((n) => n.x + n.width)) + 40;
  const maxY = Math.max(...nodeList.map((n) => n.y + n.height)) + 40;
  const width = Math.max(400, maxX - minX);
  const height = Math.max(400, maxY - minY);

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">\n`;
  svgContent += `<rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#0f172a"/>\n`;

  nodeList.forEach((node) => {
    const transform = node.rotation ? `transform="rotate(${node.rotation} ${node.x + node.width / 2} ${node.y + node.height / 2})"` : '';

    if (node.shapeType === 'rectangle') {
      svgContent += `  <rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" fill="${node.fill || 'rgba(99,102,241,0.2)'}" stroke="${node.stroke || '#6366f1'}" stroke-width="${node.strokeWidth || 2}" rx="6" opacity="${node.opacity ?? 1}" ${transform} />\n`;
    } else if (node.shapeType === 'circle') {
      const rx = node.width / 2;
      const ry = node.height / 2;
      svgContent += `  <ellipse cx="${node.x + rx}" cy="${node.y + ry}" rx="${rx}" ry="${ry}" fill="${node.fill || 'rgba(99,102,241,0.2)'}" stroke="${node.stroke || '#6366f1'}" stroke-width="${node.strokeWidth || 2}" opacity="${node.opacity ?? 1}" ${transform} />\n`;
    } else if (node.shapeType === 'line') {
      svgContent += `  <line x1="${node.x}" y1="${node.y}" x2="${node.x + node.width}" y2="${node.y + node.height}" stroke="${node.stroke || '#6366f1'}" stroke-width="${node.strokeWidth || 3}" stroke-linecap="round" opacity="${node.opacity ?? 1}" ${transform} />\n`;
    } else if (node.shapeType === 'arrow') {
      svgContent += `  <g ${transform} opacity="${node.opacity ?? 1}">\n`;
      svgContent += `    <line x1="${node.x}" y1="${node.y}" x2="${node.x + node.width}" y2="${node.y + node.height}" stroke="${node.stroke || '#6366f1'}" stroke-width="${node.strokeWidth || 3}" stroke-linecap="round" />\n`;
      svgContent += `  </g>\n`;
    } else if (node.shapeType === 'text') {
      svgContent += `  <text x="${node.x + 8}" y="${node.y + 24}" fill="${node.stroke || '#f8fafc'}" font-family="sans-serif" font-size="16" opacity="${node.opacity ?? 1}" ${transform}>${node.text || ''}</text>\n`;
    } else if (node.shapeType === 'pencil' && node.points) {
      const pts = node.points.map((p) => `${p.x},${p.y}`).join(' ');
      svgContent += `  <polyline points="${pts}" fill="none" stroke="${node.stroke || '#6366f1'}" stroke-width="${node.strokeWidth || 3}" stroke-linecap="round" stroke-linejoin="round" opacity="${node.opacity ?? 1}" />\n`;
    }
  });

  svgContent += `</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToPng(nodes: Record<string, CanvasNodeWithPath>, filename = 'canvas-chain-board.png') {
  const nodeList = Object.values(nodes).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  if (nodeList.length === 0) return;

  const minX = Math.min(...nodeList.map((n) => n.x)) - 40;
  const minY = Math.min(...nodeList.map((n) => n.y)) - 40;
  const maxX = Math.max(...nodeList.map((n) => n.x + n.width)) + 40;
  const maxY = Math.max(...nodeList.map((n) => n.y + n.height)) + 40;
  const width = Math.max(400, maxX - minX);
  const height = Math.max(400, maxY - minY);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  ctx.translate(-minX, -minY);

  nodeList.forEach((node) => {
    ctx.save();
    ctx.globalAlpha = node.opacity ?? 1;

    if (node.rotation) {
      const cx = node.x + node.width / 2;
      const cy = node.y + node.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((node.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    if (node.shapeType === 'rectangle') {
      ctx.fillStyle = node.fill || 'rgba(99, 102, 241, 0.2)';
      ctx.strokeStyle = node.stroke || '#6366f1';
      ctx.lineWidth = node.strokeWidth || 2;
      ctx.beginPath();
      ctx.roundRect(node.x, node.y, node.width, node.height, 6);
      ctx.fill();
      ctx.stroke();
    } else if (node.shapeType === 'circle') {
      ctx.fillStyle = node.fill || 'rgba(99, 102, 241, 0.2)';
      ctx.strokeStyle = node.stroke || '#6366f1';
      ctx.lineWidth = node.strokeWidth || 2;
      ctx.beginPath();
      ctx.ellipse(
        node.x + node.width / 2,
        node.y + node.height / 2,
        node.width / 2,
        node.height / 2,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.stroke();
    } else if (node.shapeType === 'line' || node.shapeType === 'arrow') {
      ctx.strokeStyle = node.stroke || '#6366f1';
      ctx.lineWidth = node.strokeWidth || 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(node.x + node.width, node.y + node.height);
      ctx.stroke();
    } else if (node.shapeType === 'text') {
      ctx.fillStyle = node.stroke || '#f8fafc';
      ctx.font = '16px sans-serif';
      ctx.fillText(node.text || '', node.x + 8, node.y + 24);
    } else if (node.shapeType === 'pencil' && node.points && node.points.length > 0) {
      ctx.strokeStyle = node.stroke || '#6366f1';
      ctx.lineWidth = node.strokeWidth || 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(node.points[0].x, node.points[0].y);
      for (let i = 1; i < node.points.length; i++) {
        ctx.lineTo(node.points[i].x, node.points[i].y);
      }
      ctx.stroke();
    }

    ctx.restore();
  });

  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}
