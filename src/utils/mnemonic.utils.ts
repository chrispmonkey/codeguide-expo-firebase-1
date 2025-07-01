import { 
  generateMnemonic as bip39Generate, 
  validateMnemonic as bip39Validate,
  mnemonicToSeed,
  mnemonicToSeedSync,
  wordlists
} from 'bip39';

// Supported mnemonic strengths (bits of entropy)
export enum MnemonicStrength {
  TWELVE_WORDS = 128,  // 12 words
  FIFTEEN_WORDS = 160, // 15 words  
  EIGHTEEN_WORDS = 192, // 18 words
  TWENTY_ONE_WORDS = 224, // 21 words
  TWENTY_FOUR_WORDS = 256  // 24 words
}

// Supported languages for mnemonic wordlists
export enum MnemonicLanguage {
  ENGLISH = 'english',
  JAPANESE = 'japanese',
  CHINESE_SIMPLIFIED = 'chinese_simplified',
  CHINESE_TRADITIONAL = 'chinese_traditional',
  FRENCH = 'french',
  ITALIAN = 'italian',
  KOREAN = 'korean',
  SPANISH = 'spanish'
}

interface MnemonicInfo {
  mnemonic: string;
  strength: MnemonicStrength;
  wordCount: number;
  language: MnemonicLanguage;
  entropy: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  wordCount?: number;
  strength?: MnemonicStrength;
}

export class MnemonicUtils {
  /**
   * Generate a new BIP-39 compliant mnemonic
   */
  static generateMnemonic(
    strength: MnemonicStrength = MnemonicStrength.TWELVE_WORDS,
    language: MnemonicLanguage = MnemonicLanguage.ENGLISH
  ): MnemonicInfo {
    try {
      const wordlist = this.getWordlist(language);
      const mnemonic = bip39Generate(strength, undefined, wordlist);
      
      return {
        mnemonic,
        strength,
        wordCount: mnemonic.split(' ').length,
        language,
        entropy: this.mnemonicToEntropy(mnemonic)
      };
    } catch (error) {
      console.error('Error generating mnemonic:', error);
      throw new Error('Failed to generate mnemonic phrase');
    }
  }

  /**
   * Validate a mnemonic phrase
   */
  static validateMnemonic(
    mnemonic: string,
    language: MnemonicLanguage = MnemonicLanguage.ENGLISH
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: []
    };

