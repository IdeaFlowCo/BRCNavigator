import React from 'react';
import { useData } from '../context/DataContext';
import { generateRowId } from '../utils/rowIdGenerator';
import { Heart } from 'lucide-react';
import './CardList.css';
import './DataTable.css'; // For favorite icon styles

const CardList: React.FC = () => {
    const {
        headers,
        filteredRows,
        favoriteIds,
        addFavorite,
        removeFavorite,
        uidColumnIndex,
    } = useData();

    const handleFavoriteClick = (
        e: React.MouseEvent<HTMLDivElement>,
        row: string[],
        index: number
    ) => {
        e.stopPropagation();
        const uid = generateRowId(row, index, uidColumnIndex);
        if (favoriteIds.has(uid)) {
            removeFavorite(uid);
        } else {
            addFavorite(uid);
        }
    };

    return (
        <div className="card-list-container">
            {filteredRows.map((row, rowIndex) => {
                const uid = generateRowId(row, rowIndex, uidColumnIndex);
                const isFavorited = favoriteIds.has(uid);

                const titleIndex = headers.findIndex(h => h.toLowerCase() === 'title');
                const title = titleIndex > -1 ? row[titleIndex] : 'Event';

                return (
                    <div className="card" key={uid}>
                        <div className="card-header">
                            <h3 className="card-title">{title}</h3>
                            <div
                                className="card-favorite-icon"
                                onClick={(e) => handleFavoriteClick(e, row, rowIndex)}
                            >
                                <div
                                    className={`favorite-icon-wrapper ${
                                        isFavorited ? 'favorited' : ''
                                    }`}
                                    role="button"
                                    aria-pressed={isFavorited}
                                    tabIndex={0}
                                >
                                    <Heart size={24} className="favorite-icon" />
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            {headers.map((header, headerIndex) => {
                                // Don't render title again
                                if (header.toLowerCase() === 'title') return null;
                                
                                // Hide UID field in card view
                                if (header.toLowerCase() === 'uid') return null;
                                
                                // Skip empty fields (null, undefined, empty string, or just "-")
                                const value = row[headerIndex];
                                if (!value || value === '-' || value.trim() === '') return null;
                                
                                // Check if the value is a URL
                                const isUrl = value.startsWith('http://') || value.startsWith('https://');
                                
                                // Add emoji for Type field
                                let displayValue = value;
                                if (header.toLowerCase() === 'type') {
                                    const typeEmojis: { [key: string]: string } = {
                                        'prty': '🎉',
                                        'tea': '🫖',
                                        'work': '🛠️',
                                        'art': '🎨',
                                        'arts': '🎨',
                                        'adlt': '🔞',
                                        'food': '🍕',
                                        'kid': '🚸',
                                        'yoga': '🧘',
                                        'game': '🎲',
                                        'care': '💅',
                                        'cere': '🕯️',
                                        'repr': '🔧',
                                        'live': '🎸',
                                        'lgbt': '🌈',
                                        'fire': '🔥',
                                        'para': '👣',
                                        'perf': '🎭',
                                        'sust': '💧',
                                        'ride': '🌎',
                                        'othr': '❓'
                                    };
                                    
                                    const lowerValue = value.toLowerCase();
                                    const emoji = typeEmojis[lowerValue] || '';
                                    displayValue = emoji ? `${value} ${emoji}` : value;
                                }
                                
                                return (
                                    <div className="card-item" key={header}>
                                        <span className="card-item-label">{header}</span>
                                        <span className="card-item-value">
                                            {isUrl ? (
                                                <a 
                                                    href={value} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#007bff', textDecoration: 'underline' }}
                                                >
                                                    {displayValue}
                                                </a>
                                            ) : (
                                                displayValue
                                            )}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CardList;