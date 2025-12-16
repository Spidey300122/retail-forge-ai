import { useState } from 'react';
import { Tag, DollarSign } from 'lucide-react';

function ValueTileSelector({ onAddTile }) {
  const [selectedTile, setSelectedTile] = useState(null);
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [regularPrice, setRegularPrice] = useState('');

  const tiles = [
    {
      id: 'new',
      name: 'New',
      description: 'Predefined, cannot be edited',
      color: '#00539F',
      textColor: 'white',
      editable: false
    },
    {
      id: 'white',
      name: 'White Value Tile',
      description: 'Only price can be edited',
      color: 'white',
      textColor: '#00539F',
      editable: true,
      fields: ['price']
    },
    {
      id: 'clubcard',
      name: 'Clubcard Price',
      description: 'Offer and regular price',
      color: '#00539F',
      textColor: 'white',
      editable: true,
      fields: ['offerPrice', 'regularPrice']
    }
  ];

  const handleAddTile = () => {
    const tile = tiles.find(t => t.id === selectedTile);
    if (!tile) return;

    let tileData = {
      type: tile.id,
      name: tile.name,
      color: tile.color,
      textColor: tile.textColor
    };

    if (tile.id === 'new') {
      tileData.text = 'NEW';
    } else if (tile.id === 'white') {
      if (!price.trim()) {
        alert('Please enter a price');
        return;
      }
      tileData.price = price;
    } else if (tile.id === 'clubcard') {
      if (!offerPrice.trim() || !regularPrice.trim()) {
        alert('Please enter both offer and regular price');
        return;
      }
      tileData.offerPrice = offerPrice;
      tileData.regularPrice = regularPrice;
    }

    onAddTile(tileData);
    
    // Reset form
    setSelectedTile(null);
    setPrice('');
    setOfferPrice('');
    setRegularPrice('');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <div>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Tag size={16} color="#00539F" />
          Add Value Tile
        </h4>
        <p style={{
          fontSize: '12px',
          color: '#6b7280',
          marginBottom: '12px'
        }}>
          Select a tile type to add to your canvas (top-right, locked position)
        </p>
      </div>

      {/* Tile Selection */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '8px'
      }}>
        {tiles.map(tile => (
          <button
            key={tile.id}
            onClick={() => setSelectedTile(tile.id)}
            style={{
              padding: '12px',
              border: selectedTile === tile.id ? '2px solid #00539F' : '2px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: selectedTile === tile.id ? '#eff6ff' : 'white',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '6px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: tile.color,
                border: tile.color === 'white' ? '2px solid #00539F' : 'none',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: tile.textColor
              }}>
                {tile.id === 'new' ? 'NEW' : tile.id === 'clubcard' ? 'C' : '£'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  {tile.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  marginTop: '2px'
                }}>
                  {tile.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Conditional Input Fields */}
      {selectedTile === 'white' && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <label style={{
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151',
            display: 'block',
            marginBottom: '6px'
          }}>
            Price *
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280',
              fontSize: '14px'
            }}>£</span>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="2.99"
              style={{
                width: '100%',
                padding: '8px 8px 8px 24px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      )}

      {selectedTile === 'clubcard' && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#374151',
              display: 'block',
              marginBottom: '6px'
            }}>
              Clubcard Offer Price *
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                fontSize: '14px'
              }}>£</span>
              <input
                type="text"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="1.99"
                style={{
                  width: '100%',
                  padding: '8px 8px 8px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#374151',
              display: 'block',
              marginBottom: '6px'
            }}>
              Regular Price *
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                fontSize: '14px'
              }}>£</span>
              <input
                type="text"
                value={regularPrice}
                onChange={(e) => setRegularPrice(e.target.value)}
                placeholder="2.99"
                style={{
                  width: '100%',
                  padding: '8px 8px 8px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={handleAddTile}
        disabled={!selectedTile}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: selectedTile ? '#00539F' : '#9ca3af',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: selectedTile ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (selectedTile) e.target.style.backgroundColor = '#003d7a';
        }}
        onMouseLeave={(e) => {
          if (selectedTile) e.target.style.backgroundColor = '#00539F';
        }}
      >
        <DollarSign size={16} />
        Add Tile to Canvas
      </button>
    </div>
  );
}

export default ValueTileSelector;