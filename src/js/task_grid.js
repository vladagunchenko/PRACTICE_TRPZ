const taskgrid = document.getElementById('task-grid');

function renderGrid()
{
    taskgrid.innerHTML = '';
    const allTasks = TaskStore.getAll(); 
    allTasks.forEach(mdString =>
    {
        const card = TaskRenderer.renderCard(mdString);
        taskgrid.appendChild(card);
    });

    taskEmptyText();
}

function addTaskCard() { TaskEditor.open(); }

function taskEmptyText()
{
    const taskEmpty = document.querySelector('[data-task-empty]');
    if (!taskEmpty) return;

    const taskItems = document.getElementById('task-grid').querySelectorAll('[data-task]');
    
    if (taskItems.length > 0) taskEmpty.classList.add('none');
    else taskEmpty.classList.remove('none');
}

taskgrid.addEventListener('click', (event) =>
{
    const card = event.target.closest('.task-card');
    if (!card) return;
    const id = card.getAttribute('data-id');

    if (event.target.classList.contains('btn-delete'))
    {
        TaskStore.remove(id);
        card.remove();
        taskEmptyText();
    }

    if (event.target.classList.contains('btn-edit'))
    {
    const card = event.target.closest('.task-card');
    const id = card.getAttribute('data-id');
    const allTasks = TaskStore.getAll();
    const rawMarkdown = allTasks.find(t => t.includes(`id: ${id}`));
    if (!rawMarkdown) return;
    const parsed = TaskRenderer.parseFrontmatter(rawMarkdown);
    const lines = parsed.content.split('\n');
    const title = lines[0] ? lines[0].replace('# ', '') : '';
    const body = lines.slice(1).join('\n');

    TaskEditor.open(id, title, body);
    }
});

renderGrid();