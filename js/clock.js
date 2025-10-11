// Update clock
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
  
  document.getElementById('clock-time').textContent = time;
  document.getElementById('clock-date').textContent = date;
}

setInterval(updateClock, 1000);
updateClock();