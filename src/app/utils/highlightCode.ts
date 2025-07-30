// Simple syntax highlighter for JSX/React code
export function highlightCode(code: string): string {
  // Keywords
  code = code.replace(/\b(import|export|from|const|let|var|function|return|if|else|for|while|class|extends|default|new|typeof|instanceof|try|catch|finally|throw|async|await)\b/g, '<span class="text-purple-400">$1</span>');
  
  // React/JSX specific
  code = code.replace(/\b(React|useState|useEffect|useRef|useMemo|useCallback)\b/g, '<span class="text-blue-400">$1</span>');
  
  // Strings
  code = code.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-green-400">$&</span>');
  
  // Numbers
  code = code.replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>');
  
  // Comments
  code = code.replace(/(\/\/.*$)/gm, '<span class="text-gray-500">$1</span>');
  code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500">$1</span>');
  
  // JSX tags
  code = code.replace(/(<\/?[\w\s="/.':;#-\/\?]+>)/gi, (match) => {
    // Tag names
    match = match.replace(/(<\/?)(\w+)/g, '$1<span class="text-red-400">$2</span>');
    // Attributes
    match = match.replace(/(\w+)=/g, '<span class="text-yellow-400">$1</span>=');
    return match;
  });
  
  return code;
}