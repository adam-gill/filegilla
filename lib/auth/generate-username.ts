export const generateUsername = (name: string) => {
    const base = name.toLowerCase().replace(/\s+/g, '');
    const random = Math.floor(Math.random() * 10000);
    return `${base}${random}`;
}; 