import React, { useEffect, useState } from 'react';

const Test: React.FC<{ text?: string }> = ({ text ="test" }) => {
    console.log('test');
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'black' }}>
            {text}
        </div>
    );
};

export default Test;