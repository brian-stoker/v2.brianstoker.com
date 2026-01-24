export interface LnurlSuccessAction {
  tag: 'message' | 'url' | 'aes';
  message?: string;
  url?: string;
  description?: string;
  ciphertext?: string;
  iv?: string;
}

export interface LnurlCallbackResponse {
  pr: string; // Lightning invoice (bolt11)
  routes: any[]; // Additional routing hints (empty for now)
  successAction?: LnurlSuccessAction;
}

export interface LnurlErrorResponse {
  status: 'ERROR';
  reason: string;
}
