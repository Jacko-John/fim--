import * as vscode from "vscode";
import { APIConfig, RLCoderConfig } from "../../config/ConfigManager";
import { Models, RLCoderResItem } from "../../shared/apis";
import { HISTORY } from "../../shared/cst";
import { getPrompt } from "../../shared/propmt";
import { requestRLCoder } from "./rlcoder";
import axios from "axios";
import { CodeContext } from "../../types/context";

export class RequestApi {
  private apis: APIConfig[];
  private rlCoderConfig: RLCoderConfig | null;

  constructor(_apis: APIConfig[], _rlCoderConfig: RLCoderConfig | null) {
    this.apis = _apis;
    this.rlCoderConfig = _rlCoderConfig;
  }

  async request(ctx: CodeContext, multiModel: boolean) {
    // 检查是否有配置的API
    if (!this.apis || this.apis.length === 0) {
      console.error("No APIs configured for request.");
      vscode.window.showErrorMessage("No APIs configured for request.");
      return [];
    }
    // 获取RLCoder的内容
    let rlSuggestions: RLCoderResItem[] = [];

    if (this.rlCoderConfig?.enabled) {
      try {
        rlSuggestions = await requestRLCoder(
          this.rlCoderConfig.url,
          this.rlCoderConfig.key,
          ctx.prefixWithMid,
        );
      } catch (error) {
        console.error("Error requesting RLCoder:", error);
      }
    }
    // 获取存在函数列表
    let functionList: string[] = HISTORY.getHistory();

    // 构建提示词
    let prompt: string = getPrompt(
      ctx.prefixOnCursor,
      rlSuggestions,
      functionList,
    );

    // 准备消息列表
    let messages: any[] = [];
    messages.push({
      role: "system",
      content: prompt,
    });

    // 创建结果数组
    let results: any[] = [];

    // 多模型处理
    if (multiModel) {
      // 选取api
      const apisToRequest = this.apis
        .filter((api) => api.Url && api.Model && api.Type && api.Key)
        .slice(0, 3);

      const promises = apisToRequest.map(async (api) => {
        // 构建config
        const modelConfig = Models[api.Type] || {};

        // 构建payload
        const payload = {
          model: api.Model, // 模型名称
          ...modelConfig, // 配置信息
          messages, // 请求内容
        };

        // 进行请求
        try {
          const res = await requestApiByConfig(api.Url, api.Key, payload);
          return { api: api.Model, data: res };
        } catch (err) {
          console.error(`Error requesting ${api.Model}:`, err);
          return { api: api.Model, error: err };
        }
      });

      results = await Promise.all(promises);

      // 单模型处理
    } else {
      // 选取api
      const apiToRequest = this.apis.find(
        (api) => api.Url && api.Model && api.Type && api.Key,
      );
      if (apiToRequest) {
        // 构建config
        const modelConfig = Models[apiToRequest.Type] || {};
        // 构建payload
        const payload = {
          model: apiToRequest.Model, // 模型名称
          ...modelConfig, // 配置信息
          messages, //请求内容
        };
        console.log("Payload: ", payload);

        // 进行请求
        try {
          const res = await requestApiByConfig(
            apiToRequest.Url,
            apiToRequest.Key,
            payload,
          );
          results = [{ api: apiToRequest.Model, data: res }];
        } catch (err) {
          console.error(`Error requesting ${apiToRequest.Model}:`, err);
          results = [{ api: apiToRequest.Model, error: err }];
        }
      }
    }

    return results;
  }
}

async function requestApiByConfig(url: string, key: string, payload: any) {
  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      timeout: 15000,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
