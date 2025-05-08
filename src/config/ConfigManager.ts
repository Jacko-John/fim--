import * as vscode from "vscode";

export interface RLCoderConfig {
  enabled: boolean;
  url: string;
  key: string;
}

export interface APIConfig {
  Type: string;
  Url: string;
  Key: string;
}

export class ConfigManager {
  private static config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration();
  static getDebounceTime(): number {
    return ConfigManager.config.get<number>("fim--.debounceTime") || 1000;
  }
  static setDebounceTime(value: number): void {
    ConfigManager.config.update("fim--.debounceTime", value, true);
  }

  static getRLCoderConfig(): RLCoderConfig {
    const rlcoderConf: RLCoderConfig = {
      enabled:
        ConfigManager.config.get<boolean>("fim--.RLCoderEnable") || false,
      url: ConfigManager.config.get<string>("fim--.RLCoderURL") || "",
      key: ConfigManager.config.get<string>("fim--.RLCoderKey") || "",
    };
    return rlcoderConf;
  }
  static setRLCoderConfig(rlcoderConf: RLCoderConfig): void {
    ConfigManager.config.update(
      "fim--.RLCoderEnable",
      rlcoderConf.enabled,
      true,
    );
    ConfigManager.config.update("fim--.RLCoderURL", rlcoderConf.url, true);
    ConfigManager.config.update("fim--.RLCoderKey", rlcoderConf.key, true);
  }

  static getAPIs(): APIConfig[] {
    let apis: APIConfig[] =
      ConfigManager.config.get<APIConfig[]>("fim--.apis") || [];
    return apis;
  }
}