    try {
      // Basic format checks
      const trimmedMnemonic = mnemonic.trim();
      
      if (!trimmedMnemonic) {
        result.errors.push('Mnemonic phrase cannot be empty');
        return result;
      }

      const words = trimmedMnemonic.split(/\s+/);
      const wordCount = words.length;
      
      // Check word count
      const validWordCounts = [12, 15, 18, 21, 24];
      if (!validWordCounts.includes(wordCount)) {
        result.errors.push(`Invalid word count: ${wordCount}. Must be 12, 15, 18, 21, or 24 words`);
      }

      // Check for empty words
      if (words.some(word => !word.trim())) {
        result.errors.push('Mnemonic contains empty words');
      }

      // If basic checks fail, return early
      if (result.errors.length > 0) {
        return result;
      }

      // Validate with BIP-39
      const wordlist = this.getWordlist(language);
      const isValidBip39 = bip39Validate(trimmedMnemonic, wordlist);
      
      if (!isValidBip39) {
        result.errors.push('Invalid BIP-39 mnemonic phrase');
        return result;
      }

      // If we reach here, the mnemonic is valid
      result.isValid = true;
      result.wordCount = wordCount;
      result.strength = this.wordCountToStrength(wordCount);

      return result;

    } catch (error) {
      console.error('Error validating mnemonic:', error);
      result.errors.push('Validation failed due to an internal error');
      return result;
    }
  }

  /**
   * Convert mnemonic to seed (asynchronous)
   */
  static async mnemonicToSeed(
    mnemonic: string,
    passphrase: string = ''
  ): Promise<Buffer> {
    try {
      const validation = this.validateMnemonic(mnemonic);
      if (!validation.isValid) {
        throw new Error(`Invalid mnemonic: ${validation.errors.join(', ')}`);
      }

      return await mnemonicToSeed(mnemonic, passphrase);
    } catch (error) {
      console.error('Error converting mnemonic to seed:', error);
      throw new Error('Failed to convert mnemonic to seed');
    }
  }

  /**
   * Convert mnemonic to seed (synchronous)
   */
  static mnemonicToSeedSync(
    mnemonic: string,
    passphrase: string = ''
  ): Buffer {
    try {
      const validation = this.validateMnemonic(mnemonic);
      if (!validation.isValid) {
        throw new Error(`Invalid mnemonic: ${validation.errors.join(', ')}`);
      }

      return mnemonicToSeedSync(mnemonic, passphrase);
    } catch (error) {
      console.error('Error converting mnemonic to seed (sync):', error);
      throw new Error('Failed to convert mnemonic to seed');
    }
  }

  /**
   * Get mnemonic information
   */
  static getMnemonicInfo(mnemonic: string): MnemonicInfo | null {
    try {
      const validation = this.validateMnemonic(mnemonic);
      if (!validation.isValid) {
        return null;
      }

      return {
        mnemonic: mnemonic.trim(),
        strength: validation.strength!,
        wordCount: validation.wordCount!,
        language: MnemonicLanguage.ENGLISH, // Default, could be enhanced to detect
        entropy: this.mnemonicToEntropy(mnemonic)
      };
    } catch (error) {
      console.error('Error getting mnemonic info:', error);
      return null;
    }
  }

  /**
   * Normalize mnemonic phrase (trim, lowercase, single spaces)
   */
  static normalizeMnemonic(mnemonic: string): string {
    return mnemonic
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  /**
   * Split mnemonic into words array
   */
  static mnemonicToWords(mnemonic: string): string[] {
    return this.normalizeMnemonic(mnemonic).split(' ');
  }

  /**
   * Join words array into mnemonic string
   */
  static wordsToMnemonic(words: string[]): string {
    return words
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length > 0)
      .join(' ');
  }

  /**
   * Check if two mnemonics are equivalent
   */
  static areMnemonicsEquivalent(mnemonic1: string, mnemonic2: string): boolean {
    const normalized1 = this.normalizeMnemonic(mnemonic1);
    const normalized2 = this.normalizeMnemonic(mnemonic2);
    return normalized1 === normalized2;
  }

  /**
   * Get wordlist for specified language
   */
  private static getWordlist(language: MnemonicLanguage): string[] {
    switch (language) {
      case MnemonicLanguage.ENGLISH:
        return wordlists.english;
      case MnemonicLanguage.JAPANESE:
        return wordlists.japanese;
      case MnemonicLanguage.CHINESE_SIMPLIFIED:
        return wordlists.chinese_simplified;
      case MnemonicLanguage.CHINESE_TRADITIONAL:
        return wordlists.chinese_traditional;
      case MnemonicLanguage.FRENCH:
        return wordlists.french;
      case MnemonicLanguage.ITALIAN:
        return wordlists.italian;
      case MnemonicLanguage.KOREAN:
        return wordlists.korean;
      case MnemonicLanguage.SPANISH:
        return wordlists.spanish;
      default:
        return wordlists.english;
    }
  }

  /**
   * Convert word count to strength enum
   */
  private static wordCountToStrength(wordCount: number): MnemonicStrength {
    switch (wordCount) {
      case 12: return MnemonicStrength.TWELVE_WORDS;
      case 15: return MnemonicStrength.FIFTEEN_WORDS;
      case 18: return MnemonicStrength.EIGHTEEN_WORDS;
      case 21: return MnemonicStrength.TWENTY_ONE_WORDS;
      case 24: return MnemonicStrength.TWENTY_FOUR_WORDS;
      default: return MnemonicStrength.TWELVE_WORDS;
    }
  }

  /**
   * Convert mnemonic to entropy (placeholder implementation)
   */
  private static mnemonicToEntropy(mnemonic: string): string {
    // This is a simplified implementation
    // In a full implementation, you'd extract the actual entropy from the mnemonic
    return 'entropy_placeholder';
  }
} 