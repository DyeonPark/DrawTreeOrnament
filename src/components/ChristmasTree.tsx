import './ChristmasTree.css';

interface ChristmasTreeProps {
    ornaments?: string[]; // array of dataURLs
}

// Coordinates based on viewBox="0 0 300 410"
// Distribution: Top (8) → Middle (12) → Bottom (16) for natural tree shape
// Top layer in pyramid pattern: 1-2-3-2, all layers with increased spacing
const ORNAMENT_POSITIONS = [
    // TOP LAYER (y: 80-145) - Pyramid pattern, 8 positions
    { x: 150, y: 85 },   // 1 at top
    { x: 125, y: 105 }, { x: 175, y: 105 },  // 2 in second row
    { x: 105, y: 125 }, { x: 150, y: 125 }, { x: 195, y: 125 },  // 3 in third row
    { x: 120, y: 142 }, { x: 180, y: 142 },  // 2 in fourth row

    // MIDDLE LAYER (y: 160-240) - Wider spacing, 12 positions
    { x: 150, y: 165 },
    { x: 110, y: 185 }, { x: 190, y: 185 },
    { x: 90, y: 205 }, { x: 210, y: 205 }, { x: 150, y: 210 },
    { x: 100, y: 225 }, { x: 200, y: 225 },
    { x: 80, y: 240 }, { x: 220, y: 240 }, { x: 125, y: 238 }, { x: 175, y: 238 },

    // BOTTOM LAYER (y: 255-318) - Maximum spacing, 16 positions
    { x: 150, y: 258 },
    { x: 110, y: 272 }, { x: 190, y: 272 },
    { x: 80, y: 286 }, { x: 220, y: 286 }, { x: 150, y: 290 },
    { x: 90, y: 302 }, { x: 210, y: 302 }, { x: 120, y: 306 }, { x: 180, y: 306 },
    { x: 70, y: 315 }, { x: 230, y: 315 }, { x: 100, y: 318 }, { x: 200, y: 318 },
    { x: 130, y: 318 }, { x: 170, y: 318 },
];

const ChristmasTree = ({ ornaments = [] }: ChristmasTreeProps) => {
    return (
        <div className="tree-container">
            <svg
                viewBox="0 0 300 410"
                className="tree-svg"
                xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
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

                {/* Reverted to Emoji Star - Centered perfectly with SVG attributes */}
                <text
                    x="150"
                    y="55"
                    fontSize="45"
                    textAnchor="middle"
                    dominantBaseline="central"
                    filter="url(#dropShadow)"
                    style={{ userSelect: 'none' }}
                >
                    ⭐
                </text>

                {/* Ornaments */}
                {ornaments.map((src, index) => {
                    const pos = ORNAMENT_POSITIONS[index] || { x: 150, y: 350 };
                    return (
                        <g key={index} transform={`translate(${pos.x}, ${pos.y})`}>
                            {/* Removed circle wrapper as per request - showing raw image */}
                            <image
                                href={src}
                                x="-20"
                                y="-20"
                                width="40"
                                height="40"
                                preserveAspectRatio="xMidYMid meet"
                                crossOrigin="anonymous"
                            />
                        </g>
                    );
                })}

            </svg>
        </div>
    );
};

export default ChristmasTree;
