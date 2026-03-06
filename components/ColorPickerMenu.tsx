import React, { useState } from 'react';
import { Dialog, DialogTrigger, Button, Popover, Input, Label, TextField } from 'react-aria-components';
import { HexColorPicker } from 'react-colorful';
import { Pencil, ChevronLeft } from 'lucide-react';
import { SystemicModal } from './SystemicModal';

export interface ColorPickerMenuProps {
    name: string;
    seed: string;
    onUpdate: (newName: string, newSeed: string) => void;
    isDarkMode?: boolean;
    // For global colors that shouldn't have their name changed (like Neutral), or if you want to lock it
    isNameEditable?: boolean;
    // For letting the user pick from other existing colors in the system
    existingColors?: { id: string; name: string; seed: string; themeName?: string }[];
}

export const ColorPickerMenu: React.FC<ColorPickerMenuProps> = ({
    name,
    seed,
    onUpdate,
    isDarkMode = false,
    isNameEditable = true,
    existingColors = []
}) => {
    // Local state for the popover so we can cancel/save
    const [tempName, setTempName] = useState(name);
    const [tempSeed, setTempSeed] = useState(seed);

    // Sync local state when popover opens, in case it was changed externally
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setTempName(name);
            setTempSeed(seed);
        }
    };

    const handleSave = (close: () => void) => {
        onUpdate(tempName, tempSeed);
        close();
    };

    // Styling constants based on the user's mockup
    const bgColor = isDarkMode ? '#1a1f26' : '#ffffff';
    const textColor = isDarkMode ? '#ffffff' : '#000000';
    const borderColor = isDarkMode ? '#333b4d' : '#e2e8f0';
    const inputBg = isDarkMode ? '#252b36' : '#f8fafc';

    return (
        <DialogTrigger onOpenChange={handleOpenChange}>
            <style>{`
                .trigger-btn { transition: all 0.2s ease; }
                .trigger-btn:hover {
                    background: ${isDarkMode ? '#222' : '#f1f5f9'} !important;
                    border-color: ${isDarkMode ? '#666' : '#cbd5e1'} !important;
                }
                .btn-save { transition: color 0.2s ease; color: #60a5fa !important; }
                .btn-save:hover { color: ${isDarkMode ? '#C3E835' : '#0142FE'} !important; }
                
                .btn-cancel { transition: color 0.2s ease; color: ${isDarkMode ? '#aaa' : '#666'} !important; }
                .btn-cancel:hover { color: ${isDarkMode ? '#C3E835' : '#0142FE'} !important; }
            `}</style>
            {/* The Trigger Button (replaces the native color wheel + text input) */}
            <Button
                className="trigger-btn"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'transparent',
                    border: 'none', // Remove solid border, just use background on hover
                    borderRadius: 'var(--geometry-radius-2)',
                    padding: '0.5rem', // Tighter padding to align better with text
                    cursor: 'pointer',
                    color: textColor,
                    width: 'calc(100% + 1rem)', // Expand width slightly to account for negative margin
                    marginLeft: '-0.5rem',      // Pull left so the inner content aligns with the heading above
                    justifyContent: 'space-between'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                        style={{
                            width: '24px', // Slightly smaller swatch
                            height: '24px',
                            backgroundColor: seed,
                            borderRadius: '4px',
                            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' // Add subtle border to swatch itself
                        }}
                    />
                    <span style={{ fontSize: '0.875rem', fontFamily: 'inherit', fontWeight: 500 }}>{seed}</span>
                </div>
                <Pencil className="picker-icon" size={14} strokeWidth={2} style={{ color: isDarkMode ? '#8892b0' : '#64748b' }} />
            </Button>

            <Popover
                placement="start"
                offset={16}
                style={{
                    zIndex: 1000,
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    outline: 'none',
                    // Adding shadow directly to popover helps ensure it's visible if SystemicModal popover variant doesn't have it
                    filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.15))'
                }}
            >
                <SystemicModal variant="popover" isDarkMode={isDarkMode} maxWidth="320px">
                    <Dialog style={{ outline: 'none' }}>
                        {({ close }) => (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {/* Header Navigation */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Button
                                        className="btn-save"
                                        onPress={() => handleSave(close)}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    >
                                        <ChevronLeft size={16} /> Lagre
                                    </Button>
                                    <Button
                                        className="btn-cancel"
                                        onPress={close}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
                                    >
                                        Avbryt
                                    </Button>
                                </div>

                                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Rediger farge</h3>

                                {/* Name Input */}
                                <TextField
                                    value={tempName}
                                    onChange={setTempName}
                                    isReadOnly={!isNameEditable}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}
                                >
                                    <Label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Navn</Label>
                                    <Input
                                        style={{
                                            background: inputBg,
                                            border: `1px solid ${borderColor}`,
                                            color: textColor,
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            fontFamily: 'inherit',
                                            outline: 'none',
                                            opacity: isNameEditable ? 1 : 0.6
                                        }}
                                    />
                                </TextField>

                                {/* Color Picker & Hex */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <Label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Farge</Label>

                                    {/* Giant display swatch from mockup */}
                                    <div style={{ height: '48px', backgroundColor: tempSeed, borderRadius: 'var(--geometry-radius-2)', marginBottom: '0.5rem' }} />

                                    {/* Interactive React Colorful wheel */}
                                    <div className="custom-color-picker" style={{ width: '100%' }}>
                                        <style>{`
                                        .custom-color-picker .react-colorful { width: 100%; height: 180px; }
                                        .custom-color-picker .react-colorful__pointer { width: 16px; height: 16px; }
                                    `}</style>
                                        <HexColorPicker color={tempSeed} onChange={setTempSeed} />
                                    </div>

                                    {/* Hex Input */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0.5rem' }}>
                                        <input
                                            value={tempSeed}
                                            onChange={(e) => setTempSeed(e.target.value)}
                                            style={{
                                                background: inputBg,
                                                border: `1px solid ${borderColor}`,
                                                color: textColor,
                                                padding: '0.5rem',
                                                borderRadius: 'var(--geometry-radius-2)',
                                                fontSize: '0.875rem',
                                                fontFamily: 'monospace',
                                                width: '100%',
                                                textAlign: 'center',
                                                outline: 'none'
                                            }}
                                        />
                                        <span style={{ fontSize: '0.7rem', color: isDarkMode ? '#888' : '#666', marginTop: '0.25rem' }}>HEX</span>
                                    </div>

                                    {/* Existing Colors Palette (if provided) */}
                                    {existingColors.length > 0 && (
                                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${borderColor}` }}>
                                            <Label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Velg fra eksisterende paletter</Label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
                                                {existingColors.map(c => (
                                                    <div
                                                        key={`${c.id}-${c.seed}`}
                                                        onClick={() => setTempSeed(c.seed)}
                                                        title={`${c.name} (${c.themeName || 'Theme'})`}
                                                        style={{
                                                            width: '100%',
                                                            aspectRatio: '1',
                                                            backgroundColor: c.seed,
                                                            borderRadius: 'var(--geometry-radius-2)',
                                                            cursor: 'pointer',
                                                            border: `var(--geometry-borderWidth-default) solid ${borderColor}`,
                                                            outline: tempSeed.toLowerCase() === c.seed.toLowerCase() ? `2px solid ${isDarkMode ? '#fff' : '#000'}` : 'none',
                                                            outlineOffset: '2px'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Dialog>
                </SystemicModal>
            </Popover>
        </DialogTrigger>
    );
};
