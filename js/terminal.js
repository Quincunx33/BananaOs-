// Terminal functionality
function initTerminal(windowElement) {
  const terminalInput = windowElement.querySelector('#terminal-input');
  const terminalOutput = windowElement.querySelector('#terminal-output');
  
  // Add welcome message
  const welcomeMessage = document.createElement('div');
  welcomeMessage.className = 'mb-2';
  welcomeMessage.textContent = 'Welcome to 🍌Banana OS Terminal';
  terminalOutput.appendChild(welcomeMessage);
  
  const helpMessage = document.createElement('div');
  helpMessage.className = 'mb-2';
  helpMessage.textContent = "Type 'help' for available commands";
  terminalOutput.appendChild(helpMessage);
  
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const command = terminalInput.value.trim();
      terminalInput.value = '';
      
      if (command) {
        // Add command to output
        const prompt = document.createElement('div');
        prompt.className = 'flex mb-2';
        prompt.innerHTML = `
                    <span class="terminal-prompt">user@🍌Banana OS:~$</span>
                    <span>${command}</span>
                `;
        terminalOutput.appendChild(prompt);
        
        // Process command
        const output = processCommand(command);
        if (output) {
          const outputDiv = document.createElement('div');
          outputDiv.className = 'mb-2';
          outputDiv.textContent = output;
          terminalOutput.appendChild(outputDiv);
        }
        
        // Scroll to bottom
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
      }
    }
  });
  
  // Focus input
  terminalInput.focus();
}

function processCommand(command) {
  if (!command) return '';
  
  const commands = {
    'help': `Available commands:
help - Show this help
clear - Clear terminal
echo [text] - Print text
date - Show current date
neofetch - Show system info`,
    'clear': () => {
      const terminalOutput = document.getElementById('terminal-output');
      if (terminalOutput) {
        terminalOutput.innerHTML = '';
        return '';
      }
    },
    'echo': (args) => args.join(' '),
    'date': () => new Date().toString(),
    'neofetch': `🍌Banana OS v1.0
----------------
OS: 🍌Banana OS
Kernel: JavaScript
Shell: Web Terminal
Resolution: ${window.innerWidth}x${window.innerHeight}
Theme: Dark
Icons: Font Awesome`
  };
  
  const parts = command.split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  if (commands[cmd]) {
    if (typeof commands[cmd] === 'function') {
      return commands[cmd](args);
    }
    return commands[cmd];
  }
  
  return `Command not found: ${cmd}. Type 'help' for available commands.`;
}

// Make functions globally available
window.initTerminal = initTerminal;
window.processCommand = processCommand;