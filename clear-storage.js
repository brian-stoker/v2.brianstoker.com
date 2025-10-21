// Run this script in the browser console to clear localStorage
// and fix the QuotaExceededError

console.log('Current localStorage usage:');
let totalSize = 0;
for (let key in localStorage) {
  const item = localStorage.getItem(key);
  const itemSize = new Blob([item]).size;
  totalSize += itemSize;
  console.log(`  ${key}: ${(itemSize / 1024).toFixed(2)} KB`);
}
console.log(`Total localStorage usage: ${(totalSize / 1024).toFixed(2)} KB`);

// Clear the github_events cache
if (localStorage.getItem('github_events')) {
  console.log('\nClearing github_events cache...');
  localStorage.removeItem('github_events');
  console.log('✓ github_events cache cleared');
}

// Clear other potential large items
const keysToRemove = ['github_events_cache', 'github_filters', 'github_events_old'];
keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✓ ${key} cleared`);
  }
});

console.log('\nStorage cleared successfully. Refresh the page to reload events.');