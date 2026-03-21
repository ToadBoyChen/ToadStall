export function getCleanExcerpt(data: any): string {
    if (!data) return '';
    
    let textString = '';
    
    if (typeof data === 'string') {
        textString = data;
    } else if (Array.isArray(data)) {
        textString = data
            .map((block: any) => block.children?.map((child: any) => child.text).join('') || '')
            .join(' ');
    }

    return textString
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/#{1,6}\s/g, '')
        .replace(/^\s*>+\s?/gm, '')
        .replace(/(\*\*|__|\*|_|`|~)/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}