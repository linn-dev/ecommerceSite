import React from 'react';

const GlassButton = ({ children, onClick, className = "" }) => {
    return (
        <>
            {/* SVG Filter ကို UI မှာ မမြင်ရအောင် သိမ်းထားပါမယ် */}
            <svg style={{ display: 'none' }}>
                <filter id="displacementFilter">
                    <feTurbulence
                        type="turbulence"
                        baseFrequency="0.01"
                        numOctaves="2"
                        result="turbulence"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="turbulence"
                        scale="200"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </svg>

            <button
                onClick={onClick}
                className={`glass-button-style ${className}`}
            >
                <span className="relative z-10">{children}</span>
            </button>
        </>
    );
};

export default GlassButton;