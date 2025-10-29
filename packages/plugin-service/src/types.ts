export interface ModuleEntry {
  id: string;
  name: string;
  url?: string;
  path?: string;
  type: 'url' | 'local';
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleManifest {
  [key: string]: string;
}

export interface AddModuleRequest {
  name: string;
  url?: string;
  path?: string;
}

export interface UpdateModuleRequest {
  name: string;
  url?: string;
  path?: string;
}

export interface RemoveModuleRequest {
  name: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
