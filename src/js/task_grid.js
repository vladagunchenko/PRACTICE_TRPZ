const GridViewMode =
{
    ALL_CARDS: 'allCards',
    ALL_CALENDAR: 'allCalendar',
    DONE: 'done',
    TODAY: 'today',
    ARCHIVE: 'archive'
};

let curGridViewMode;

function setGridViewMode(mode)
{
    curGridViewMode = mode;
    sortGrid();
}

const taskgrid = document.getElementById('task-grid');

function sortGrid()
{
    if (document.startViewTransition) document.startViewTransition(() => renderGrid());
    else renderGrid();
}

function renderGrid(freshCardID = null)
{
    taskgrid.innerHTML = '';
    const allTasks = TaskStore.getAll();

    const parsedTasks = allTasks.map(mdString =>
    ({
        raw: mdString,
        meta: TaskRenderer.parseFrontmatter(mdString).metadata
    }));

    parsedTasks.sort((a, b) =>
    {
        const completedA = a.meta.status === 'completed';
        const completedB = b.meta.status === 'completed';

        if (completedA !== completedB) return completedA ? 1 : -1;

        const dateA = a.meta.dueDate ? new Date(a.meta.dueDate).getTime() : Number(a.meta.id);
        const dateB = b.meta.dueDate ? new Date(b.meta.dueDate).getTime() : Number(b.meta.id);

        return dateB - dateA;
    });

    parsedTasks.forEach(taskObj =>
    {
        const card = TaskRenderer.renderCard(taskObj.raw);
        if (card.getAttribute('data-id') === String(freshCardID)) card.classList.add('animate-in');
        if (taskObj.meta.status === 'completed') card.style.opacity = '0.5';
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

function renderCompletedGrid(id)
{
    const card = document.querySelector(`.task-card[data-id="${id}"]`);
    const checkbox = document.querySelector(`.task-card[data-id="${id}"] .checkbox-card`);
    if (!card) return;
    if(checkbox.checked){
    card.style.opacity = '0.4';
    }
    else if(!checkbox.checked){
        card.style.opacity = '';
    }
}

function completedTask(id) {
    renderCompletedGrid(id);
}
let done = false;

function DoneTask() {
    if (done) {
        document.querySelectorAll('.task-card').forEach(card => {
            card.style.display = '';
        });
        done = false;
        return;
    }

    document.querySelectorAll('.task-card').forEach(card => {
        const checkbox = card.querySelector('.checkbox-card');
        if (!checkbox.checked) {
            card.style.display = 'none';
        }
    });
    done = true;
}


function addTaskCard()
{ TaskEditor.open(null, '', '', '', EditorMode.EDITOR); }

document.querySelector('.overlay').addEventListener('click', (event) =>
{ if (event.target === event.currentTarget) TaskEditor.close(); });

function openTaskCard(id, mode)
{
    const allTasks = TaskStore.getAll();
    const rawMarkdown = allTasks.find(t => t.includes(`id: ${id}`));
    if (!rawMarkdown) return;
    const parsed = TaskRenderer.parseFrontmatter(rawMarkdown);
    const lines = parsed.content.split('\n');
    const title = lines[0] ? lines[0].replace('# ', '') : '';
    const body = lines.slice(1).join('\n');
    const dueDate = parsed.metadata.dueDate || '';
    const taskColor = parsed.metadata.color || '#7A6ED6';
    const taskStatus = parsed.metadata.status || 'new';
    TaskEditor.open(id, title, body, dueDate, mode, taskColor, taskStatus);
}

function viewCard(id)
{ openTaskCard(id, EditorMode.VIEW); }

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
        card.classList.add('animate-out');

        setTimeout(() =>
        {
            TaskStore.remove(id);
            if (document.startViewTransition)
            {
                document.startViewTransition(() =>
                {
                    card.remove();
                    taskEmptyText();
                });
            }
            else
            {
                card.remove();
                taskEmptyText();
            }
        }, 300);
        
        return;
    }

    if (event.target.classList.contains('btn-edit'))
    {
        openTaskCard(id, EditorMode.EDITOR);
        return;
    }

    if(event.target.classList.contains('checkbox-card')||
        event.target.classList.contains('time-card')){return;}
    viewCard(id);
});

taskgrid.addEventListener('change', (event) => {
    if (event.target.classList.contains('checkbox-card')) {
        const card = event.target.closest('.task-card');
        const id = card.getAttribute('data-id');
        const isChecked = event.target.checked;
        const newStatus = isChecked ? 'completed' : 'new';
        const allTasks = TaskStore.getAll();
        const rawMarkdown = allTasks.find(t => t.includes(`id: ${id}`));
        if (!rawMarkdown) return;

        let newMd;
        if (/^status:/m.test(rawMarkdown)) newMd = rawMarkdown.replace(/^status:.*$/m, `status: ${newStatus}`);
        else newMd = rawMarkdown.replace(/^---\n/, `---\nstatus: ${newStatus}\n`);
        
        TaskStore.update(id, newMd);
    }
});

renderGrid();