const MdParser = (function()
{
    const MARKERS =
    {
        bold: '**',
        italic: '*',
        strike: '~~',
        underline: '__'
    };

    const order =
    [
        { type: 'bold', marker: MARKERS.bold },
        { type: 'underline', marker: MARKERS.underline },
        { type: 'strike', marker: MARKERS.strike },
        { type: 'italic', marker: MARKERS.italic }
    ];

    function getMarkerIndex(text, marker)
    {
        if (marker === '*')
        {
            const match = text.match(/(?<!\*)\*(?!\*)/);
            return match ? match.index : -1;
        }
        return text.indexOf(marker);
    }

    function serialize(plainText, formattingMeta)
    {
        let result = plainText;
        const sortedMeta = [...formattingMeta].sort((a, b) => b.end - a.end || b.start - a.start);
        
        for (const tag of sortedMeta)
        {
            const marker = MARKERS[tag.type];
            result = result.slice(0, tag.end)   + marker + result.slice(tag.end);
            result = result.slice(0, tag.start) + marker + result.slice(tag.start);
        }

        return result;
    }

    function deserialize(mdString)
    {
        let text = mdString;
        const meta = [];

        for (const item of order)
        {
            const type      = item.type;
            const marker    = item.marker;
            const markerLen = marker.length;

            while (true)
            {
                const start = getMarkerIndex(text, marker);
                if (start === -1) break;
                text = text.slice(0, start) + text.slice(start + markerLen);

                const end = getMarkerIndex(text, marker);
                if (end === -1) break;
                text = text.slice(0, end) + text.slice(end + markerLen);

                meta.push({ type, start, end });
            }
        }

        return { plainText: text, formattingMeta: meta };
    }

    return { serialize, deserialize };
})();
