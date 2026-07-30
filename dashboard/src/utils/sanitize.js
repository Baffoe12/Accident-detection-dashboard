const xssPatterns = [
  { regex: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, replacement: '' },
  { regex: /<[^>]*>/g, replacement: '' },
  { regex: /javascript\s*:/gi, replacement: '' },
  { regex: /on\w+\s*=\s*["'][^"']*["']/gi, replacement: '' },
  { regex: /on\w+\s*=\s*[^\s>]*/gi, replacement: '' },
];

function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  let sanitized = input;
  for (const pattern of xssPatterns) {
    sanitized = sanitized.replace(pattern.regex, pattern.replacement);
  }
  return sanitized.trim();
}

function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeString(key);
      cleaned[sanitizedKey] = sanitizeObject(value);
    }
    return cleaned;
  }
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  return obj;
}

function sanitizeInput(input) {
  if (typeof input === 'string') {
    return sanitizeString(input);
  }
  if (typeof input === 'object' && input !== null) {
    return sanitizeObject(input);
  }
  return input;
}

export { sanitizeInput, sanitizeString, sanitizeObject };