export class platte {

    static colors =['#27ae60', '#2980b9', '#8e44ad', '#e74c3c', '#f1c40f', '#f39c12', '#2c3e50'];

    public static getColor(index) {
        if (isNaN(index) || platte.colors.length <= index)
            return platte.getRandomColor();
        return platte.colors[index];
    }
    static getRandomColor() {
        let letters = '0123456789ABCDEF'.split('');
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;

    }
}