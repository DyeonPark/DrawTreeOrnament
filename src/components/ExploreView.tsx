import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './ExploreView.css';

interface ExploreViewProps {
    onSelectTree: (id: string) => void;
    onBack: () => void;
}

interface TreePreview {
    id: string;
    name: string;
    ornaments: { image_url: string }[];
}

const ExploreView = ({ onSelectTree, onBack }: ExploreViewProps) => {
    const [trees, setTrees] = useState<TreePreview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRandomTrees = async () => {
            setLoading(true);
            // Supabase random sample is tricky without order by random(). 
            // We can fetch many and pick 6, or use order('id', {ascending: false}) as a fake random if limit is low.
            // Pure random in SQL:
            const { data, error } = await supabase
                .from('trees')
                .select(`
                    id,
                    name,
                    ornaments ( image_url )
                `)
                .limit(20); // Get some recent ones

            if (data) {
                // Shuffle locally
                const shuffled = [...data].sort(() => 0.5 - Math.random()).slice(0, 6);
                setTrees(shuffled as any);
            }
            setLoading(false);
        };
        fetchRandomTrees();
    }, []);

    return (
        <div className="explore-container">
            <div className="explore-header">
                <button className="back-btn" onClick={onBack}>← 뒤로가기</button>
                <h2>다른 트리 구경하기 🎄</h2>
            </div>

            {loading ? (
                <div className="loading">불러오는 중...</div>
            ) : (
                <div className="tree-grid">
                    {trees.map(tree => (
                        <div key={tree.id} className="tree-card" onClick={() => onSelectTree(tree.id)}>
                            <div className="tree-preview">
                                {tree.ornaments.length > 0 ? (
                                    <img src={tree.ornaments[0].image_url} alt="Ornament" />
                                ) : (
                                    <span className="no-ornament">🎄</span>
                                )}
                            </div>
                            <div className="tree-info">
                                <span className="tree-name">{tree.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExploreView;
