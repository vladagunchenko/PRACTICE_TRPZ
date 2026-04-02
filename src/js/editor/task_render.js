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

        const title = lines[0] ? lines[0].replace('# ', '') : 'Task name';
        let description = lines.slice(1);
        let formattedDescription = description.map(line =>
        {
            let cleanLine = line.trim();
            if (cleanLine.startsWith('- ')) cleanLine = '• ' + cleanLine.substring(2);

            return cleanLine.replaceAll('**', '').replaceAll('__', '').replaceAll('~~', '').replaceAll('*', '');
        }).join('<br>');

        const isChecked = parsed.metadata.status === 'completed' ? 'checked' : '';
        const dueDate = parsed.metadata.dueDate || '';

        const card = document.createElement('div');
        card.className = 'task-card';
        card.id = `task-${parsed.metadata.id}`;
        card.setAttribute('data-task', '');
        card.setAttribute('data-id', parsed.metadata.id);
        
        card.innerHTML = `
            <input type="datetime-local" class="time-card" value="${dueDate}" readonly />
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