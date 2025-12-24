/**
 * Unicode to Bijoy Font Converter
 * This module handles the conversion of Unicode Bangla text to Bijoy font format
 */

const UnicodeToBijoy = (() => {
    // Mapping tables for Unicode to Bijoy conversion
    const conversionMap = {
        // Vowels and vowel signs
        'অ': 'A',
        'আ': 'Av',
        'ই': 'B',
        'ঈ': 'C',
        'উ': 'D',
        'ঊ': 'E',
        'ঋ': 'F',
        'এ': 'G',
        'ঐ': 'H',
        'ও': 'I',
        'ঔ': 'J',
        
        // Consonants
        'ক': 'K',
        'খ': 'L',
        'গ': 'M',
        'ঘ': 'N',
        'ঙ': 'O',
        'চ': 'P',
        'ছ': 'Q',
        'জ': 'R',
        'ঝ': 'S',
        'ঞ': 'T',
        'ট': 'U',
        'ঠ': 'V',
        'ড': 'W',
        'ঢ': 'X',
        'ণ': 'Y',
        'ত': 'Z',
        'থ': '_',
        'দ': '`',
        'ধ': 'a',
        'ন': 'b',
        'প': 'c',
        'ফ': 'd',
        'ব': 'e',
        'ভ': 'f',
        'ম': 'g',
        'য': 'h',
        'র': 'i',
        'ল': 'j',
        'শ': 'k',
        'ষ': 'l',
        'স': 'm',
        'হ': 'n',
        'ড়': 'o',
        'ঢ়': 'p',
        'য়': 'q',
        'ৎ': 'r',
        'ং': 's',
        'ঃ': 't',
        'ঁ': 'u',
        
        // Kar (vowel signs)
        'া': 'v',
        'ি': 'w',
        'ী': 'x',
        'ু': 'y',
        'ূ': 'z',
        'ৃ': '…',
        'ে': '†',
        'ৈ': '‡',
        'ো': '†v',
        'ৌ': '‡v',
        
        // Numbers
        '০': '0',
        '১': '1',
        '২': '2',
        '৩': '3',
        '৪': '4',
        '৫': '5',
        '৬': '6',
        '৭': '7',
        '৮': '8',
        '৯': '9',
        
        // Special characters
        '।': '|',
        '॥': '।।',
        '্': '্',
        'ঀ': '0',
        '঻': '\'',
        '়': '\'',
        'ঽ': '\'',
        '৺': '৺',
        '৻': '৻',
        
        // Ref and Hasant
        '্য': '¨',
        '্র': '্র',
        'র্': '©',
        
        // Common conjuncts
        'ক্ক': '°',
        'ক্ট': '±',
        'ক্ত': '³',
        'ক্র': 'µ',
        'ক্ল': '¶',
        'ক্ষ': '·',
        'ক্স': '¸',
        'গ্ধ': '»',
        'গ্ন': '¼',
        'গ্ম': '½',
        'গ্ল': '¾',
        'গ্র': '¿',
        'ঙ্ক': 'Ä',
        'ঙ্গ': 'Å',
        'চ্চ': 'Ç',
        'চ্ছ': 'È',
        'চ্ঞ': 'É',
        'জ্জ': 'Ê',
        'জ্ঝ': 'Ë',
        'জ্ঞ': 'Ì',
        'ঞ্চ': 'Í',
        'ঞ্ছ': 'Î',
        'ঞ্জ': 'Ï',
        'ঞ্ঝ': 'Ð',
        'ট্ট': 'Ñ',
        'ড্ড': 'Ò',
        'ণ্ট': 'Ó',
        'ণ্ঠ': 'Ô',
        'ণ্ড': 'Õ',
        'ণ্ণ': 'Ö',
        'ত্ত': '™',
        'ত্থ': 'š',
        'ত্ন': '›',
        'ত্ম': 'œ',
        'ত্র': 'Î',
        'দ্দ': '˜',
        'দ্ধ': '™',
        'দ্ব': 'Ø',
        'দ্ম': 'Ù',
        'ধ্ন': 'Ú',
        'ধ্ম': 'Û',
        'ন্ট': 'Ü',
        'ন্ঠ': 'Ý',
        'ন্ড': 'Þ',
        'ন্ত': 'ß',
        'ন্থ': 'à',
        'ন্দ': 'á',
        'ন্ধ': 'â',
        'ন্ন': 'ã',
        'ন্ম': 'ä',
        'প্ট': 'å',
        'প্ত': 'ß',
        'প্ন': 'প্ন',
        'প্প': 'ç',
        'প্ল': 'è',
        'প্স': 'é',
        'ব্জ': 'ê',
        'ব্দ': 'ë',
        'ব্ধ': 'ì',
        'ব্ব': 'í',
        'ব্ল': 'î',
        'ভ্র': 'ï',
        'ম্ন': 'ð',
        'ম্প': 'ñ',
        'ম্ফ': 'ò',
        'ম্ব': 'ó',
        'ম্ভ': 'ô',
        'ম্ম': 'õ',
        'ম্ল': 'ö',
        'ল্ক': '÷',
        'ল্গ': 'ø',
        'ল্ট': 'ù',
        'ল্ড': 'ú',
        'ল্প': 'û',
        'ল্ফ': 'ü',
        'ল্ব': 'ý',
        'ল্ম': 'þ',
        'ল্ল': 'ÿ',
        'শ্চ': 'Š',
        'শ্ছ': '¢',
        'শ্ন': '£',
        'শ্ম': '¤',
        'শ্র': '¥',
        'শ্ল': '¦',
        'ষ্ক': '®',
        'ষ্ট': '¯',
        'ষ্ঠ': '°',
        'ষ্ণ': '±',
        'ষ্প': '²',
        'ষ্ফ': '³',
        'ষ্ম': '´',
        'স্ক': 'µ',
        'স্ট': '¶',
        'স্ত': '·',
        'স্থ': '¸',
        'স্ন': '¹',
        'স্প': 'º',
        'স্ফ': '»',
        'স্ম': '¼',
        'স্ল': '½',
        'হ্ণ': '¾',
        'হ্ন': '¿',
        'হ্ম': 'À',
        'হ্র': 'Á',
        'হ্ল': 'Â',
        'ক্ষ্ণ': 'Ã',
        'ক্ষ্ম': 'Ä',
        'ঙ্ক্ষ': 'Å',
        'ঙ্খ': 'Æ',
        'ঙ্গ্য': 'Ç',
        'ঙ্ঘ': 'È',
        'ঞ্জ্য': 'É',
        'ঞ্ঝ্য': 'Ê',
        'ণ্ড্য': 'Ë',
        'ত্ত্ব': 'Ì',
        'ত্ত্য': 'Í',
        'ত্থ্য': 'Î',
        'ত্ন্য': 'Ï',
        'ত্ম্য': 'Ð',
        'ত্র্য': 'Ñ',
        'দ্দ্ব': 'Ò',
        'দ্ধ্ব': 'Ó',
        'দ্ব্য': 'Ô',
        'দ্ভ্র': 'Õ',
        'ধ্ন্য': 'Ö',
        'ধ্ম্য': '×',
        'ন্ট্র': 'Ø',
        'ন্ত্র': 'Ù',
        'ন্ত্য': 'Ú',
        'ন্থ্র': 'Û',
        'ন্দ্য': 'Ü',
        'ন্দ্র': 'Ý',
        'ন্ধ্য': 'Þ',
        'ন্ধ্র': 'ß',
        'প্ট্য': 'à',
        'প্ত্য': 'á',
        'প্ল্য': 'â',
        'প্স্য': 'ã',
        'ব্জ্য': 'ä',
        'ব্দ্য': 'å',
        'ব্ধ্য': 'æ',
        'ভ্র্য': 'ç',
        'ম্প্র': 'è',
        'ম্ভ্র': 'é',
        'ল্ক্য': 'ê',
        'ল্গ্য': 'ë',
        'ল্প্য': 'ì',
        'ল্ম্য': 'í',
        'শ্চ্য': 'î',
        'শ্ছ্য': 'ï',
        'ষ্ক্র': 'ð',
        'ষ্ট্য': 'ñ',
        'ষ্ট্র': 'ò',
        'ষ্ঠ্য': 'ó',
        'ষ্ণ্য': 'ô',
        'ষ্প্র': 'õ',
        'ষ্ম্য': 'ö',
        'স্ক্র': '÷',
        'স্ত্রী': '¯¿x',
        'স্ত্র': '¯¿',
        'স্ত্য': 'ù',
        'স্থ্য': 'ú',
        'স্প্র': 'û',
        'স্প্ল': 'ü',
        'স্ফ্র': 'ý',
        'স্ম্য': 'þ',
        'হ্ণ্য': 'ÿ',
        'হ্ন্য': 'Ā',
        'হ্ম্য': 'ā',
        'হ্র্য': 'Ă'
    };

    /**
     * Convert Unicode Bangla text to Bijoy format
     * @param {string} unicodeText - The Unicode Bangla text to convert
     * @returns {string} - The converted Bijoy text
     */
    function convert(unicodeText) {
        if (!unicodeText || typeof unicodeText !== 'string') {
            return '';
        }

        let bijoyText = unicodeText;
        
        // Sort keys by length (longest first) to handle conjuncts properly
        const sortedKeys = Object.keys(conversionMap).sort((a, b) => b.length - a.length);
        
        // Replace each Unicode character/sequence with its Bijoy equivalent
        for (const unicodeChar of sortedKeys) {
            const bijoyChar = conversionMap[unicodeChar];
            // Use global regex to replace all occurrences
            const regex = new RegExp(unicodeChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            bijoyText = bijoyText.replace(regex, bijoyChar);
        }
        
        // Handle i-kar (ি) reordering - in Bijoy, i-kar comes before the consonant
        // In Unicode: consonant + ি, In Bijoy: w + consonant
        // Match any Bijoy consonant character followed by 'w' and swap them
        bijoyText = bijoyText.replace(/([K-Z_`a-z])w/g, 'w$1');
        
        return bijoyText;
    }

    /**
     * Reverse conversion - Bijoy to Unicode (basic implementation)
     * @param {string} bijoyText - The Bijoy text to convert
     * @returns {string} - The converted Unicode text
     */
    function reverseConvert(bijoyText) {
        if (!bijoyText || typeof bijoyText !== 'string') {
            return '';
        }

        // Create reverse mapping
        const reverseMap = {};
        for (const [unicode, bijoy] of Object.entries(conversionMap)) {
            reverseMap[bijoy] = unicode;
        }

        let unicodeText = bijoyText;
        
        // Sort keys by length (longest first)
        const sortedKeys = Object.keys(reverseMap).sort((a, b) => b.length - a.length);
        
        // Handle i-kar (w) reordering - in Bijoy, w comes before the consonant
        // We need to swap it back: w + consonant -> consonant + w
        // Before mapping, w is just 'w'.
        // Match 'w' followed by any Bijoy consonant character
        bijoyText = bijoyText.replace(/w([K-Z_`a-z])/g, '$1w');

        // Replace each Bijoy character/sequence with its Unicode equivalent
        for (const bijoyChar of sortedKeys) {
            const unicodeChar = reverseMap[bijoyChar];
            const regex = new RegExp(bijoyChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            unicodeText = unicodeText.replace(regex, unicodeChar);
        }
        
        return unicodeText;
    }

    // Public API
    return {
        convert,
        reverseConvert
    };
})();

// ES Module exports for React/Vite
export const unicodeToBijoy = UnicodeToBijoy.convert;
export const bijoyToUnicode = UnicodeToBijoy.reverseConvert;
export default UnicodeToBijoy;