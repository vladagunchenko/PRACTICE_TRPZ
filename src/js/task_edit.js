const TaskEditor = (function() {
    const overlay = document.getElementById('editor-overlay');
    const titleInput = document.getElementById('editor-title');
    const contentArea = document.getElementById('editor-area');
    const timeInput = document.getElementById('editor-time');
    const editorMode = document.getElementById('editor-mode');

    let currentId = null;

    const Converter =
    {
        toHTML: function(md)
        {
            if (!md) return '';
            let html = md;

            html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            html = html.replace(/__(.*?)__/g, '<u>$1</u>');
            html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');

            html = html.replace(/(?:^- (.*)(?:\n|$))+/gm, match =>
            {
                let items = match.trim().split('\n').map(l => `<li>${l.substring(2)}</li>`).join('');
                return `<ul>${items}</ul>`;
            });

            html = html.replace(/\n/g, '<br>');
            return html;
        },
        toMD: function(html)
        {
            if (!html) return '';
            let md = html;

            md = md.replace(/<div><br><\/div>/gi, '\n');
            md = md.replace(/<div>/gi, '\n');
            md = md.replace(/<\/div>/gi, '');
            md = md.replace(/<p>/gi, '\n');
            md = md.replace(/<\/p>/gi, '');
            md = md.replace(/<br>/gi, '\n');

            md = md.replace(/<ul>/gi, '\n');
            md = md.replace(/<\/ul>/gi, '\n');
            md = md.replace(/<li>(.*?)<\/li>/gi, '- $1\n');

            md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
            md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
            md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
            md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
            md = md.replace(/<u>(.*?)<\/u>/gi, '__$1__');

            return md.replace(/\n{3,}/g, '\n\n').trim(); 
        }
    };

    function applyFormat(command)
    {
        document.execCommand(command, false, null);
        contentArea.focus();
    }

    document.getElementById('btn-bold').addEventListener('click', () => applyFormat('bold'));
    document.getElementById('btn-italic').addEventListener('click', () => applyFormat('italic'));
    document.getElementById('btn-underline').addEventListener('click', () => applyFormat('underline'));
    document.getElementById('btn-list').addEventListener('click', () => applyFormat('insertUnorderedList'));
    document.getElementById('btn-import').addEventListener('click', () => fileInput.click());
    document.getElementById('btn-export').addEventListener('click', () =>
    {
        const title = titleInput.value.trim() || 'task';
        const rawHTML = contentArea.innerHTML;
        const mdContent = Converter.toMD(rawHTML);
        const id = currentId || Date.now();
        const dueDate = timeInput.value || '';

        const md = 
`---
id: ${id}
status: new
dueDate: ${dueDate}
---
# ${title}
${mdContent}`;

        const safeName = title.replace(/[^a-zA-ZА-ЯҐЄІЇа-яґєії0-9 _-]/g, '').trim() || 'task';
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeName}.md`;
        a.click();
        URL.revokeObjectURL(url);
    });

    function open(id = null, title = '', content = '', dueDate = '')
    {
        
        currentId = id;
        if (id === null) editorMode.setAttribute('data-lang', 'addtask');
        else editorMode.setAttribute('data-lang', 'edittask');
        applyLang(localStorage.getItem('lang') || 'ENG');
        
        titleInput.value = title;
        timeInput.value = dueDate;
        contentArea.innerHTML = Converter.toHTML(content);
        
        overlay.classList.remove('none');
        overlay.classList.add('active');
    }

    function close()
    {
        overlay.classList.add('none');
        overlay.classList.remove('active');
        currentId = null;
        titleInput.value = '';
        timeInput.value = ''; 
        contentArea.innerHTML = '';
    }

    function save()
    {
        const savedLang = localStorage.getItem('lang') || 'ENG';
        const title = titleInput.value.trim() || translations[savedLang].untitled;
        const rawHTML = contentArea.innerHTML;
        const mdContent = Converter.toMD(rawHTML) || translations[savedLang].nocontent;

        const id = currentId || Date.now();
        const now = new Date();
        const dueDate = timeInput.value || new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        
        const newMd = 
`---
id: ${id}
status: new
dueDate: ${dueDate}
---
# ${title}
${mdContent}`;

        if (currentId) TaskStore.update(id, newMd);
        else TaskStore.add(newMd);

        close();
        if (typeof renderGrid === 'function') renderGrid();
    }
    
    document.getElementById('editor-save').addEventListener('click', save);
    document.getElementById('editor-cancel').addEventListener('click', close);
    

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.md';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    fileInput.addEventListener('change', (e) =>
    {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (ev) =>
        {
            const importedMd = ev.target.result;

            if (typeof TaskRenderer !== 'undefined')
            {
                const parsed = TaskRenderer.parseFrontmatter(importedMd);
                const lines = parsed.content.split('\n');
                
                titleInput.value = lines[0] ? lines[0].replace('# ', '') : '';
                timeInput.value = parsed.metadata.dueDate || '';
                const body = lines.slice(1).join('\n');
                contentArea.innerHTML = Converter.toHTML(body);
            }
        };
        reader.readAsText(file);
        fileInput.value = '';
    });
    
    return { open, close, save };
})();