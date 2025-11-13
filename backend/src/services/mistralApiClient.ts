/**
 * Shared Mistral AI API client with rate limiting and retry logic
 */

interface QueuedRequest {
  url: string;
  options: RequestInit;
  resolve: (value: Response) => void;
  reject: (reason: any) => void;
  retryCount: number;
}

class MistralApiClient {
  private static instance: MistralApiClient;
  private requestQueue: QueuedRequest[] = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private minInterval = 1000; // 1 second between requests
  private maxRetries = 3;
  private retryDelay = 2000; // 2 seconds base retry delay

  private constructor() {}

  public static getInstance(): MistralApiClient {
    if (!MistralApiClient.instance) {
      MistralApiClient.instance = new MistralApiClient();
    }
    return MistralApiClient.instance;
  }

  /**
   * Queue a request to Mistral API with rate limiting
   */
  public async fetch(url: string, options: RequestInit): Promise<Response> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        url,
        options,
        resolve,
        reject,
        retryCount: 0
      };
      
      this.requestQueue.push(queuedRequest);
      this.processQueue();
    });
  }

  /**
   * Process the request queue with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      
      try {
        // Enforce rate limit
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.minInterval) {
          const waitTime = this.minInterval - timeSinceLastRequest;
          console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
          await this.sleep(waitTime);
        }

        this.lastRequestTime = Date.now();
        
        // Disable SSL verification for corporate networks
        const https = await import('https');
        const agent = new https.Agent({ rejectUnauthorized: false });
        
        // Make the actual request with SSL bypass
        const response = await fetch(request.url, {
          ...request.options,
          // @ts-ignore - agent not in type definitions but works
          agent
        });
        
        // Check for rate limit response
        if (response.status === 429) {
          if (request.retryCount < this.maxRetries) {
            console.log(`Rate limited, retrying in ${this.retryDelay}ms (attempt ${request.retryCount + 1}/${this.maxRetries})`);
            request.retryCount++;
            
            // Exponential backoff
            const delay = this.retryDelay * Math.pow(2, request.retryCount - 1);
            await this.sleep(delay);
            
            // Re-queue the request
            this.requestQueue.unshift(request);
            continue;
          } else {
            request.reject(new Error(`Rate limit exceeded after ${this.maxRetries} retries`));
            continue;
          }
        }

        // Check for other errors
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          request.reject(new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`));
          continue;
        }

        request.resolve(response);

      } catch (error) {
        if (request.retryCount < this.maxRetries) {
          console.log(`Request failed, retrying in ${this.retryDelay}ms (attempt ${request.retryCount + 1}/${this.maxRetries}):`, error);
          request.retryCount++;
          
          const delay = this.retryDelay * Math.pow(2, request.retryCount - 1);
          await this.sleep(delay);
          
          // Re-queue the request
          this.requestQueue.unshift(request);
          continue;
        } else {
          request.reject(error);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set minimum interval between requests (in milliseconds)
   */
  public setMinInterval(interval: number): void {
    this.minInterval = interval;
  }

  /**
   * Set maximum retry attempts
   */
  public setMaxRetries(retries: number): void {
    this.maxRetries = retries;
  }

  /**
   * Get queue status
   */
  public getQueueStatus(): { queueLength: number; isProcessing: boolean } {
    return {
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing
    };
  }
}

export default MistralApiClient;