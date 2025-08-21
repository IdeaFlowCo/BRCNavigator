// Auto-generated version info
export const VERSION_INFO = {
    buildTime: new Date().toISOString(),
    mobileFix: 'v9',
    breakpoint: 768,
    description: 'Fixed sticky header with webkit prefix for iOS',
    lastCommit: '1fbe70b', // Update this with each significant change
    features: [
        'Sticky header with -webkit-sticky for iOS support',
        'Higher z-index (100) for header to stay on top',
        'will-change: transform for better performance',
        'Table forced to 1200px width on mobile',
        'Both vertical (sticky header) and horizontal scrolling work',
        'Sticky actions column also has webkit prefix'
    ]
};