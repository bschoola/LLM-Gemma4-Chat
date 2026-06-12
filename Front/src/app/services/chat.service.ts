import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly apiUrl = 'http://localhost:8000';

  streamChat(messages: Message[]): Observable<string> {
    return new Observable(subscriber => {
      const controller = new AbortController();

      fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        signal: controller.signal,
      })
        .then(async response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;

              const raw = line.slice(6).trim();
              if (raw === '[DONE]') {
                subscriber.complete();
                return;
              }

              try {
                const parsed = JSON.parse(raw);
                if (parsed.error) {
                  subscriber.error(new Error(parsed.error));
                  return;
                }
                if (parsed.content) {
                  subscriber.next(parsed.content);
                }
              } catch {
                // skip malformed SSE lines
              }
            }
          }

          subscriber.complete();
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            subscriber.error(err);
          }
        });

      return () => controller.abort();
    });
  }
}
