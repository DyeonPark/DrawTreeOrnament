import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { generateCardImage } from './utils/generateCardImage';
import MobileWrapper from './components/MobileWrapper'
import SnowBackground from './components/SnowBackground'
import ChristmasTree from './components/ChristmasTree'
import ChristmasTreeCard from './components/ChristmasTreeCard'
import DrawingModal from './components/DrawingModal'
import LandingPage from './components/LandingPage'
import CreateTreeModal from './components/CreateTreeModal'


type ViewState = 'landing' | 'tree';

function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState('');

  const [ornaments, setOrnaments] = useState<string[]>([]);
  const [treeId, setTreeId] = useState<string | null>(null);
  const [treeName, setTreeName] = useState<string>('');

  const cardRef = useRef<HTMLDivElement>(null);

  // Check for treeId in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('treeId');
    if (id) {
      setTreeId(id);
      setView('tree');
      fetchTreeAndOrnaments(id);
    }
  }, []);

  const fetchTreeAndOrnaments = async (id: string) => {
    const { data: treeData } = await supabase
      .from('trees')
      .select('name')
      .eq('id', id)
      .single();

    if (treeData) {
      setTreeName(treeData.name);
    }

    const { data, error } = await supabase
      .from('ornaments')
      .select('image_url')
      .eq('tree_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching ornaments:', error);
    } else if (data) {
      setOrnaments(data.map(item => item.image_url));
    }
  };

  const createTree = async (name: string, password: string) => {
    const { data, error } = await supabase
      .from('trees')
      .insert([{ name, password }])
      .select()
      .single();

    if (error) {
      console.error('Error creating tree:', error);
      alert('Failed to create a new tree.');
      return null;
    }
    return { id: data.id, name: data.name };
  };

  const handleCreateTree = async (name: string, password: string) => {
    const result = await createTree(name, password);
    if (result) {
      setTreeId(result.id);
      setTreeName(result.name);
      setOrnaments([]);
      setView('tree');
      setIsCreateModalOpen(false);
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?treeId=${result.id}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  const handleStart = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveOrnament = async (image: string) => {
    if (ornaments.length >= 36) {
      alert("The tree is full! (Max 36 ornaments)");
      return;
    }

    setOrnaments(prev => [...prev, image]);
    setIsModalOpen(false);

    if (!treeId) return;

    try {
      const res = await fetch(image);
      const blob = await res.blob();

      const fileName = `${treeId}/${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('ornaments')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ornaments')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('ornaments')
        .insert([{ tree_id: treeId, image_url: publicUrl }]);

      if (dbError) throw dbError;

    } catch (error) {
      console.error('Error saving ornament:', error);
    }
  };

  const handleResetOrnaments = async () => {
    if (!treeId) return;

    if (!resetPassword.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    const { data: treeData, error: verifyError } = await supabase
      .from('trees')
      .select('password')
      .eq('id', treeId)
      .single();

    if (verifyError || !treeData) {
      alert('트리 정보를 확인할 수 없습니다.');
      return;
    }

    if (treeData.password !== resetPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const { error } = await supabase
      .from('ornaments')
      .delete()
      .eq('tree_id', treeId);

    if (error) {
      console.error('Error resetting:', error);
      alert('Failed to reset tree.');
    } else {
      setOrnaments([]);
      setResetPassword('');
      setIsResetConfirmOpen(false);
      alert('모든 오너먼트가 삭제되었습니다.');
    }
  };

  useEffect(() => {
    if (!treeId) return;

    const channel = supabase
      .channel('ornaments_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ornaments', filter: `tree_id=eq.${treeId}` },
        () => fetchTreeAndOrnaments(treeId)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'ornaments', filter: `tree_id=eq.${treeId}` },
        () => fetchTreeAndOrnaments(treeId)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [treeId]);


  const handleDownloadImage = async () => {
    try {
      console.log('Starting manual card generation...');

      const blob = await generateCardImage(ornaments, treeName);
      console.log('Card generated, blob size:', blob.size);

      const fileName = `${treeName || 'christmas-tree'}-card.png`;

      // Handle Mobile vs Desktop
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: '나의 크리스마스 트리',
              text: '내가 꾸민 크리스마스 트리를 공유할게요! 🎄',
            });
            console.log('Share successful');
            return;
          } catch (err) {
            console.log('Share canceled or failed', err);
          }
        }
      }

      // Traditional download fallback
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('Download initiated');

    } catch (err) {
      console.error('Error generating card image:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      console.error('Error message:', err instanceof Error ? err.message : String(err));
      alert(`이미지 생성 중 오류가 발생했습니다.\n\n에러: ${err instanceof Error ? err.message : String(err)}\n\n브라우저 콘솔을 확인해주세요.`);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: treeName ? `${treeName} 🎄` : 'My Christmas Tree 🎄',
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share canceled', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('링크가 복사되었습니다! 친구들에게 공유해보세요 📋');
      }, () => {
        alert('링크 복사에 실패했습니다.');
      });
    }
  };

  return (
    <MobileWrapper>
      <SnowBackground />

      {view === 'landing' && (
        <LandingPage onStart={handleStart} />
      )}

      {view === 'tree' && (
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <div style={{ width: '100%', padding: '15px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '5px' }}>🎄 우리의 크리스마스 트리</div>
              <div style={{ fontSize: '1.2rem', color: 'white', fontWeight: 'bold' }}>{treeName || '크리스마스 트리를 꾸며보세요!'}</div>
            </div>
            {ornaments.length > 0 && (
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                style={{
                  position: 'absolute',
                  right: '20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ccc',
                  padding: '8px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(231, 76, 60, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(231, 76, 60, 0.4)';
                  e.currentTarget.style.color = '#e74c3c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = '#ccc';
                }}
                title="처음부터 다시 꾸미기"
              >
                🗑️
              </button>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <ChristmasTree ornaments={ornaments} />
          </div>

          <div style={{ width: '100%', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', paddingBottom: '30px' }} className="no-share">
            <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={ornaments.length >= 36}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  background: ornaments.length >= 36 ? '#ccc' : '#2ecc71',
                  color: 'white', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  cursor: ornaments.length >= 36 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}
              >
                {ornaments.length >= 36 ? '트리가 꽉찼어요!' : '+ 오너먼트 그리기'}
              </button>

              <button
                onClick={handleShare}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  background: '#3498db', color: 'white', fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}
              >
                🔗 친구 초대
              </button>

              <button
                onClick={handleDownloadImage}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  background: '#f1c40f', color: '#2c3e50', fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}
              >
                📸 카드로 저장
              </button>
            </div>

            <div style={{ color: '#aaa', fontSize: '0.8rem' }}>
              총 {ornaments.length}개의 오너먼트가 달렸어요 ✨
            </div>

            <button
              onClick={() => {
                setView('landing');
                setTreeId(null);
                setTreeName('');
                setOrnaments([]);
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({ path: newUrl }, '', newUrl);
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(46, 204, 113, 0.4)',
                marginTop: '15px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(46, 204, 113, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(46, 204, 113, 0.4)';
              }}
            >
              🎄 나만의 새 트리 만들기
            </button>
          </div>

          {isResetConfirmOpen && (
            <div
              style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.7)', zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onClick={() => {
                setIsResetConfirmOpen(false);
                setResetPassword('');
              }}
            >
              <div
                style={{ background: 'white', padding: '25px', borderRadius: '15px', width: '85%', maxWidth: '320px', textAlign: 'center' }}
                onClick={e => e.stopPropagation()}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>트리 초기화</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
                  모든 오너먼트가 사라지며 되돌릴 수 없습니다.
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="password"
                    placeholder="비밀번호 입력"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '1rem',
                      textAlign: 'center'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setIsResetConfirmOpen(false);
                      setResetPassword('');
                    }}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleResetOrnaments()}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#e74c3c', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    초기화하기
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
      )}

      <CreateTreeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTree}
      />
      {/* <AdBar /> */}
      {/* Hidden Card Layout for Export - Improved for Compatibility */}
      <div style={{ position: 'absolute', left: 0, top: 0, transform: 'translate(-10000px, -10000px)' }}>
        <div
          ref={cardRef}
          style={{
            width: '450px',
            background: '#c0392b', // Base Red for Candy Cane
            padding: '20px', // Thickness of the border
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Candy Cane Stripes */}
          {[...Array(30)].map((_, i) => (
            <div key={`stripe-${i}`} style={{
              position: 'absolute',
              top: '-150px',
              left: `${(i - 10) * 40}px`,
              width: '25px',
              height: '800px',
              backgroundColor: 'white',
              transform: 'rotate(45deg)',
              pointerEvents: 'none',
              zIndex: 0
            }} />
          ))}

          {/* Inner Content Wrapper */}
          <div style={{
            width: '100%',
            background: '#0a192f',
            padding: '25px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden',
            borderRadius: '5px' // Slight rounding inside the border
          }}>
            {/* Snowfall Particles (Individual Divs for guaranteed capture) */}
            {[...Array(60)].map((_, i) => (
              <div key={`snow-${i}`} style={{
                position: 'absolute',
                left: `${(i * 1.67) % 100}%`,
                top: `${(i * 13.3) % 100}%`,
                width: i % 3 === 0 ? '3px' : '2px',
                height: i % 3 === 0 ? '3px' : '2px',
                backgroundColor: 'white',
                borderRadius: '50%',
                opacity: 0.6,
                zIndex: 0
              }} />
            ))}

            {/* Silver/White Glow effect behind the tree */}
            <div style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '320px',
              height: '320px',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0
            }} />

            <div style={{ margin: '0 0 10px 0', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center' }}>
              <ChristmasTreeCard ornaments={ornaments} />
            </div>

            <div style={{ color: 'white', fontSize: '1.4rem', fontWeight: 'bold', marginTop: '-5px', textShadow: '0 2px 10px rgba(0,0,0,0.8)', zIndex: 2, textAlign: 'center' }}>
              {treeName || '우리들의 크리스마스'}
            </div>

            <div style={{ width: '60%', height: '1px', background: 'rgba(255,255,255,0.3)', margin: '15px 0', zIndex: 2 }} />

            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px', zIndex: 2, fontWeight: '500' }}>
              draw-tree-ornament.vercel.app 🎄
            </div>
          </div>
        </div>
      </div>

    </MobileWrapper>

  )
}

export default App
