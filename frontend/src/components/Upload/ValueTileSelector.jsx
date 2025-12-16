import { useState } from 'react';
import { Tag, DollarSign, Calendar, AlertCircle } from 'lucide-react';

function ValueTileSelector({ onAddTile }) {
  const [selectedTile, setSelectedTile] = useState(null);
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [endDate, setEndDate] = useState(''); // DD/MM format
  const [dateError, setDateError] = useState('');

  const tiles = [
    {
      id: 'new',
      name: 'Tesco Brand Tile',
      description: 'Shows "Tesco" logo, predefined',
      color: 'transparent', // Will use canvas background
      textColor: '#00539F',
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
      description: 'Offer, regular price & end date',
      color: '#00539F',
      textColor: 'white',
      editable: true,
      fields: ['offerPrice', 'regularPrice', 'endDate']
    }
  ];

  // Validate DD/MM format
  const validateDateFormat = (dateStr) => {
    if (!dateStr) return false;
    
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/;
    if (!regex.test(dateStr)) return false;
    
    // Additional validation: check if day is valid for month
    const [day, month] = dateStr.split('/').map(Number);
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    if (day > daysInMonth[month - 1]) {
      return false;
    }
    
    return true;
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    setEndDate(value);
    
    if (value && !validateDateFormat(value)) {
      setDateError('Invalid format. Use DD/MM (e.g., 23/06)');
    } else {
      setDateError('');
    }
  };

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
      tileData.text = 'Tesco';
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
      if (!endDate.trim()) {
        alert('Please enter an end date in DD/MM format (e.g., 23/06)');
        return;
      }
      if (!validateDateFormat(endDate)) {
        alert('Invalid date format. Please use DD/MM (e.g., 23/06)');
        return;
      }
      tileData.offerPrice = offerPrice;
      tileData.regularPrice = regularPrice;
      tileData.endDate = endDate;
    }

    onAddTile(tileData);
    
    // Reset form
    setSelectedTile(null);
    setPrice('');
    setOfferPrice('');
    setRegularPrice('');
    setEndDate('');
    setDateError('');
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
          marginBottom: '8px'
        }}>
          Select a tile type to add to your canvas
        </p>
        <p style={{
          fontSize: '11px',
          color: '#ef4444',
          fontStyle: 'italic'
        }}>
          ⚠️ Tiles are locked at top-right and cannot be moved or edited
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
                width: '50px',
                height: '50px',
                backgroundColor: tile.color === 'transparent' ? '#f3f4f6' : tile.color,
                border: tile.color === 'white' || tile.color === 'transparent' ? '2px solid #00539F' : 'none',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tile.id === 'new' ? '9px' : '12px',
                fontWeight: 'bold',
                color: tile.textColor
              }}>
                {tile.id === 'new' ? 'Tesco' : tile.id === 'clubcard' ? 'C' : '£'}
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

      {/* White Tile Input */}
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

      {/* Clubcard Tile Inputs */}
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

          {/* End Date Input - DD/MM Format */}
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '6px'
            }}>
              <Calendar size={12} />
              End Date (DD/MM) *
            </label>
            <input
              type="text"
              value={endDate}
              onChange={handleDateChange}
              placeholder="23/06"
              maxLength={5}
              style={{
                width: '100%',
                padding: '8px',
                border: dateError ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            />
            {dateError && (
              <div style={{
                marginTop: '4px',
                fontSize: '11px',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <AlertCircle size={12} />
                {dateError}
              </div>
            )}
            <div style={{
              marginTop: '4px',
              fontSize: '10px',
              color: '#6b7280',
              fontStyle: 'italic'
            }}>
              Format: DD/MM (e.g., 23/06 for June 23rd)
            </div>
          </div>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={handleAddTile}
        disabled={!selectedTile || (selectedTile === 'clubcard' && dateError)}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: (selectedTile && !(selectedTile === 'clubcard' && dateError)) ? '#00539F' : '#9ca3af',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: (selectedTile && !(selectedTile === 'clubcard' && dateError)) ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (selectedTile && !(selectedTile === 'clubcard' && dateError)) {
            e.target.style.backgroundColor = '#003d7a';
          }
        }}
        onMouseLeave={(e) => {
          if (selectedTile && !(selectedTile === 'clubcard' && dateError)) {
            e.target.style.backgroundColor = '#00539F';
          }
        }}
      >
        <DollarSign size={16} />
        Add Tile to Canvas (Top-Right, Locked)
      </button>
    </div>
  );
}

export default ValueTileSelector;