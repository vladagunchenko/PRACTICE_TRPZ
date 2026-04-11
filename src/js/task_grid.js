const GridViewMode =
{
    ALL_CARDS: 'allCards',
    ALL_CALENDAR: 'allCalendar',
    DONE: 'done',
    TODAY: 'today',
    ARCHIVE: 'archive'
};

let curGridViewMode = GridViewMode.ALL_CARDS;
let previousBaseMode = GridViewMode.ALL_CARDS;

function setGridViewMode(mode)
{
    if ((mode === GridViewMode.TODAY || mode === GridViewMode.DONE) && curGridViewMode === mode) curGridViewMode = previousBaseMode;
    else
    {
        if (curGridViewMode === GridViewMode.ALL_CARDS || curGridViewMode === GridViewMode.ALL_CALENDAR) previousBaseMode = curGridViewMode;
        if (curGridViewMode === GridViewMode.ARCHIVE && (mode === GridViewMode.TODAY || mode === GridViewMode.DONE)) previousBaseMode = GridViewMode.ALL_CARDS;

        curGridViewMode = mode;
    }
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

    if (curGridViewMode === GridViewMode.ALL_CALENDAR)
    {
        taskgrid.innerHTML = `календарне подання`;
        taskEmptyText()
        return;
    }
        
    const allTasks = TaskStore.getAll();

    let parsedTasks = allTasks.map(mdString =>
    ({
        raw: mdString,
        meta: TaskRenderer.parseFrontmatter(mdString).metadata
    }));

    const offset = new Date().getTimezoneOffset() * 60000;
    const localTodayStr = new Date(Date.now() - offset).toISOString().slice(0, 10);

    parsedTasks = parsedTasks.filter(task =>
    {
        const status = task.meta.status || 'new';
        const archived = task.meta.archived === 'true' || status === 'archive' || status === 'archived';
        const taskDate = task.meta.dueDate ? task.meta.dueDate.slice(0, 10) : '';

        switch (curGridViewMode)
        {
            case GridViewMode.ALL_CARDS:
                return !archived;

            case GridViewMode.TODAY:
                return taskDate === localTodayStr && !archived;

            case GridViewMode.DONE:
                return status === 'completed' && !archived;

            case GridViewMode.ARCHIVE:
                return archived;

            default:
                return true;
        }
    });

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

        const archived = taskObj.meta.archived === 'true';
        const completed = taskObj.meta.status === 'completed';

        if (archived)
        {
            card.style.opacity = '0.5';
            
            const btnDelete = card.querySelector('.btn-delete');
            const btnEdit = card.querySelector('.btn-edit');

            if (btnDelete)
            {
                btnDelete.setAttribute('data-lang', 'deletetask')
                btnDelete.innerText = 'Delete';
            }

            if (btnEdit)
            {
                btnEdit.setAttribute('data-lang', 'unarchivetask')
                btnEdit.innerText = 'Unarchive';
            }
        }
        else if (completed) card.style.opacity = '0.5';

        taskgrid.appendChild(card);

    });
    
    applyLang(localStorage.getItem('lang') || 'ENG');
    taskEmptyText();
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
    const archived = parsed.metadata.archived || 'false';

    TaskEditor.open(id, title, body, dueDate, mode, taskColor, taskStatus, archived);
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
            if (curGridViewMode === GridViewMode.ARCHIVE) TaskStore.remove(id);
            else
            {
                const allTasks = TaskStore.getAll();
                const rawMarkdown = allTasks.find(t => t.includes(`id: ${id}`));

                if (rawMarkdown)
                {
                    let newMd;
                    
                    if (/^archived:/m.test(rawMarkdown)) newMd = rawMarkdown.replace(/^archived:.*$/m, `archived: true`);
                    else newMd = rawMarkdown.replace(/^---\n/, `---\narchived: true\n`);
                    newMd = newMd.replace(/^status:\s*archive.*$/m, 'status: new');
                    TaskStore.update(id, newMd);
                }
            }

            sortGrid();
        }, 300);
        
        return;
    }

    if (event.target.classList.contains('btn-edit'))
    {
        if (curGridViewMode === GridViewMode.ARCHIVE)
        {
            const allTasks = TaskStore.getAll();
            const rawMarkdown = allTasks.find(t => t.includes(`id: ${id}`));

            if (rawMarkdown)
            {
                let newMd = rawMarkdown;

                if (/^archived:/m.test(newMd)) newMd = newMd.replace(/^archived:.*$/m, `archived: false`);
                
                newMd = newMd.replace(/^status:\s*archive.*$/m, 'status: new');
                TaskStore.update(id, newMd);
                sortGrid();
            }

            return;
        }

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

        setTimeout(() => sortGrid(), 2000);
    }
});

renderGrid();