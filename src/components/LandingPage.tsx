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

            <div className="card-container">
                <div className="card">
                    <div className="card-icon">🌲</div>
                    <h2>나만의 트리 만들기</h2>
                    <p>친구들과 함께 오너먼트를 그려서<br />특별한 트리를 만들어보세요</p>
                    <button className="btn-start" onClick={onStart}>시작하기 →</button>
                </div>

                <div className="card">
                    <div className="card-icon">✨</div>
                    <h2>트리 구경하기</h2>
                    <p>다른 사람들이 만든<br />아름다운 트리를 감상해보세요</p>
                    <button className="btn-view">둘러보기 →</button>
                </div>
            </div>

            <div className="landing-footer">
                <p>💡 팁: 친구들에게 링크를 공유하면 함께 트리를 꾸밀 수 있어요!</p>
            </div>
        </div>
    );
};

export default LandingPage;
