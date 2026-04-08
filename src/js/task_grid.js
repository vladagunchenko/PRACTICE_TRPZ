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
    
     applyLang(localStorage.getItem('lang') || 'ENG');
    taskEmptyText();
}

let todayTask = false;

function renderTodayGrid()
{
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    if (todayTask) {
        document.querySelectorAll('.task-card').forEach(card => {
            card.style.display = '';
        });
        todayTask = false;
        return;
    }

    document.querySelectorAll('.task-card').forEach(card => {
    const dueDate = card.querySelector('.time-card').value || '';
    if (dueDate !== '' && dueDate.slice(0, 10) !== todayStr) {
        card.style.display = 'none';
    }
});
todayTask = true;
}

function addTaskCard()
{ TaskEditor.open(null, '', '', '', EditorMode.EDITOR); }

document.querySelector('.overlay').addEventListener('click', (event) =>
{ if (event.target === event.currentTarget) TaskEditor.close(); });

function viewCard(id){
    const allTasks = TaskStore.getAll();
    const rawMarkdown = allTasks.find(t => t.includes(`id: ${id}`));
    if (!rawMarkdown) return;
    const parsed = TaskRenderer.parseFrontmatter(rawMarkdown);
    const lines = parsed.content.split('\n');
    const title = lines[0] ? lines[0].replace('# ', '') : '';
    const body = lines.slice(1).join('\n');
    const dueDate = parsed.metadata.dueDate || '';
    
    TaskEditor.open(id, title, body, dueDate, EditorMode.VIEW);
}

const about_div = document.querySelector('.about_div');

function addCardAbout() {
    about_div.classList.add('active');
}
function closeAbout() {
    about_div.classList.remove('active');
}

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
        return;
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
        const dueDate = parsed.metadata.dueDate || '';
        
        TaskEditor.open(id, title, body, dueDate, EditorMode.EDITOR);
        return; 
    }

    if(event.target.classList.contains('checkbox-card')||
        event.target.classList.contains('time-card')){return;}
    viewCard(id);
});

renderGrid();