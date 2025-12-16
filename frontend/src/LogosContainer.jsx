import React from 'react';

const HeaderLogos = () => {
    return (
        // The container uses the class for horizontal display
        <div className="header-logos-container">
            {/* Logo 1: DOST-STII */}
            <img 
                src="https://raw.githubusercontent.com/Marianne-101/pictures/main/dost-stii-logo.png" 
                alt="DOST-STII Logo" 
                className="header-logo-item"
            />
            {/* Logo 2: DOST-STII Library */}
            <img 
                src="https://raw.githubusercontent.com/Marianne-101/pictures/main/dost-stii-library-logo.png" 
                alt="DOST-STII Library Logo" 
                className="header-logo-item"
            />
            {/* Logo 3: NU Logo */}
            <img 
                src="https://raw.githubusercontent.com/Marianne-101/pictures/main/nu-logo.png" 
                alt="NU Logo" 
                className="header-logo-item"
            />
            {/* 🔑 ADDED: Asia Pacific College Logo is now included */}
            <img 
                src="https://raw.githubusercontent.com/Marianne-101/pictures/main/asia-pacific-college-logo.jpg" 
                alt="Asia Pacific College Logo" 
                className="header-logo-item"
            />
        </div>
    );
};

export default HeaderLogos;