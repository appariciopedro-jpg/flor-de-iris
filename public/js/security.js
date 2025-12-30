// ============================================
// UTILITÁRIOS DE SEGURANÇA
// ============================================

/**
 * Proteção contra XSS - Sanitiza entrada HTML
 */
function sanitizeHTML(input) {
  if (typeof input !== 'string') return input;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Validação de email
 */
function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

/**
 * Validação de telefone brasileiro
 */
function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
}

/**
 * Validação de CEP
 */
function validateCEP(cep) {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
}

/**
 * Validação de CPF
 */
function validateCPF(cpf) {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false; // Todos dígitos iguais
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
}

/**
 * Validação de URL
 */
function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Limitar tamanho de string
 */
function limitString(str, maxLength = 1000) {
  if (typeof str !== 'string') return str;
  return str.substring(0, maxLength);
}

/**
 * Validar número dentro de um intervalo
 */
function validateNumberRange(value, min = 0, max = Infinity) {
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

/**
 * Detectar padrões suspeitos (possível injeção)
 */
function detectSuspiciousPatterns(input) {
  if (typeof input !== 'string') return false;
  
  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick=, onload=, etc
    /eval\(/gi,
    /expression\(/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Remover caracteres especiais perigosos
 */
function removeDangerousChars(input) {
  if (typeof input !== 'string') return input;
  
  // Remove null bytes e caracteres de controle
  return input.replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Validação de entrada de formulário completa
 */
function validateFormInput(input, options = {}) {
  const {
    type = 'text',
    required = false,
    minLength = 0,
    maxLength = 1000,
    pattern = null,
  } = options;
  
  // Verificar se é obrigatório
  if (required && (!input || input.trim() === '')) {
    return { valid: false, error: 'Campo obrigatório' };
  }
  
  if (!input) {
    return { valid: true, value: '' };
  }
  
  // Sanitizar
  let sanitized = removeDangerousChars(input.trim());
  
  // Detectar padrões suspeitos
  if (detectSuspiciousPatterns(sanitized)) {
    return { valid: false, error: 'Entrada contém padrões não permitidos' };
  }
  
  // Limitar tamanho
  sanitized = limitString(sanitized, maxLength);
  
  // Verificar tamanho mínimo
  if (sanitized.length < minLength) {
    return { valid: false, error: `Mínimo de ${minLength} caracteres` };
  }
  
  // Validações específicas por tipo
  switch (type) {
    case 'email':
      if (!validateEmail(sanitized)) {
        return { valid: false, error: 'Email inválido' };
      }
      break;
    
    case 'phone':
      if (!validatePhone(sanitized)) {
        return { valid: false, error: 'Telefone inválido' };
      }
      break;
    
    case 'cep':
      if (!validateCEP(sanitized)) {
        return { valid: false, error: 'CEP inválido' };
      }
      break;
    
    case 'cpf':
      if (!validateCPF(sanitized)) {
        return { valid: false, error: 'CPF inválido' };
      }
      break;
    
    case 'url':
      if (!validateURL(sanitized)) {
        return { valid: false, error: 'URL inválida' };
      }
      break;
    
    case 'number':
      const num = parseFloat(sanitized);
      if (isNaN(num)) {
        return { valid: false, error: 'Número inválido' };
      }
      sanitized = num;
      break;
  }
  
  // Validação customizada com regex
  if (pattern && !pattern.test(sanitized)) {
    return { valid: false, error: 'Formato inválido' };
  }
  
  return { valid: true, value: sanitized };
}

/**
 * Gerar token seguro
 */
function generateSecureToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Verificar força de senha
 */
function checkPasswordStrength(password) {
  const strength = {
    score: 0,
    feedback: [],
  };
  
  if (password.length >= 8) strength.score++;
  else strength.feedback.push('Use pelo menos 8 caracteres');
  
  if (/[a-z]/.test(password)) strength.score++;
  else strength.feedback.push('Use letras minúsculas');
  
  if (/[A-Z]/.test(password)) strength.score++;
  else strength.feedback.push('Use letras maiúsculas');
  
  if (/[0-9]/.test(password)) strength.score++;
  else strength.feedback.push('Use números');
  
  if (/[^a-zA-Z0-9]/.test(password)) strength.score++;
  else strength.feedback.push('Use caracteres especiais');
  
  if (password.length >= 12) strength.score++;
  
  return strength;
}

/**
 * Rate limiting no lado do cliente
 */
class ClientRateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }
  
  canProceed(key) {
    const now = Date.now();
    
    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }
    
    const attempts = this.attempts.get(key);
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }
  
  reset(key) {
    this.attempts.delete(key);
  }
}

// Exportar funções
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sanitizeHTML,
    validateEmail,
    validatePhone,
    validateCEP,
    validateCPF,
    validateURL,
    limitString,
    validateNumberRange,
    detectSuspiciousPatterns,
    removeDangerousChars,
    validateFormInput,
    generateSecureToken,
    checkPasswordStrength,
    ClientRateLimiter,
  };
}
