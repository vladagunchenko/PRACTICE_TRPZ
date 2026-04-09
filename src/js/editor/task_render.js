const TaskRenderer = (function()
{
    function parseFrontmatter(mdString)
    {
        const match = mdString.match(/^---\n([\s\S]*?)\n---/);
        if (!match) return { metadata: {}, content: mdString };

        const rawMeta = match[1];
        const content = mdString.slice(match[0].length).trim();
        const metadata = {};

        rawMeta.split('\n').forEach(line =>
        {
            const index = line.indexOf(': ');
            if (index !== -1) {
                const key = line.substring(0, index).trim();
                const value = line.substring(index + 2).trim();
                metadata[key] = value;
            }
        });
        
        return { metadata, content };
    }

    function renderCard(mdString)
    {
        const parsed = parseFrontmatter(mdString);
        const lines = parsed.content.split('\n');
        const taskColor = parsed.metadata.color || '#7A6ED6';
        const title = lines[0] ? lines[0].replace('# ', '') : 'Task name';
        let description = lines.slice(1);
        let formattedDescription = description.map(line =>
        {
            let cleanLine = line.trim();
            if (cleanLine.startsWith('- ')) cleanLine = '&nbsp;&nbsp;• ' + cleanLine.substring(2);
            
            cleanLine = cleanLine.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            cleanLine = cleanLine.replace(/__(.*?)__/g, '<u>$1</u>');
            cleanLine = cleanLine.replace(/\*(.*?)\*/g, '<i>$1</i>');
            cleanLine = cleanLine.replace(/~~(.*?)~~/g, '<del>$1</del>');

            return cleanLine;
        }).join('<br>');

        const isChecked = parsed.metadata.status === 'completed' ? 'checked' : '';
        const dueDate = parsed.metadata.dueDate || '';

        const card = document.createElement('div');
        card.className = 'task-card';
        card.id = `task-${parsed.metadata.id}`;
        card.style.viewTransitionName = `taskcard-${parsed.metadata.id}`;
        card.style.setProperty('--current-task-color', taskColor);
        card.setAttribute('data-task', '');
        card.setAttribute('data-id', parsed.metadata.id);
        card.style.setProperty('--current-task-color', taskColor);
        
        card.innerHTML = `
            <div class="card-color-line"></div>

            <div class="time-badge-wrapper">
                <div class="task-dot"></div>
                <input type="datetime-local" class="time-card" value="${dueDate}" onclick="viewCard('${parsed.metadata.id}')" readonly />
            </div>
            
            <input type="checkbox" class="checkbox-card" ${isChecked} />
            <p class="text-title" data-lang="titletask">${title}</p>
            <p class="text-body" data-lang="bodytask">${formattedDescription}</p>
            <div class="card-bth">
                <p class="btn-edit" data-lang="edittask">Edit</p>
                <p class="btn-delete" data-lang="archivetask">Archive</p>
            </div>
        `;

        return card;
    }

    return { renderCard, parseFrontmatter };
})();