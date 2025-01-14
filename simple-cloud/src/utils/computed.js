let pxMap = {}; // 我们屏幕的像素 map 表

// 中心点
let centerX = -1; 
let centerY = -1; 

let left = Infinity;
let right = -Infinity;
let top = Infinity;
let bottom = -Infinity;

// 我们将当前的对象的像素点记录到 屏幕的 map 表中
export const addToMap = curWordItem => {
    // console.log("addToMap",curWordItem);
    curWordItem.imageData.data.forEach(item => {
        const x = item[0]+curWordItem.left; // 已经有文字的坐标 x
        const y = item[1]+curWordItem.top; // 已经有文字的坐标 y
        pxMap[x+'|'+y] = true; // 记录当前像素坐标点已经有值了，不能再使用了哦
        // 更新边界
        left = Math.min(left,x);
        right = Math.max(right, x);
        top = Math.min(top, y)
        bottom = Math.max(bottom, y);
    })

    if(centerX === -1 && centerY === -1) {
        centerX = Math.floor(curWordItem.imageData.width / 2)
        centerY = Math.floor(curWordItem.imageData.height / 2)
    }
    // console.log(pxMap);
}
/**
 * @description: 计算文本的渲染位置（核心）
 * @return {*}
 */
export const getPosition = ({ elWidth,elHeight,curWordItem })=> {
    let startX,endX,startY,endY
    // 第一个文本的中心点（看26行代码）
    startX = endX = centerX 
    startY = endY = centerY  

    // 根据容器的宽高来计算扩散步长
    let stepLeft = 1,stepTop = 1;
    // 这里我们这么处理主要是为了保证我们移动的一个单位刚好是最长边是1 最短边是比例算出来的，保证我们按照图形的比例移动
    if(elWidth > elHeight) {
        stepLeft = 1;
        stepTop = elHeight /elWidth;
    } else if(elHeight > elWidth) {
        stepTop = 1
        stepLeft = elWidth / elHeight;
    }

    // 先看看默认给的 startX,startY 能否放当前元素
    if(canFit(curWordItem, [startX,startY])) {
        return [startX,startY];
    }

    // 一次扩散遍历每个像素点
    while(true) {
        const curStartX = Math.floor(startX)
        const curStartY = Math.floor(startY)
        const curEndX = Math.floor(endX)
        const curEndY = Math.floor(endY)

        // 遍历矩形右侧的边
        for(let top = curStartY; top < curEndY; ++top) {
            const value = [curEndX,top]
            if(canFit(curWordItem, value)) {
                return value;
            }
        }
        // 遍历底部的边
        for(let left = curEndX; left > curStartX; --left) {
            const value = [left, curEndY]
            if(canFit(curWordItem, value)) {
                return value;
            }
        }
        // 遍历左侧的边
        for(let top = curEndY; top > curStartY; --top) {
            const value = [curStartX, top]
            if(canFit(curWordItem, value)) {
                return value;
            }
        }
        for(let left = curStartX; left < curEndX; ++left) {
            const value = [left, curStartY]
            if(canFit(curWordItem, value)) {
                return value;
            }
        }

        // 四周扩散
        startX -= stepLeft;
        endX += stepLeft;
        startY -= stepTop;
        endY += stepTop;
    }

}

export const getBoundingRect = () => {
    return {
        left,
        right,
        top,
        bottom,
        width: right - left,
        height: bottom - top
    }
}

export const clear = () => {
    pxMap = {}
    centerX = -1
    centerY = -1
    left = Infinity
    right = -Infinity
    top = Infinity
    bottom = -Infinity
}

// 判断某个像素点所在的位置能否完全容纳某个文本（核心）
const canFit = (curWordItem, [cx,cy]) => {
    if(pxMap[`${cx}|${cy}`]) return false;
    return curWordItem.imageData.data.every(([x,y]) => {
        const left = x + cx;
        const top = y + cy;
        return !pxMap[`${left}|${top}`];
    }) 
}

