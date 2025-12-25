import './ChristmasTree.css';

interface ChristmasTreeProps {
    ornaments?: string[]; // array of dataURLs
}

// Coordinates based on viewBox="0 0 300 400"
// We need to map the previous 36 positions to this SVG space.
// Tree dimensions approx: Center 150. Top ~50, Bottom ~350.
const ORNAMENT_POSITIONS = [
    // Top Layer (Triangle ~ 150,50 to 100,120 / 200,120)
    { x: 150, y: 70 }, { x: 135, y: 90 }, { x: 165, y: 90 },
    { x: 125, y: 110 }, { x: 150, y: 110 }, { x: 175, y: 110 },

    // Middle Layer (Triangle ~ 150,80 to 80,220 / 220,220)
    { x: 110, y: 140 }, { x: 190, y: 140 }, { x: 130, y: 160 }, { x: 170, y: 160 },
    { x: 100, y: 180 }, { x: 200, y: 180 }, { x: 120, y: 190 }, { x: 180, y: 190 },
    { x: 150, y: 170 }, { x: 90, y: 200 }, { x: 210, y: 200 },

    // Bottom Layer (Triangle ~ 150,180 to 50,350 / 250,350)
    { x: 110, y: 230 }, { x: 190, y: 230 }, { x: 80, y: 240 }, { x: 220, y: 240 },
    { x: 130, y: 260 }, { x: 170, y: 260 }, { x: 100, y: 270 }, { x: 200, y: 270 },
    { x: 150, y: 250 }, { x: 120, y: 290 }, { x: 180, y: 290 },
    { x: 70, y: 300 }, { x: 230, y: 300 }, { x: 140, y: 310 }, { x: 160, y: 310 },
    { x: 90, y: 320 }, { x: 210, y: 320 },
];

const ChristmasTree = ({ ornaments = [] }: ChristmasTreeProps) => {
    return (
        <div className="tree-container">
            <svg
                viewBox="0 0 300 500"
                className="tree-svg"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Defs for Gradients/Filters */}
                <defs>
                    <linearGradient id="treeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#43a047" />
                        <stop offset="100%" stopColor="#1b5e20" />
                    </linearGradient>
                    <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#795548" />
                        <stop offset="100%" stopColor="#5d4037" />
                    </linearGradient>
                    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                        <feOffset dx="2" dy="4" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Trunk - 2x Thicker (60) and Longer (120) */}
                <rect x="120" y="280" width="60" height="120" fill="url(#trunkGradient)" rx="5" />

                {/* 
            Tree Layers - Rounded Triangles
            Using stroke-linejoin="round" stroke-width="20" to fake rounded corners on a triangle path?
            Or creating explicit paths with curves.
            Let's use stroke-linejoin="round" on a thick path which works well for soft corners.
            But we need gradients fill.
            
            Better: explicit path with quadratic curves (Q).
            
            Layer 1 (Bottom): Base width ~220. Height ~150.
            Layer 2 (Middle): Base width ~180. Height ~140.
            Layer 3 (Top): Base width ~140. Height ~120.
          */}

                {/* Bottom Layer */}
                <path
                    d="M50 320 L250 320 L150 180 Z"
                    fill="url(#treeGradient)"
                    stroke="url(#treeGradient)"
                    strokeWidth="25"
                    strokeLinejoin="round"
                    filter="url(#dropShadow)"
                />

                {/* Middle Layer */}
                <path
                    d="M75 230 L225 230 L150 110 Z"
                    fill="url(#treeGradient)"
                    stroke="url(#treeGradient)"
                    strokeWidth="25"
                    strokeLinejoin="round"
                    filter="url(#dropShadow)"
                />

                {/* Top Layer - Lowered tip from 40 to 75 (2/3 height) */}
                <path
                    d="M100 140 L200 140 L150 75 Z"
                    fill="url(#treeGradient)"
                    stroke="url(#treeGradient)"
                    strokeWidth="25"
                    strokeLinejoin="round"
                    filter="url(#dropShadow)"
                />

                {/* Star at Top - Adjusted y from 45 to 70 */}
                <text x="150" y="70" fontSize="40" textAnchor="middle" filter="url(#dropShadow)">⭐</text>

                {/* Ornaments */}
                {ornaments.map((src, index) => {
                    const pos = ORNAMENT_POSITIONS[index] || { x: 150, y: 350 };
                    return (
                        <g key={index} transform={`translate(${pos.x}, ${pos.y})`}>
                            {/* Removed circle wrapper as per request - showing raw image */}
                            <image
                                href={src}
                                x="-25"
                                y="-25"
                                width="50"
                                height="50"
                                preserveAspectRatio="xMidYMid meet"
                                style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))' }}
                            />
                        </g>
                    );
                })}

            </svg>
        </div>
    );
};

export default ChristmasTree;
