const TaskEditor = (function()
{
    const overlay = document.getElementById('editor-overlay');
    const titleInput = document.getElementById('editor-title');
    const contentArea = document.getElementById('editor-area');
    let currentId = null;

    function open(id = null, title = '', content = '')
    {
        currentId = id;
        titleInput.value = title;
        const deserialized = MdParser.deserialize(content);
        EditorEngine.load(deserialized.plainText, deserialized.formattingMeta);
        contentArea.innerText = deserialized.plainText;
        overlay.classList.remove('none');
    }

    function close()
    {
        overlay.classList.add('none');
        currentId = null;
        titleInput.value = '';
        contentArea.innerText = '';
    }

    function save()
    {
        const title = titleInput.value.trim() || 'Untitled Task';
        const content = contentArea.innerText;
        const id = currentId || Date.now();
        const newMd =
`---
id: ${id}
status: new
dueDate:
---
# ${title}
${content}`;

        if (currentId) TaskStore.update(id, newMd);
        else TaskStore.add(newMd);

        close();
        if (typeof renderGrid === 'function') renderGrid();
    }
    
    document.getElementById('editor-save').addEventListener('click', save);

    return { open, close, save };
})();
