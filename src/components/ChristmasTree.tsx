import './ChristmasTree.css';

const ChristmasTree = () => {
    return (
        <div className="tree-container">
            {/* Star */}
            <div className="star">⭐</div>

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
