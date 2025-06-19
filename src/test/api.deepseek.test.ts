// import { ApiFactory } from "../api/factory/deepseek";

// async function test() {
//   const apiFactory = ApiFactory.getInstance({
//     deepSeekApiKey: "<YOUR_API_KEY>",
//   });

//   const deepSeekHandler = apiFactory.getDeepSeekHandler();

//   try {
//     console.log("基本代码补全示例:");
//     const basicResult = await deepSeekHandler.createCodeCompletion({
//       prefix: "function calculateSum(a, b) {",
//       suffix: "    return a + b;",
//     });
//     console.log(basicResult);
//   } catch (error) {
//     console.error("基本补全失败:", error);
//   }
// }

// test().catch((error) => {
//   console.error("测试失败:", error);
// });
