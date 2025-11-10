import React from 'react';

const PeriodicTable: React.FC = () => {
    return (
        <div className="w-full h-full bg-card rounded-b-lg overflow-hidden">
            <iframe
                src="https://artsexperiments.withgoogle.com/periodic-table/?exp=true&lang=vi"
                className="w-full h-full border-0"
                title="Bảng tuần hoàn các nguyên tố hóa học - Google Arts & Culture"
                loading="lazy"
            ></iframe>
        </div>
    );
};

export default PeriodicTable;