import './ChristmasTree.css';

interface ChristmasTreeProps {
    ornaments?: string[]; // array of dataURLs
}

const ORNAMENT_POSITIONS = [
    // Top Layer (Target width ~100px)
    { top: 90, left: 0 }, { top: 110, left: -20 }, { top: 110, left: 20 },
    { top: 130, left: -10 }, { top: 130, left: 10 }, { top: 150, left: 0 },

    // Middle Layer (Target width ~140px)
    { top: 160, left: -40 }, { top: 160, left: 40 }, { top: 180, left: -20 }, { top: 180, left: 20 },
    { top: 200, left: -50 }, { top: 200, left: 50 }, { top: 220, left: -30 }, { top: 220, left: 30 },
    { top: 210, left: 0 }, { top: 230, left: -60 }, { top: 230, left: 60 },

    // Bottom Layer (Target width ~180px)
    { top: 240, left: -40 }, { top: 240, left: 40 }, { top: 250, left: -80 }, { top: 250, left: 80 },
    { top: 260, left: -20 }, { top: 260, left: 20 }, { top: 270, left: -60 }, { top: 270, left: 60 },
    { top: 280, left: 0 }, { top: 290, left: -40 }, { top: 290, left: 40 },
    { top: 300, left: -80 }, { top: 300, left: 80 }, { top: 310, left: -20 }, { top: 310, left: 20 },
    { top: 320, left: -60 }, { top: 320, left: 60 },
];

const ChristmasTree = ({ ornaments = [] }: ChristmasTreeProps) => {

    return (
        <div className="tree-container">
            {/* Star */}
            <div className="star">⭐</div>

            {/* Ornaments Layer - render on top of leaves but below star? or on top of all? */}
            <div className="ornaments-layer">
                {ornaments.map((src, index) => {
                    const pos = ORNAMENT_POSITIONS[index] || { top: 300, left: 0 };
                    return (
                        <img
                            key={index}
                            src={src}
                            className="ornament-item"
                            style={{
                                top: pos.top + 'px',
                                marginLeft: pos.left + 'px' // relative to center
                            }}
                        />
                    )
                })}
            </div>

            {/* Tree Layers */}
            <div className="tree-layer top"></div>
            <div className="tree-layer middle"></div>
            <div className="tree-layer bottom"></div>

            {/* Trunk */}
            <div className="trunk"></div>
        </div>
    );
};

export default ChristmasTree;

