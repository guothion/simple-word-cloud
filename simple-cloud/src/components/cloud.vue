<template>
  <div>
    <div id="container" ref="el">
      <div
        class="wordItemWrap"
        v-for="(item, index) in list"
        :key="index"
        :style="{
            left: item.left + 'px',
            top: item.top + 'px',
            width: item.width + 'px',
            height: item.height + 'px',
        }"
      >
        <div
          class="wordItem"
          :style="{
                fontSize: item.fontStyle.fontSize + 'px',
                fontFamily: item.fontStyle.fontFamily,
                fontWeight: item.fontStyle.fontWeight,
                color: item.color,
                transform: `rotate(${item.rotate}deg)`,
          }"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SimpleWordCloud from "../utils/SimpleWordCloud";
import { ref, onMounted } from "vue";
import exampleData from "../utils/example";

const list = ref([]);

const wordStr = ref(
  exampleData
    .map((item) => {
      return item[0] + " " + item[1];
    })
    .join("\n")
);

// 生成文本列表, [[text,权重] ...]
const createWordList = () => {
  return wordStr.value.split(/\n/).map((item,index) => {
    const arr = item.split(/\s+/);
    const rotate = (index % 2 == 0) ? 0: 0;
    return [arr[0], arr[1], {rotate}];
  });
};

const el = ref(null);
onMounted(() => {
  const simpleCloud = new SimpleWordCloud({
    el: el.value,
    space: 0,
    colorList: [
      "#326BFF",
      "#5C27FE",
      "#C165DD",
      "#FACD68",
      "#FC76B3",
      "#1DE5E2",
      "#B588F7",
      "#08C792",
      "#FF7B02",
      "#3bc4c7",
      "#3a9eea",
      "#461e47",
      "#ff4e69",
    ],
  });

  simpleCloud.run(createWordList(), (res) => {
    list.value = res;
  });
});
</script>

<style scoped>
#container {
  width: 600px;
  height: 400px;
  border: 1px solid #000;
  margin: auto;
  position: relative;
}

.wordItemWrap {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
}
.wordItem {
    white-space: nowrap;
}
</style>
