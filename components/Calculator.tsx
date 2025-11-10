
import React from 'react';

const Calculator: React.FC = () => {
    return (
        <div className="w-full h-full bg-card rounded-b-lg overflow-hidden">
            <iframe
                src="https://www.desmos.com/scientific?lang=vi"
                className="w-full h-full border-0"
                title="Máy tính khoa học Desmos"
            ></iframe>
        </div>
    );
};

export default Calculator;