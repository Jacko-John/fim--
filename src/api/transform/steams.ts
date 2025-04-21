export type ApiStream = AsyncGenerator<ApiStreamChunk>;
export type ApiStreamChunk = ApiStreamTextChunk;

export interface ApiStreamTextChunk {
    type: "text"; // 格式
    index: number; // 索引
    text: string; // 文本内容
    finish_reason:
        | "stop"
        | "length"
        | "content_filter"
        | "insufficient_system_resource"; // 补全结束原因
}
