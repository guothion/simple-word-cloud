import  WordItem  from "./wordItem.js";
import { getFontSize,getTextBoundingRect} from "./utils.js"
import { addToMap, getPosition, getBoundingRect, clear } from './computed.js'

export default class WordCloud {
    constructor({el,...rest}) {
        console.log(el)
        this.el = el;
        // 更新容器高度
        this.updateElSize();
        // 设置容器的样式
        this.setPositionRelative();
        this.updateOptions(rest);
    }

    // 获取当前的 wrap 尺寸
    updateElSize() {
        const elRect = this.el.getBoundingClientRect();
        console.log(elRect);
        this.elWidth = elRect.width;
        this.elHeight = elRect.height;
        if (this.elWidth <= 0 || this.elHeight <= 0) {
            throw new Error('容器宽高不能为0')
        }
    }
    // 设置 position 样式为 relative 
    setPositionRelative() {
        // 获取当前元素的 position 样式， window.getComputedStyle 方法注意了
        const elPosition = window.getComputedStyle(this.el).position;
        if(elPosition === "static") {
            this.el.style.position = "relative";
        }
    }
    // 更新配置
    updateOptions({
        minFontSize,
        maxFontSize,
        fontFamily,
        fontWeight,
        fontStyle,
        fontSizeScale,
        rotateType,
        space,
        colorList,
        transition,
        smallWeightInCenter,
        onClick
    }) {
        // 字号大小
        this.minFontSize = minFontSize || 30
        this.maxFontSize = maxFontSize || 40
        if (this.maxFontSize < this.minFontSize) {
            throw new Error('maxFontSize不能小于minFontSize')
        }
        // 字体
        this.fontFamily = fontFamily || '微软雅黑, Microsoft YaHei'
        // 加粗
        this.fontWeight = fontWeight || ''
        // 斜体
        this.fontStyle = fontStyle || ''
        // 文字之间的间距，相对于字号，即该值会和字号相乘得到最终的间距
        this.space = space || 0
        // 文字颜色列表
        this.colorList = colorList
        // 旋转类型，none（无）、cross（交叉，即要么是无旋转，要么是-90度旋转）、oblique（倾斜，即-45度旋转）、random（随机。即-90度到90度之间），如果要针对某个文本
        this.rotateType = rotateType || 'none'
        // 文字整体的缩小比例，用于加快计算速度，一般是0-1之间的小数
        this.fontSizeScale = fontSizeScale || 1 / this.minFontSize
        // 文本元素过渡动画
        this.transition = transition || 'all 0.5s ease'
        // 按权重从小到大的顺序渲染，默认是按权重从大到小进行渲染
        this.smallWeightInCenter = smallWeightInCenter || false
        // 点击事件
        this.onClick = onClick || null
    }
    // 重点：渲染函数
    render(words,done = () => {}) {
        this.run(words,list => {
            

        })
    }

    weightSort(words) {
        return words.sort((a,b) => {
            return a[1] - b[1];
        })
    }

    run(words=[],done = () => {}) { 
        console.log(words)
        clear();
        // 权重排序
        const wordList = this.weightSort(words);
        let minWeight = wordList[wordList.length - 1][1];
        let maxWeight = wordList[0][1];

        // 创建词云实例
        const wordItemList = wordList.map(item => {
            const text = item[0];
            const weight = item[1];
            const config = item[2] || {};  // 获取默认的设置，这里我们可以传入某给单词的配置
            // 旋转角度
            let rotate = 0
            return new WordItem({
                text,
                weight,
                space: config.space || this.space,
                rotate: config.rotate || rotate,
                color: this.color,
                colorList: config.colorList,
                fontStyle: {
                    fontSize: getFontSize(
                        weight,
                        minWeight,
                        maxWeight,
                        this.minFontSize,
                        this.maxFontSize
                    )*this.fontSizeScale,
                    fontFamily: config.fontFamily || this.fontFamily,
                    fontWeight: config.fontWeight || this.fontWeight,
                    fontStyle: config.fontStyle || this.fontStyle
                  }
            });
        })

        // console.log(wordItemList);
        this.compute(wordItemList);
        this.fitContainer(wordItemList);
        done(wordItemList);
    }
    /**
     * @description: 计算文本位置
     * @return {*}
     */    
    compute(wordItemList) {
        for (let i = 0; i < wordItemList.length; i++) {
            const curWordItem = wordItemList[i];
            if(i === 0) {
                addToMap(curWordItem);
                continue;
            }
            // 依次计算后续的每个文本的显示位置
            const res = getPosition({
                curWordItem,
                elWidth: this.elWidth,
                elHeight: this.elHeight
            });
            curWordItem.left = res[0];
            curWordItem.top = res[1];
            // console.log("getPosition",res);
            addToMap(curWordItem);
        }
    }
    // 根据容器大小调整字号
    fitContainer(wordItemList) {
        const elRatio = this.elWidth / this.elHeight
        let { width, height, left, top } = getBoundingRect()
        console.log(width,height,left,top)
        const wordCloudRatio = width / height
        let w, h
        if (elRatio > wordCloudRatio) {
            // 词云高度以容器高度为准，宽度根据原比例进行缩放
            h = this.elHeight
            w = wordCloudRatio * this.elHeight
        } else {
            // 词云宽度以容器宽度为准，高度根据原比例进行缩放
            w = this.elWidth
            h = this.elWidth / wordCloudRatio
        }
        // 整体平移距离
        let offsetX = 0,
            offsetY = 0
        if (elRatio > wordCloudRatio) {} else {}
        const scale = w / width
        // 将词云移动到容器中间
        left *= scale
        top *= scale
        if (elRatio > wordCloudRatio) {
            offsetY = -top
            offsetX = -left + (this.elWidth - w) / 2
        } else {
            offsetX = -left
            offsetY = -top + (this.elHeight - h) / 2
        }
        console.log(offsetX,offsetY,this.elWidth,this.elHeight,w,h)
        wordItemList.forEach(item => {
            item.left *= scale
            item.top *= scale
            item.left += offsetX
            item.top += offsetY
            // item.width *= scale
            // item.height *= scale
            item.fontStyle.fontSize *= scale
            // 重新计算文本包围框大小而不是直接缩放，因为文本包围框大小和字号并不成正比
            const { width, height } = getTextBoundingRect({
                text: item.text,
                fontStyle: item.fontStyle,
                space: item.space,
                rotate: item.rotate
            })
            item.width = width
            item.height = height
            // 修正超出容器文本
            if (item.left + item.width > this.elWidth) {
                item.left = this.elWidth - item.width
            }
            if (item.top + item.height > this.elHeight) {
                item.top = this.elHeight - item.height
            }
        })
    }
    
}