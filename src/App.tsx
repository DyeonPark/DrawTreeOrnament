import { useState } from 'react';
import html2canvas from 'html2canvas';
import MobileWrapper from './components/MobileWrapper'
import SnowBackground from './components/SnowBackground'
import ChristmasTree from './components/ChristmasTree'
import DrawingModal from './components/DrawingModal'
import LandingPage from './components/LandingPage'

type ViewState = 'landing' | 'tree';

function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [ornaments, setOrnaments] = useState<string[]>([]);

  const handleSaveOrnament = (image: string) => {
    if (ornaments.length >= 36) {
      alert("The tree is full! (Max 36 ornaments)");
      return;
    }
    setOrnaments(prev => [...prev, image]);
    setIsModalOpen(false);
  };

  const handleShare = async () => {
    const wrapper = document.querySelector('.mobile-wrapper') as HTMLElement;
    if (!wrapper) return;

    try {
      const canvas = await html2canvas(wrapper, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
        ignoreElements: (el) => el.classList.contains('no-share'),
      });

      // Check if Web Share API is supported
      canvas.toBlob(blob => {
        if (blob && navigator.share) {
          const file = new File([blob], 'my-tree.png', { type: 'image/png' });
          navigator.share({
            title: 'My Christmas Tree',
            text: 'Come decorate my tree!',
            files: [file]
          }).catch(() => {
            // Fallback to download
            const li = document.createElement('a');
            li.download = 'my-tree.png';
            li.href = canvas.toDataURL();
            li.click();
          });
        } else {
          // Fallback to download
          const li = document.createElement('a');
          li.download = 'my-tree.png';
          li.href = canvas.toDataURL();
          li.click();
        }
      });
    } catch (error) {
      console.error('Share failed:', error);
      alert('Failed to generate image');
    }
  };

  return (
    <MobileWrapper>
      <SnowBackground />

      {view === 'landing' ? (
        <LandingPage onStart={() => setView('tree')} />
      ) : (
        /* Tree View */
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Header: Back Button & Title */}
          <div style={{ width: '100%', padding: '15px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
              <button
                onClick={() => setView('landing')}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '5px 12px', borderRadius: '15px', cursor: 'pointer', fontSize: '0.8rem', backdropFilter: 'blur(5px)' }}
              >
                ← 뒤로가기
              </button>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '5px' }}>🎄 우리의 크리스마스 트리</div>
              <div style={{ fontSize: '1.2rem', color: 'white', fontWeight: 'bold' }}>친구들과 함께 오너먼트를 그려보세요!</div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <ChristmasTree ornaments={ornaments} />
          </div>

          {/* Bottom Controls */}
          <div style={{ width: '100%', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', paddingBottom: '30px' }} className="no-share">
            <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={ornaments.length >= 36}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: ornaments.length >= 36 ? '#ccc' : '#2ecc71',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  cursor: ornaments.length >= 36 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}
              >
                <span>+</span> {ornaments.length >= 36 ? 'Full' : '오너먼트 그리기'}
              </button>

              <button
                onClick={handleShare}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#3498db',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}
              >
                🔗 친구 초대
              </button>
            </div>

            <div style={{ color: '#aaa', fontSize: '0.8rem' }}>
              총 {ornaments.length}개의 오너먼트가 달렸어요 ✨
            </div>

            {ornaments.length > 0 && (
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid #777',
                  color: '#ccc',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  marginTop: '10px',
                  position: 'relative',
                  zIndex: 50,
                }}
              >
                🗑️ 처음부터 다시 꾸미기
              </button>
            )}
          </div>

          {/* Reset Confirmation Modal */}
          {isResetConfirmOpen && (
            <div
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.7)', zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onClick={() => setIsResetConfirmOpen(false)}
            >
              <div
                style={{ background: 'white', padding: '20px', borderRadius: '15px', width: '80%', maxWidth: '300px', textAlign: 'center' }}
                onClick={e => e.stopPropagation()}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>정말 지우시겠어요?</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
                  모든 오너먼트가 사라집니다.<br />되돌릴 수 없어요!
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setIsResetConfirmOpen(false)}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer' }}
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      setOrnaments([]);
                      setIsResetConfirmOpen(false);
                    }}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#e74c3c', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    지우기
                  </button>
                </div>
              </div>
            </div>
          )}

          <DrawingModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveOrnament}
          />
        </div>
      )
      }
    </MobileWrapper >
  )
}

export default App
