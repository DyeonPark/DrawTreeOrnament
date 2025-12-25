import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { supabase } from './supabaseClient';
import MobileWrapper from './components/MobileWrapper'
import SnowBackground from './components/SnowBackground'
import ChristmasTree from './components/ChristmasTree'
import DrawingModal from './components/DrawingModal'
import LandingPage from './components/LandingPage'
import CreateTreeModal from './components/CreateTreeModal'
import AdBar from './components/AdBar'

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
    if (!cardRef.current) return;
    try {
      // 1. Ensure all images within the card are loaded
      const images = cardRef.current.querySelectorAll('img');
      const loadPromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      });
      await Promise.all(loadPromises);

      // 2. Small delay to ensure styles and layouts are settled
      await new Promise(r => setTimeout(r, 300));

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2, // High quality
        backgroundColor: null, // Transparent to respect CSS background
        logging: false,
      });

      const fileName = `${treeName || 'christmas-tree'}-card.png`;
      const dataUrl = canvas.toDataURL('image/png');

      // 3. Handle Mobile vs Desktop
      // If Web Share API is available and supports file sharing (primarily mobile)
      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: '나의 크리스마스 트리',
              text: '내가 꾸민 크리스마스 트리를 공유할게요! 🎄',
            });
            return; // Success on mobile
          } catch (err) {
            console.log('Share canceled or failed', err);
            // Fallback to traditional download if share is canceled or fails
          }
        }
      }

      // Traditional download fallback (Desktop or simple mobile browser)
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Error generating card image:', err);
      alert('이미지 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
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

          <div style={{ width: '100%', padding: '15px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
              <button
                onClick={() => {
                  setView('landing');
                  setTreeId(null);
                  setTreeName('');
                  setOrnaments([]);
                  const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                  window.history.pushState({ path: newUrl }, '', newUrl);
                }}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '5px 12px', borderRadius: '15px', cursor: 'pointer', fontSize: '0.8rem', backdropFilter: 'blur(5px)' }}
              >
                ← 뒤로가기
              </button>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '5px' }}>🎄 우리의 크리스마스 트리</div>
              <div style={{ fontSize: '1.2rem', color: 'white', fontWeight: 'bold' }}>{treeName || '크리스마스 트리를 꾸며보세요!'}</div>
            </div>
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
                <span>+</span> {ornaments.length >= 36 ? '트리가 꽉찼어요!' : '오너먼트 그리기'}
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

            {ornaments.length > 0 && (
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #777', color: '#ccc',
                  padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem',
                  cursor: 'pointer', marginTop: '10px', position: 'relative', zIndex: 50,
                }}
              >
                🗑️ 처음부터 다시 꾸미기
              </button>
            )}
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
      <AdBar />
      {/* Hidden Card Layout for Export */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div
          ref={cardRef}
          style={{
            width: '450px',
            background: '#0a192f',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            // Candy Cane Border
            border: '15px solid transparent',
            borderImageSource: 'repeating-linear-gradient(45deg, #c0392b, #c0392b 20px, #ffffff 20px, #ffffff 40px)',
            borderImageSlice: 15,
            overflow: 'hidden'
          }}
        >
          {/* CSS Snowing Effect for Card captures */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 1.5px, transparent 1.5px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2) 1.5px, transparent 1.5px), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.2) 2px, transparent 2px), radial-gradient(circle at 85% 25%, rgba(255,255,255,0.2) 1.2px, transparent 1.2px), radial-gradient(circle at 15% 75%, rgba(255,255,255,0.2) 1.5px, transparent 1.5px)',
            backgroundSize: '150px 150px'
          }} />

          <div style={{ margin: '20px 0', position: 'relative' }}>
            <ChristmasTree ornaments={ornaments} />
          </div>

          <div style={{ color: 'white', fontSize: '1.4rem', fontWeight: 'bold', marginTop: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {treeName || '우리들의 크리스마스'}
          </div>

          <div style={{ width: '80%', height: '1px', background: 'rgba(255,255,255,0.2)', margin: '25px 0' }} />

          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            draw-tree-ornament.vercel.app 🌲
          </div>
        </div>
      </div>

    </MobileWrapper>

  )
}

export default App
