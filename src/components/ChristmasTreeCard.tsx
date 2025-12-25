import './ChristmasTree.css';

interface ChristmasTreeCardProps {
    ornaments?: string[]; // array of dataURLs
}

// Same positions as the main tree
const ORNAMENT_POSITIONS = [
    { x: 150, y: 70 },   // Top Center
    { x: 90, y: 320 },  // Bottom Left
    { x: 210, y: 320 }, // Bottom Right
    { x: 190, y: 140 }, // Middle Right
    { x: 110, y: 140 }, // Middle Left
    { x: 150, y: 250 }, // Bottom Center
    { x: 135, y: 90 },  // Top-ish Left
    { x: 165, y: 90 },  // Top-ish Right
    { x: 125, y: 110 }, { x: 175, y: 110 },
    { x: 150, y: 110 }, { x: 130, y: 160 }, { x: 170, y: 160 },
    { x: 100, y: 180 }, { x: 200, y: 180 }, { x: 120, y: 190 }, { x: 180, y: 190 },
    { x: 150, y: 170 }, { x: 90, y: 200 }, { x: 210, y: 200 },
    { x: 110, y: 230 }, { x: 190, y: 230 }, { x: 80, y: 240 }, { x: 220, y: 240 },
    { x: 130, y: 260 }, { x: 170, y: 260 }, { x: 100, y: 270 }, { x: 200, y: 270 },
    { x: 120, y: 290 }, { x: 180, y: 290 }, { x: 70, y: 300 }, { x: 230, y: 300 },
    { x: 140, y: 310 }, { x: 160, y: 310 },
];

// This component renders the tree using SVG with embedded images
// for better compatibility with html2canvas
const ChristmasTreeCard = ({ ornaments = [] }: ChristmasTreeCardProps) => {
    return (
        <div style={{ position: 'relative', width: '300px', height: '410px' }}>
            <svg
                viewBox="0 0 300 410"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
            >
                <defs>
                    <linearGradient id="treeGradientCard" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#43a047" />
                        <stop offset="100%" stopColor="#1b5e20" />
                    </linearGradient>
                    <linearGradient id="trunkGradientCard" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#795548" />
                        <stop offset="100%" stopColor="#5d4037" />
                    </linearGradient>
                    <filter id="dropShadowCard" x="-20%" y="-20%" width="140%" height="140%">
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

                {/* Trunk */}
                <rect x="120" y="280" width="60" height="120" fill="url(#trunkGradientCard)" rx="5" />

                {/* Bottom Layer */}
                <path
                    d="M50 320 L250 320 L150 180 Z"
                    fill="url(#treeGradientCard)"
                    stroke="url(#treeGradientCard)"
                    strokeWidth="25"
                    strokeLinejoin="round"
                    filter="url(#dropShadowCard)"
                />

                {/* Middle Layer */}
                <path
                    d="M75 230 L225 230 L150 110 Z"
                    fill="url(#treeGradientCard)"
                    stroke="url(#treeGradientCard)"
                    strokeWidth="25"
                    strokeLinejoin="round"
                    filter="url(#dropShadowCard)"
                />

                {/* Top Layer */}
                <path
                    d="M100 140 L200 140 L150 75 Z"
                    fill="url(#treeGradientCard)"
                    stroke="url(#treeGradientCard)"
                    strokeWidth="25"
                    strokeLinejoin="round"
                    filter="url(#dropShadowCard)"
                />

                {/* Star */}
                <text
                    x="150"
                    y="55"
                    fontSize="45"
                    textAnchor="middle"
                    dominantBaseline="central"
                    filter="url(#dropShadowCard)"
                    style={{ userSelect: 'none' }}
                >
                    ⭐
                </text>

                {/* Ornaments as SVG images */}
                {ornaments.map((src, index) => {
                    const pos = ORNAMENT_POSITIONS[index] || { x: 150, y: 350 };
                    return (
                        <image
                            key={index}
                            href={src}
                            x={pos.x - 25}
                            y={pos.y - 25}
                            width="50"
                            height="50"
                            preserveAspectRatio="xMidYMid meet"
                        />
                    );
                })}
            </svg>
        </div>
    );
};

export default ChristmasTreeCard;
