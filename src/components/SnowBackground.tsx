import { useEffect, useRef } from 'react';
import './SnowBackground.css';

class Snowflake {
    x: number;
    y: number;
    radius: number;
    speed: number;
    wind: number;
    canvasWidth: number;
    canvasHeight: number;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.radius = Math.random() * 2 + 1;
        this.speed = Math.random() * 1 + 0.5;
        this.wind = Math.random() * 0.5 - 0.25;
    }

    update() {
        this.y += this.speed;
        this.x += this.wind;

        if (this.y > this.canvasHeight) {
            this.y = -5;
            this.x = Math.random() * this.canvasWidth;
        }
        if (this.x > this.canvasWidth) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = this.canvasWidth;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
    }
}

const SnowBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let flakes: Snowflake[] = [];

        const initFlakes = (width: number, height: number) => {
            flakes = [];
            const count = Math.floor(width / 5); // Responsive count
            for (let i = 0; i < count; i++) {
                flakes.push(new Snowflake(width, height));
            }
        };

        const resize = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            } else {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            initFlakes(canvas.width, canvas.height);
        };

        resize();
        window.addEventListener('resize', resize);

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            flakes.forEach(flake => {
                flake.update();
                flake.draw(ctx);
            });
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="snow-background" />;
};

export default SnowBackground;
