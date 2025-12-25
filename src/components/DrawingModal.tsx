import { useRef, useState, useEffect } from 'react';
import './DrawingModal.css';

interface DrawingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (image: string) => void;
}

const COLORS = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#4B0082', '#EE82EE', '#000000', '#FFFFFF', '#8B4513'];
// const BRUSH_SIZES = [2, 5, 10, 20]; // Removed unused

const DrawingModal = ({ isOpen, onClose, onSave }: DrawingModalProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState('#FF0000');
    const [size, setSize] = useState(5);
    const [isDrawing, setIsDrawing] = useState(false);
    const [mode, setMode] = useState<'brush' | 'eraser' | 'fill'>('brush');

    // Reset canvas when opened
    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Ensure correct resolution
                const dpr = window.devicePixelRatio || 1;
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr);

                // Set default to transparent (no white background)
                ctx.clearRect(0, 0, rect.width, rect.height);

                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // Reset State
                setColor('#FF0000');
                setSize(5);
                setMode('brush');
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!canvasRef.current) return;

        if (mode === 'fill') {
            handleFill(e);
            return;
        }

        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) ctx.beginPath(); // Reset path
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get Input coordinates
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Brush Logic
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (mode === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)'; // Color doesn't matter for destination-out, alpha does
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = color;
        }

        ctx.lineWidth = size;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);

        // Reset to default
        ctx.globalCompositeOperation = 'source-over';
    };

    const handleFill = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const rect = canvas.getBoundingClientRect();
        const startX = Math.floor((clientX - rect.left) * (window.devicePixelRatio || 1));
        const startY = Math.floor((clientY - rect.top) * (window.devicePixelRatio || 1));

        // Simple BFS Flood Fill
        // Note: For High DPI, we need to map CSS coordinates to Canvas Pixel coordinates
        // Canvas width/height are scaled by DPR.
        // But getBoundingClientRect returns CSS pixels.
        // So we multiply by DPR.

        const width = canvas.width;
        const height = canvas.height;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Helper to get color at x,y
        const getPixelColor = (x: number, y: number) => {
            const idx = (y * width + x) * 4;
            return {
                r: data[idx],
                g: data[idx + 1],
                b: data[idx + 2],
                a: data[idx + 3]
            };
        };

        const targetColor = getPixelColor(startX, startY);

        // Parse current color hex to RGB
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        // If target same as fill, return
        if (targetColor.r === r && targetColor.g === g && targetColor.b === b) return;

        // Using Int32Array for queue might be faster but Array is fine for MVP.

        const matchColor = (pos: number) => {
            return data[pos] === targetColor.r &&
                data[pos + 1] === targetColor.g &&
                data[pos + 2] === targetColor.b &&
                data[pos + 3] === targetColor.a; // Check exact match
            // Might need tolerance for antialiasing but pure canvas drawing is aliased unless browser smoothes it. 
            // Canvas lines are antialiased. Standard flood fill might have halos. 
            // Tolerance is complex. Let's do exact match first.
        }

        // Optimization: Use 1D array stack
        const stack = [startX, startY];

        while (stack.length > 0) {
            const y = stack.pop()!;
            const x = stack.pop()!;

            const idx = (y * width + x) * 4;
            if (x < 0 || x >= width || y < 0 || y >= height) continue;

            if (matchColor(idx)) {
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = 255;

                stack.push(x + 1, y);
                stack.push(x - 1, y);
                stack.push(x, y + 1);
                stack.push(x, y - 1);
            }
        }

        ctx.putImageData(imageData, 0, 0);
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // Clear to Transparent
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleSave = () => {
        if (canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL('image/png');
            onSave(dataUrl);
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>✨ 오너먼트 그리기</h3>
                </div>

                <div className="canvas-wrapper">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseUp={stopDrawing}
                        onMouseMove={draw}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchEnd={stopDrawing}
                        onTouchMove={draw}
                    />
                </div>

                <div className="tools-section">
                    {/* Colors */}
                    <div className="color-picker-container">
                        <div className="color-picker">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    className={`color-btn ${color === c && mode !== 'eraser' ? 'active' : ''}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => { setColor(c); setMode('brush'); }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Size Slider */}
                    <div className="size-slider-container">
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', marginRight: '10px' }}>크기</span>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={size}
                            onChange={(e) => setSize(Number(e.target.value))}
                            className="size-slider"
                        />
                        <span style={{ marginLeft: '10px', width: '20px' }}>{size}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-row">
                        <button
                            className={`tool-btn ${mode === 'fill' ? 'active' : ''}`}
                            onClick={() => setMode('fill')}
                        >
                            🎨 채우기
                        </button>
                        <button
                            className={`tool-btn ${mode === 'eraser' ? 'active' : ''}`}
                            onClick={() => setMode('eraser')}
                        >
                            🧹 지우기
                        </button>
                        <button
                            className="tool-btn"
                            onClick={handleClear}
                        >
                            🗑️ 전체 지우기
                        </button>
                    </div>

                    {/* Footer Buttons */}
                    <div className="modal-footer">
                        <button className="btn-save" onClick={handleSave}>트리에 달기</button>
                        <button className="btn-cancel" onClick={onClose}>취소</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrawingModal;
