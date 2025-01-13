/**
 * @description: 单词项的类
 * @return {*}
 */
import { getTextImageData,getColor } from "./utils";

export default class WordItem {
    constructor({ text, weight, fontStyle, color, space, rotate, colorList }) {
        // 文本
        this.text = text;
        // 权重
        this.weight = weight;
        // 字体样式
        this.fontStyle = fontStyle;
        // 文字颜色
        this.color = color || getColor(colorList);
        // 文字之间的间距
        this.space = space;
        // 旋转角度
        this.rotate = rotate;
        // 文本像素数据
        this.imageData = getTextImageData({
            text,
            fontStyle,
            space: this.space,
            rotate: this.rotate,
        });

        // 文本包围框的宽高
        this.width = this.imageData.width
        this.height = this.imageData.height

        this.left = 0
        this.top = 0

    }
}