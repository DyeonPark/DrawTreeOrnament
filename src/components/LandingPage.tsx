import './LandingPage.css';

interface LandingPageProps {
    onStart: () => void;
}

const LandingPage = ({ onStart }: LandingPageProps) => {
    return (
        <div className="landing-container">
            <div className="landing-header">
                <span className="tree-icon">🎄</span>
                <h1 className="landing-title">크리스마스 트리 만들기</h1>
                <p className="landing-subtitle">
                    친구들과 함께 특별한 크리스마스 트리를 만들어보세요<br />
                    오너먼트를 직접 그려서 세상에 하나뿐인 트리를 완성하세요 ✨
                </p>
            </div>

            <button className="btn-start" onClick={onStart}>시작하기 →</button>

            <div className="landing-footer">
                <p>💡 팁: 친구들에게 링크를 공유하면 함께 트리를 꾸밀 수 있어요!</p>
            </div>
        </div>
    );
};

export default LandingPage;
