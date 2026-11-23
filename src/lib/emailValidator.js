/**
 * ELVANY — SECURE CLIENT EMAIL VALIDATOR
 * Protects against temporary, disposable, burner, and malformed email addresses
 * ensuring reliable delivery of electronic invoices, order tracking, and atelier passports.
 */

// Comprehensive directory of known disposable, temporary, and burner email domains
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  // Mailinator & derivatives
  'mailinator.com', 'mailinator2.com', 'mailin8r.com', 'mailinator.net', 'suremail.info',
  'spamherelots.com', 'binkmail.com', 'bobmail.info', 'chammy.info', 'devnullmail.com',
  'letthemeatspam.com', 'mailinater.com', 'mailhazard.com', 'mailslurp.com',

  // Temp-Mail & derivatives
  'temp-mail.org', 'tempmail.com', 'tempmailo.com', 'tempmail.net', 'tempmail.plus',
  'tempmailaddress.com', 'tempmailgen.com', 'temp-mail.io', 'tempmailin.com',
  'temp-mails.com', 'tempmailninja.com', 'tempr.email', 'disposablemail.com',

  // 10 Minute Mail & variants
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.co.uk',
  '10minutemail.de', '10minutemailbox.com', '20minutemail.com', 'minuteinbox.com',
  'minutemailbox.com', '10minmail.de',

  // Guerrilla Mail & Sharklasers
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz',
  'guerrillamailblock.com', 'sharklasers.com', 'grr.la', 'pokemail.net', 'spam4.me',
  'guerrillamail.de',

  // YOPmail & derivatives
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.fr.nf',
  'courriel.fr.nf', 'moncourrier.fr.nf', 'monemail.fr.nf', 'monmail.fr.nf',
  'hide.biz.st', 'mytrashmail.com',

  // TrashMail
  'trashmail.com', 'trashmail.net', 'trashmail.me', 'trashmail.org', 'trashmail.ws',
  'trashmail.at', 'trashmail.io', 'rcpt.at', 'damnthespam.com',

  // ThrowAway & Dispostable
  'throwawaymail.com', 'throwawayemailaddress.com', 'dispostable.com', 'disposable.com',
  'disposableinbox.com', 'throwaway.email',

  // Nada / GetNada
  'getnada.com', 'nada.ltd', 'nada.email', 'inboxbear.com', 'dropmail.me',
  'inboxkitten.com', 'airmail.cc',

  // FakeInbox & Burner
  'fakeinbox.com', 'fakemailgenerator.com', 'generator.email', 'burnermail.io',
  'burnermiler.com', 'mohmal.com', 'mohmal.im', 'mohmal.tech', 'emailondeck.com',
  'crazymailing.com', 'crazymail.com', 'mytemp.email', 'maildrop.cc',

  // Other prominent disposable providers
  'armyspy.com', 'cuvox.de', 'dayrep.com', 'fleckens.hu', 'gustr.com',
  'jourrapide.com', 'rhyta.com', 'superrito.com', 'teleworm.us', 'einrot.com',
  'eyepaste.com', 'inoutbox.com', 'klzlk.com', 'mailcatch.com', 'mailforspam.com',
  'mailnull.com', 'spambog.com', 'spamgourmet.com', 'spamex.com', 'trbvm.com',
  'vomoto.com', 'yapped.net', 'zetmail.com', 'zoemail.org', 'safetymail.info',
  'boun.cr', 'incognitomail.org', 'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org',
  'drdrb.com', 'easytrashmail.com', 'emailproxsy.com', 'filzmail.com', 'gishpuppy.com',
  'tmailor.com', 'tmail.io', 'clipmail.eu', 'luxusmail.org', 'mailnesia.com',
  'meltmail.com', 'trashymail.com', 'harakirimail.com', 'anonymbox.com',
  'my10minutemail.com', 'deadaddress.com', 'emailfake.com', 'crazymailing.com',
  'tempinbox.com', 'getairmail.com', 'mohmal.in', 'fakemail.net', 'inboxalias.com'
]);

// Substring keywords that identify dynamic or new disposable email services
const DISPOSABLE_KEYWORDS = [
  'tempmail',
  'temp-mail',
  '10minute',
  'throwaway',
  'disposable',
  'trashmail',
  'guerrillamail',
  'mailinator',
  'sharklasers',
  'burnermail',
  'fakemail',
  'fakeinbox',
  'minutemail',
  'emailondeck',
  'getnada',
  'mohmal'
];

// Common accidental typos in prominent consumer mail providers
const DOMAIN_TYPO_MAP = {
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'iclud.com': 'icloud.com'
};

/**
 * Checks if a given email address belongs to a known temporary/disposable service
 * @param {string} email
 * @returns {boolean}
 */
export function isDisposableEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1].trim();

  // 1. Direct domain lookup
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return true;
  }

  // 2. Keyword check on domain (e.g. *.tempmail.xyz, sub.guerrillamail.net)
  for (const keyword of DISPOSABLE_KEYWORDS) {
    if (domain.includes(keyword)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if an email domain appears to be a common misspelling of a major provider
 * @param {string} email
 * @returns {string|null} Suggested domain or null
 */
export function getDomainTypoSuggestion(email) {
  if (!email || typeof email !== 'string') return null;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return null;

  const domain = parts[1].trim();
  return DOMAIN_TYPO_MAP[domain] || null;
}

/**
 * Comprehensive client email validation
 * Checks format, disposable domains, and typos.
 * 
 * @param {string} email
 * @returns {{ isValid: boolean, error?: string, suggestion?: string }}
 */
export function validateClientEmail(email) {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }

  const clean = email.trim();

  // RFC standard syntax regex checking local part and domain structure
  const rfcEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!rfcEmailRegex.test(clean)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
  }

  const parts = clean.toLowerCase().split('@');
  const localPart = parts[0];
  const domain = parts[1];

  // Must have a valid TLD with at least 2 characters
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || /^\d+$/.test(tld)) {
    return { isValid: false, error: 'Email domain has an invalid extension.' };
  }

  // Reject disposable / burner / temporary mail
  if (isDisposableEmail(clean)) {
    return {
      isValid: false,
      error: 'Temporary or disposable email addresses are not permitted. Please use your personal or corporate email to receive your invoice.'
    };
  }

  // Suggest typo correction for known domains
  const suggestedDomain = getDomainTypoSuggestion(clean);
  if (suggestedDomain) {
    return {
      isValid: false,
      error: `Did you mean ${localPart}@${suggestedDomain}? Please verify your email domain.`
    };
  }

  return { isValid: true };
}
