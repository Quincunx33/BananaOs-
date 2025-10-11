// Calculator functionality
function initCalculator(windowElement) {
  let currentInput = '0';
  let previousInput = '';
  let operation = null;
  let shouldResetScreen = false;
  
  const display = windowElement.querySelector('#calc-display');
  
  function updateDisplay() {
    display.textContent = currentInput;
  }
  
  function appendNumber(number) {
    if (currentInput === '0' || shouldResetScreen) {
      currentInput = number;
      shouldResetScreen = false;
    } else {
      currentInput += number;
    }
  }
  
  function chooseOperation(op) {
    if (operation !== null) calculate();
    previousInput = currentInput;
    operation = op;
    shouldResetScreen = true;
  }
  
  function calculate() {
    let computation;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    
    if (isNaN(prev) || isNaN(current)) return;
    
    switch (operation) {
      case 'add':
        computation = prev + current;
        break;
      case 'subtract':
        computation = prev - current;
        break;
      case 'multiply':
        computation = prev * current;
        break;
      case 'divide':
        computation = prev / current;
        break;
      default:
        return;
    }
    
    currentInput = computation.toString();
    operation = null;
    previousInput = '';
  }
  
  function clear() {
    currentInput = '0';
    previousInput = '';
    operation = null;
  }
  
  windowElement.querySelectorAll('.calculator-button').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-calc');
      
      if (!isNaN(action) || action === 'decimal') {
        if (action === 'decimal') {
          if (shouldResetScreen) {
            currentInput = '0.';
            shouldResetScreen = false;
          } else if (!currentInput.includes('.')) {
            currentInput += '.';
          }
        } else {
          appendNumber(action);
        }
        updateDisplay();
        return;
      }
      
      switch (action) {
        case 'clear':
          clear();
          break;
        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
          chooseOperation(action);
          break;
        case 'equals':
          calculate();
          shouldResetScreen = true;
          break;
      }
      
      updateDisplay();
    });
  });
  
  updateDisplay();
}