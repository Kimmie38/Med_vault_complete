// Client-side id generator used while there is no database. MySQL AUTO_INCREMENT replaces this later.
export const uid = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
