import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export interface DemoProps {
    primaryColorName?: string;
    accentColorName?: string;
}

export const PaginationDemo: React.FC<DemoProps> = ({ primaryColorName = 'brand', accentColorName = 'accent' }) => {
    const [currentPage, setCurrentPage] = useState(3);
    const totalPages = 10;

    const renderPageButton = (page: number | string, isCurrent: boolean) => {
        if (page === '...') {
            return (
                <div key={`ellipsis-${Math.random()}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    color: 'var(--color-text-subtle)'
                }}>
                    <MoreHorizontal size={16} />
                </div>
            );
        }

        return (
            <button
                key={`page-${page}`}
                onClick={() => setCurrentPage(page as number)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '32px',
                    height: '32px',
                    padding: '0 8px',
                    borderRadius: 'var(--geometry-radius-1, 6px)',
                    border: isCurrent ? `var(--geometry-borderWidth-default, 1px) solid var(--color-border-${accentColorName}-default)` : 'var(--geometry-borderWidth-default, 1px) solid var(--color-border-subtle)',
                    background: isCurrent ? `var(--color-surface-${accentColorName}-default)` : 'var(--color-surface-default)',
                    color: isCurrent ? `var(--color-text-${accentColorName}-default)` : 'var(--color-text-subtle)',
                    fontSize: '0.875rem',
                    fontWeight: isCurrent ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                    if (!isCurrent) {
                        e.currentTarget.style.background = `var(--color-surface-${accentColorName}-hover)`;
                        e.currentTarget.style.color = `var(--color-text-${accentColorName}-default)`;
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isCurrent) {
                        e.currentTarget.style.background = 'var(--color-surface-default)';
                        e.currentTarget.style.color = 'var(--color-text-subtle)';
                    }
                }}
            >
                {page}
            </button>
        );
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'inherit'
        }}>
            {/* Previous Button */}
            <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '32px',
                    padding: '0 12px',
                    borderRadius: 'var(--geometry-radius-1, 6px)',
                    border: 'var(--geometry-borderWidth-default, 1px) solid var(--color-border-subtle)',
                    background: 'var(--color-surface-default)',
                    color: currentPage === 1 ? 'var(--color-text-disabled)' : 'var(--color-text-default)',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    gap: '4px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                    if (currentPage !== 1) e.currentTarget.style.background = 'var(--color-surface-hover)';
                }}
                onMouseLeave={(e) => {
                    if (currentPage !== 1) e.currentTarget.style.background = 'var(--color-surface-default)';
                }}
            >
                <ChevronLeft size={16} />
                <span>Previous</span>
            </button>

            {/* Page Numbers */}
            <div style={{ display: 'flex', gap: '4px' }}>
                {renderPageButton(1, currentPage === 1)}
                {renderPageButton(2, currentPage === 2)}
                {renderPageButton(3, currentPage === 3)}
                {renderPageButton('...', false)}
                {renderPageButton(10, currentPage === 10)}
            </div>

            {/* Next Button */}
            <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '32px',
                    padding: '0 12px',
                    borderRadius: 'var(--geometry-radius-1, 6px)',
                    border: 'var(--geometry-borderWidth-default, 1px) solid var(--color-border-subtle)',
                    background: 'var(--color-surface-default)',
                    color: currentPage === totalPages ? 'var(--color-text-disabled)' : 'var(--color-text-default)',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    gap: '4px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                    if (currentPage !== totalPages) e.currentTarget.style.background = 'var(--color-surface-hover)';
                }}
                onMouseLeave={(e) => {
                    if (currentPage !== totalPages) e.currentTarget.style.background = 'var(--color-surface-default)';
                }}
            >
                <span>Next</span>
                <ChevronRight size={16} />
            </button>
        </div>
    );
};
