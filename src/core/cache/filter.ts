/**
 *
 * 过滤器，查看是否有匹配的代码补全项
 *
 * @param prefix 代码前缀（仅当前行）
 * @param completions 代码补全列表
 * @returns 补全列表中与前缀匹配的索引，如果没有匹配，则返回-1
 */
export function checkFilter(
  prefixOnCursor: string,
  completions: string[],
): number {
  return completions.findIndex((completion) =>
    completion.startsWith(prefixOnCursor),
  );
}
