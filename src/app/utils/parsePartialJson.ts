// Helper function to extract JSON fields from partial JSON string
export function extractPartialJsonFields(partialJson: string): {
  thought?: string;
  action?: string;
  code?: string;
  final_answer?: string;
} {
  const result: any = {};
  
  // Helper to unescape JSON string values
  const unescapeJsonString = (str: string): string => {
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  };
  
  // Helper to extract a field value, handling nested quotes and escapes
  const extractField = (fieldName: string, json: string): string | undefined => {
    // Look for the field name and opening quote
    const fieldStart = json.indexOf(`"${fieldName}"`);
    if (fieldStart === -1) return undefined;
    
    // Find the colon and opening quote of the value
    let valueStart = json.indexOf(':', fieldStart) + 1;
    if (valueStart === 0) return undefined;
    
    // Skip whitespace
    while (json[valueStart] === ' ' || json[valueStart] === '\n' || json[valueStart] === '\r' || json[valueStart] === '\t') {
      valueStart++;
    }
    
    if (json[valueStart] !== '"') return undefined;
    valueStart++; // Skip the opening quote
    
    // Find the closing quote, handling escapes
    let valueEnd = valueStart;
    let escaped = false;
    while (valueEnd < json.length) {
      if (!escaped && json[valueEnd] === '"') {
        return unescapeJsonString(json.substring(valueStart, valueEnd));
      }
      escaped = !escaped && json[valueEnd] === '\\';
      valueEnd++;
    }
    
    // If we're still accumulating this field, check if we have a partial value
    // This allows progressive display of long fields like thoughts
    const partialValue = json.substring(valueStart);
    if (partialValue.length > 0) {
      // Return partial value, removing any trailing backslash
      return unescapeJsonString(partialValue.replace(/\\$/, ''));
    }
    
    return undefined;
  };
  
  // Extract each field
  result.thought = extractField('thought', partialJson);
  result.action = extractField('action', partialJson);
  result.final_answer = extractField('final_answer', partialJson);
  result.code = extractField('code', partialJson) || extractField('react_code', partialJson);
  
  return result;
}