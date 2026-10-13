export interface CountryCode {
  name: string;
  code: string;
  flag: string;
  formatPlaceholder: string;
  expectedLength: number;
}

export const COUNTRY_CODES: CountryCode[] = [
  { name: 'India', code: '+91', flag: '🇮🇳', formatPlaceholder: '98765 43210', expectedLength: 10 },
  { name: 'United States', code: '+1', flag: '🇺🇸', formatPlaceholder: '555 123 4567', expectedLength: 10 },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧', formatPlaceholder: '7911 123456', expectedLength: 10 },
  { name: 'Canada', code: '+1', flag: '🇨🇦', formatPlaceholder: '555 123 4567', expectedLength: 10 },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪', formatPlaceholder: '50 123 4567', expectedLength: 9 },
  { name: 'Singapore', code: '+65', flag: '🇸🇬', formatPlaceholder: '8123 4567', expectedLength: 8 },
  { name: 'Australia', code: '+61', flag: '🇦🇺', formatPlaceholder: '412 345 678', expectedLength: 9 },
  { name: 'Germany', code: '+49', flag: '🇩🇪', formatPlaceholder: '151 12345678', expectedLength: 10 },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦', formatPlaceholder: '50 123 4567', expectedLength: 9 },
  { name: 'Malaysia', code: '+60', flag: '🇲🇾', formatPlaceholder: '12 345 6789', expectedLength: 9 },
  { name: 'France', code: '+33', flag: '🇫🇷', formatPlaceholder: '6 12 34 56 78', expectedLength: 9 },
  { name: 'Nepal', code: '+977', flag: '🇳🇵', formatPlaceholder: '984 1234567', expectedLength: 10 },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩', formatPlaceholder: '1712 345678', expectedLength: 10 },
  { name: 'Sri Lanka', code: '+94', flag: '🇱🇰', formatPlaceholder: '71 234 5678', expectedLength: 9 },
  { name: 'Qatar', code: '+974', flag: '🇶🇦', formatPlaceholder: '3312 3456', expectedLength: 8 },
  { name: 'Kuwait', code: '+965', flag: '🇰🇼', formatPlaceholder: '9123 4567', expectedLength: 8 },
  { name: 'Philippines', code: '+63', flag: '🇵🇭', formatPlaceholder: '917 123 4567', expectedLength: 10 },
  { name: 'Indonesia', code: '+62', flag: '🇮🇩', formatPlaceholder: '812 3456 7890', expectedLength: 10 },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬', formatPlaceholder: '802 123 4567', expectedLength: 10 },
  { name: 'Kenya', code: '+254', flag: '🇰🇪', formatPlaceholder: '712 345678', expectedLength: 9 }
];
