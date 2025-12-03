export const ZONES = [
    { id: 'indoor', name: 'ห้องแอร์' },
    { id: 'outdoor', name: 'ระเบียงสวน' },
];

export const TABLES = [
    // Indoor Zone
    { id: 'T-01', name: 'T-01', zone: 'indoor', status: 'available' },
    { id: 'T-02', name: 'T-02', zone: 'indoor', status: 'occupied' }, // ไม่ว่าง
    { id: 'T-03', name: 'T-03', zone: 'indoor', status: 'available' },
    { id: 'T-04', name: 'T-04', zone: 'indoor', status: 'available' },
    { id: 'T-05', name: 'T-05', zone: 'indoor', status: 'available' },
    { id: 'T-06', name: 'T-06', zone: 'indoor', status: 'available' },

    // Outdoor Zone
    { id: 'O-01', name: 'O-01', zone: 'outdoor', status: 'available' },
    { id: 'O-02', name: 'O-02', zone: 'outdoor', status: 'available' },
    { id: 'O-03', name: 'O-03', zone: 'outdoor', status: 'available' },
    { id: 'O-04', name: 'O-04', zone: 'outdoor', status: 'available' },
];