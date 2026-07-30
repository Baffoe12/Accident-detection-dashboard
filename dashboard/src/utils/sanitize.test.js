import { sanitizeInput, sanitizeString, sanitizeObject } from '../utils/sanitize';

describe('sanitizeInput', () => {
  test('removes script tags from strings', () => {
    const input = '<script>alert("xss")</script>';
    const result = sanitizeInput(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
  });

  test('removes HTML tags from strings', () => {
    const input = '<b>bold</b> text';
    const result = sanitizeInput(input);
    expect(result).toBe('bold text');
  });

  test('removes javascript: URLs from strings', () => {
    const input = 'javascript:alert(1)';
    const result = sanitizeInput(input);
    expect(result).not.toContain('javascript:');
  });

  test('removes event handler attributes', () => {
    const input = '<div onclick="evil()">content</div>';
    const result = sanitizeInput(input);
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('evil');
  });

  test('returns non-string values unchanged', () => {
    expect(sanitizeInput(42)).toBe(42);
    expect(sanitizeInput(null)).toBeNull();
    expect(sanitizeInput(undefined)).toBeUndefined();
    expect(sanitizeInput(true)).toBe(true);
  });

  test('recursively sanitizes objects', () => {
    const input = { name: '<script>bad</script>', nested: { value: 'safe' } };
    const result = sanitizeInput(input);
    expect(result.name).toBe('bad');
    expect(result.nested.value).toBe('safe');
  });

  test('recursively sanitizes arrays', () => {
    const input = ['<script>bad</script>', 'clean'];
    const result = sanitizeInput(input);
    expect(result[0]).toBe('bad');
    expect(result[1]).toBe('clean');
  });
});

describe('sanitizeString', () => {
  test('removes script tags', () => {
    expect(sanitizeString('<script>alert(1)</script>')).toBe('');
  });

  test('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });
});