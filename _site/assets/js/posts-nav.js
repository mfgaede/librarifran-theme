document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.nav__item');
  const views = document.querySelectorAll('.taxonomy__index');
  
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      buttons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      
      // Show selected view
      const viewId = `${button.dataset.view}-view`;
      views.forEach(view => {
        view.classList.add('hidden');
        if (view.id === viewId) {
          view.classList.remove('hidden');
        }
      });
    });
  });
});