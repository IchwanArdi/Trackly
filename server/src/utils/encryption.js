import bcrypt from 'bcrypt';

// fungsi untuk mengubah password tesk biasa menjadi hash (saat register)
export const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// fungsi untuk mencocokkan password login dengan yang ada di database
export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};