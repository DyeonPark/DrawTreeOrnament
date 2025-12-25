import { useState } from 'react';
import './DrawingModal.css'; // Reuse modal styles for consistency

interface CreateTreeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, password: string) => void;
}

const CreateTreeModal = ({ isOpen, onClose, onCreate }: CreateTreeModalProps) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name.trim() || !password.trim()) {
            alert('트리 이름과 비밀번호를 모두 입력해주세요.');
            return;
        }
        onCreate(name, password);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '320px' }}>
                <div className="modal-header">
                    <h3>🎄 새 트리 만들기</h3>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                            트리 이름
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 주디의 크리스마스 트리"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                            비밀번호
                            <br />
                            <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#888' }}>(오너먼트를 모두 지우고 새로 그릴 때 사용해요!)</span>
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호 입력"
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                        />
                    </div>
                </div>

                <div className="modal-footer" style={{ padding: '0 20px 20px 20px', marginTop: '0' }}>
                    <button className="btn-save" onClick={handleSubmit}>만들기</button>
                    <button className="btn-cancel" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
};

export default CreateTreeModal;
