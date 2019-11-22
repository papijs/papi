import { Method } from 'axios'

export type RequestParams = { [key: string]: string | number }
export type Header = [ string, string ]

export type ServiceMethods = { [key: string]: Function }

export interface EndpointConfig {
  alias: string;
  base?: string;
  endpoint: string;
  method?: Method;
  hasBody?: boolean;
  hasParams?: boolean;
  params?: string[];
  requiresAuth?: boolean;
}

export interface ServiceConfig {
  name: string;
  base?: string;
  hasDefaultEndpoints?: boolean;
  hasHealthCheck?: boolean;
  healthCheck?: EndpointConfig;
  endpoints?: EndpointConfig[];
  services?: ServiceConfig[];
  methods?: ServiceMethods
}

export interface PapiConfig {
  base: string;
  headers?: Header[];
  services?: ServiceConfig[];
}

export interface EndpointParam {
  slug: string;
  pattern: string;
  required: boolean;
}

export interface EndpointArgs {
  data?: any;
  params?: number | string | RequestParams;
  query?: any;
}
