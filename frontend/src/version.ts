// Auto-generated version info
export const VERSION_INFO = {
    buildTime: new Date().toISOString(),
    mobileFix: 'v12',
    breakpoint: 768,
    description: 'Critical sticky header fix for virtualized table',
    lastCommit: 'c5e0e77', // Update this with each significant change
    features: [
        'Important flags to override virtualization conflicts',
        'Z-index hierarchy: sticky col header (1002) > sticky col (1001) > header (1000)',
        'Contain: strict for performance optimization',
        'Box-shadow on header for visual separation',
        'Height: auto on table-body to fix virtualization',
        'Position absolute with z-index on rows for proper stacking'
    ]
};