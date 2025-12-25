import { useState } from 'react';
import html2canvas from 'html2canvas'; // Import
import MobileWrapper from './components/MobileWrapper'
import SnowBackground from './components/SnowBackground'
import ChristmasTree from './components/ChristmasTree'
import DrawingModal from './components/DrawingModal'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: 'white', marginTop: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>DrawTreeOnment</h1>

        <ChristmasTree ornaments={ornaments} />

        <div style={{ marginTop: '20px', textAlign: 'center' }} className="no-share">
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={ornaments.length >= 36}
            style={{
              padding: '12px 24px',
              fontSize: '1.1rem',
              borderRadius: '30px',
              border: 'none',
              background: ornaments.length >= 36 ? '#ccc' : '#ff3b30',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              cursor: ornaments.length >= 36 ? 'not-allowed' : 'pointer'
            }}
          >
            {ornaments.length >= 36 ? 'Tree Full!' : '오너먼트 그리기'}
          </button>
          <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '5px' }}>{ornaments.length} / 36</p>
        </div>

        <button
          className="no-share"
          onClick={handleShare}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            background: 'white',
            color: '#333',
            fontSize: '1.5rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
          title="Share"
        >
          🔗
        </button>
      </div>

      <DrawingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOrnament}
      />
    </MobileWrapper>
  )
}

export default App

