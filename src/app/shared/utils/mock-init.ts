// Initialize mock mode based on environment
export function initializeMockMode(): void {
  // Check if running in mock mode
  const urlParams = new URLSearchParams(window.location.search);
  const isMockMode = urlParams.get('mock') === 'true' || 
                     localStorage.getItem('MOCK_MODE') === 'true' ||
                     (window as any).__MOCK_SERVER__ === 'true'; // This will be set by webpack DefinePlugin if needed
  
  if (isMockMode) {
    (window as any).__MOCK_MODE__ = true;
    (window as any).__MOCK_REGISTRY__ = { services: {}, endpoints: [] };
    
    console.log(`
╔═══════════════════════════════════════════════════════╗
║               MOCK MODE ACTIVATED                      ║
╠═══════════════════════════════════════════════════════╣
║  Services decorated with @MockedService will use      ║
║  mock data from http://localhost:3001                 ║
║                                                        ║
║  To disable: Remove ?mock=true from URL or           ║
║  localStorage.removeItem('MOCK_MODE')                 ║
╚═══════════════════════════════════════════════════════╝
    `);
  }
}

// Helper to toggle mock mode
export function toggleMockMode(enable?: boolean): void {
  if (enable === undefined) {
    enable = !(window as any).__MOCK_MODE__;
  }
  
  if (enable) {
    localStorage.setItem('MOCK_MODE', 'true');
  } else {
    localStorage.removeItem('MOCK_MODE');
  }
  
  // Reload to apply changes
  window.location.reload();
}