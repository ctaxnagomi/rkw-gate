import React from 'react';

const Scanlines: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 crt">
      <div className="scanline"></div>
    </div>
  );
};

export default Scanlines;