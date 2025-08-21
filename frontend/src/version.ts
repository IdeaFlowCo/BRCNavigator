// Auto-generated version info
export const VERSION_INFO = {
    buildTime: new Date().toISOString(),
    mobileFix: 'v10',
    breakpoint: 768,
    description: 'Mobile-specific sticky header fixes with proper z-index',
    lastCommit: '9b311bc', // Update this with each significant change
    features: [
        'Mobile media query for sticky header',
        'Min-height for table body to ensure sticky works',
        'Z-index 101 for sticky column header (above regular header)',
        'Position relative on data-table for sticky context',
        'Webkit prefix preserved for iOS',
        'Table structure optimized for sticky positioning'
    ]
};