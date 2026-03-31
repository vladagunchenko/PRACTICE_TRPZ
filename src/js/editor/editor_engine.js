const EditorEngine = (function()
{
    const HTML_TAGS =
    {
        bold: { open: '<b>', close: '</b>' },
        italic: { open: '<i>', close: '</i>' },
        strike: { open: '<del>', close: '</del>' },
        underline: { open: '<u>', close: '</u>' }
    };

    let state =
    {
        plainText: '',
        formattingMeta: []
    };

    function renderHTML()
    {
        let html = state.plainText;
        const sortedMeta = [...state.formattingMeta].sort((a, b) => b.end - a.end || b.start - a.start);
        
        for (const tag of sortedMeta)
        {
            const format = HTML_TAGS[tag.type];
            html = html.slice(0, tag.end)   + format.close + html.slice(tag.end);
            html = html.slice(0, tag.start) + format.open  + html.slice(tag.start);
        }

        return html;
    }

    function load(text, meta)
    {
        state.plainText = text;
        state.formattingMeta = meta;
    }

    function getState()
    { return state; }

    function applyFormat(type, start, end)
    {
        if (start === end) return;
        state.formattingMeta.push({ type, start, end });
    }

    function shiftMeta(cursorPosition, delta)
    {
        for (let tag of state.formattingMeta)
        {
            if (tag.start >= cursorPosition) tag.start += delta;
            if (tag.end   >= cursorPosition) tag.end   += delta;
        }
    }

    return { renderHTML, load, getState, applyFormat, shiftMeta };
})();
