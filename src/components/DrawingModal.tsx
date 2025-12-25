import { useRef, useState, useEffect } from 'react';
import './DrawingModal.css';

interface DrawingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (image: string) => void;
}

const COLORS = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#4B0082', '#EE82EE', '#FFFFFF', '#000000', '#8B4513'];
const BRUSH_SIZES = [2, 5, 10, 20];

const DrawingModal = ({ isOpen, onClose, onSave }: DrawingModalProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState('#FF0000');
    const [size, setSize] = useState(5);
    const [isDrawing, setIsDrawing] = useState(false);

    // Reset canvas when opened
    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Set canvas size to match display size
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
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
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
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
                <div className="canvas-header">
                    <button onClick={onClose} className="close-btn">Cancel</button>
                    <h3>Decorate!</h3>
                    <button onClick={handleSave} className="save-btn">Done</button>
                </div>

                <div className="canvas-container">
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

                <div className="tools-panel">
                    <div className="colors">
                        {COLORS.map(c => (
                            <div
                                key={c}
                                className={`color-swatch ${color === c ? 'selected' : ''}`}
                                style={{ backgroundColor: c }}
                                onClick={() => setColor(c)}
                            />
                        ))}
                    </div>
                    <div className="sizes">
                        {BRUSH_SIZES.map(s => (
                            <div
                                key={s}
                                className={`size-btn ${size === s ? 'selected' : ''}`}
                                style={{ width: s * 2 + 4, height: s * 2 + 4 }}
                                onClick={() => setSize(s)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrawingModal;
