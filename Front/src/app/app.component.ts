import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  NgZone,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from './services/chat.service';
import { Message } from './models/message.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLElement>;

  messages: Message[] = [];
  userInput = '';
  isStreaming = false;
  private needsScroll = false;

  constructor(
    private chatService: ChatService,
    private ngZone: NgZone,
  ) {}

  sendMessage(): void {
    const content = this.userInput.trim();
    if (!content || this.isStreaming) return;

    this.messages.push({ role: 'user', content });
    this.userInput = '';
    this.isStreaming = true;
    this.needsScroll = true;

    const assistantMessage: Message = { role: 'assistant', content: '' };
    this.messages.push(assistantMessage);

    // Send all messages except the empty assistant placeholder
    const payload = this.messages.slice(0, -1);

    this.chatService.streamChat(payload).subscribe({
      next: chunk => {
        this.ngZone.run(() => {
          assistantMessage.content += chunk;
          this.needsScroll = true;
        });
      },
      error: (err: Error) => {
        this.ngZone.run(() => {
          assistantMessage.content = `Error: ${err?.message ?? 'could not reach the backend. Make sure it is running on port 8000.'}`;
          this.isStreaming = false;
          this.needsScroll = true;
        });
      },
      complete: () => {
        this.ngZone.run(() => {
          this.isStreaming = false;
          this.needsScroll = true;
        });
      },
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }

  clearChat(): void {
    if (this.isStreaming) return;
    this.messages = [];
  }

  ngAfterViewChecked(): void {
    if (this.needsScroll) {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
      this.needsScroll = false;
    }
  }
}
