import type { ReactNode } from 'react';
import './MobileWrapper.css';

interface MobileWrapperProps {
    children: ReactNode;
}

const MobileWrapper = ({ children }: MobileWrapperProps) => {
    return (
        <div className="mobile-wrapper">
            {children}
        </div>
    );
};

export default MobileWrapper;
