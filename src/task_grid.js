function addTaskCard() {
    let grid = document.querySelector('.task-grid-container');
    if (!grid) return;
    let newCard = document.createElement('div');
    
    newCard.className = "task-card";
    
    newCard.innerHTML = `sdfg`;
    
    grid.appendChild(newCard);
}