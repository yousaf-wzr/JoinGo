// src/constants/fonts.ts
type FontStyles = {
    regular: string;
    medium: string;
    bold: string;
    size: {
      small: number;
      medium: number;
      large: number;
      title: number;
    };
  };
  
  const FONTS: FontStyles = {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    bold: 'Poppins-Bold',
    size: {
      small: 12,
      medium: 16,
      large: 20,
      title: 28,
    },
  };
  
  export default FONTS;
  