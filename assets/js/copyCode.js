document.addEventListener('DOMContentLoaded', () => {
    const copyButtons = document.querySelectorAll('.copy-code-button');
    
    copyButtons.forEach(button => {
      button.addEventListener('click', () => {
        const codeBlock = button.closest('.code-block');
        const code = codeBlock.querySelector('code').innerText;
        const originalText = button.innerText;
        
        navigator.clipboard.writeText(code);
        button.innerText = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
          button.innerText = originalText;
          button.classList.remove('copied');
        }, 2000);
      });
    });
  });