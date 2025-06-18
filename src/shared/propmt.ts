import { RLCoderResItem } from "./apis";

export function getPrompt(
  prefix: string,
  similar_suffix: RLCoderResItem[],
  functionList: string[],
): string {
  let similar_suffix_str = JSON.stringify(similar_suffix, null, 2);

  return `
You are an intelligent code completion assistant. Please complete the code based on the following information:

[Code Prefix]
${prefix}

[Most Similar Code Suffix]
${similar_suffix_str}

[Functions in the Current File]
${functionList}

Requirements:
- Generate code that fits naturally after the [Code Prefix].
- Maintain a consistent style with the existing code.
- Make use of the available functions if appropriate.
- Only output the code, do not include explanations or extra text.
- Add brief comments if necessary to improve readability.
- Consider edge cases and ensure code robustness.

Respond ONLY with the code completion, no comment.
`;
}
