import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowUp, heroPlus } from '@ng-icons/heroicons/outline';
import {
  NgpPromptComposer,
  NgpPromptComposerInput,
  NgpPromptComposerSubmit,
  NgpThread,
  NgpThreadMessage,
  NgpThreadViewport,
} from 'ng-primitives/ai';
import { NgpButton } from 'ng-primitives/button';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-ai',
  imports: [
    NgpThread,
    NgpThreadViewport,
    NgpThreadMessage,
    NgpPromptComposer,
    NgpPromptComposerInput,
    NgpPromptComposerSubmit,
    NgIcon,
    NgpButton,
  ],
  providers: [provideIcons({ heroArrowUp, heroPlus })],
  template: `
    <div class="h-[700px] w-full">
      <div
        class="flex h-full flex-col items-stretch rounded-2xl bg-white px-4 ring-1 ring-black/10"
      >
        <div class="flex flex-grow flex-col gap-4 overflow-hidden pt-4">
          <div class="flex flex-grow flex-col gap-4 overflow-y-auto px-2 pb-4" ngpThread>
            @for (message of messages(); track message.id) {
              <div
                class="flex"
                [class.justify-end]="message.isUser"
                [class.justify-start]="!message.isUser"
                ngpThreadMessage
              >
                <div
                  class="max-w-[80%] rounded-2xl px-4 py-3 text-sm"
                  [class.bg-black]="message.isUser"
                  [class.text-white]="message.isUser"
                  [class.bg-gray-100]="!message.isUser"
                  [class.text-black]="!message.isUser"
                >
                  <p>{{ message.content }}</p>
                  <p
                    [class]="
                      'mt-1 text-xs opacity-70 ' +
                      (message.isUser ? 'text-white/70' : 'text-black/70')
                    "
                  >
                    {{ formatTime(message.timestamp) }}
                  </p>
                </div>
              </div>
            }
          </div>
        </div>

        <div
          class="mx-auto flex w-full max-w-screen-md items-end rounded-3xl bg-white/5 shadow-sm ring-1 ring-black/10"
          (ngpPromptComposerSubmit)="sendMessage($event)"
          ngpPromptComposer
        >
          <button
            class="m-2 flex size-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
            ngpButton
            type="button"
          >
            <ng-icon class="font-base text-black" name="heroPlus" />
          </button>

          <textarea
            class="max-h-40 min-h-12 flex-grow resize-none bg-transparent py-3.5 text-sm outline-none placeholder:text-black/50"
            ngpPromptComposerInput
            style="field-sizing: content;"
            name="input"
            placeholder="Message ChatNGP"
            rows="1"
          ></textarea>

          <button
            class="m-2 flex size-8 items-center justify-center rounded-full bg-black text-white transition-colors disabled:bg-black/5 disabled:text-black/15"
            type="button"
            ngpPromptComposerSubmit
          >
            <ng-icon class="font-base" name="heroArrowUp" />
          </button>
        </div>

        <p class="my-1 p-2 text-center text-xs text-black/50">
          ChatNGP can make mistakes. Check important info.
        </p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export default class AiExample {
  readonly messages = signal<Message[]>([
    {
      id: '1',
      content:
        "Hello! I'm working on an Angular application and I need help with component communication. What's the best way to pass data between parent and child components?",
      isUser: true,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    },
    {
      id: '2',
      content:
        'Great question! There are several ways to handle component communication in Angular: @Input() and @Output() for parent-child communication, Services for unrelated components or complex state, ViewChild/ContentChild for direct component references, and NgRx or other state management for complex applications. For parent-child communication, @Input() and @Output() are typically the best choice. Would you like me to show you an example?',
      isUser: false,
      timestamp: new Date(Date.now() - 280000), // 4 min 40 sec ago
    },
    {
      id: '3',
      content:
        'Yes, an example would be perfect! Could you show me how to use @Input() and @Output() together?',
      isUser: true,
      timestamp: new Date(Date.now() - 260000), // 4 min 20 sec ago
    },
    {
      id: '4',
      content:
        'Absolutely! Here is a complete example. In the parent component, you can pass data to the child using @Input() and receive events using @Output(). The child component declares an @Input() property to receive data and an @Output() EventEmitter to send data back to the parent. This creates a two-way communication channel between components.',
      isUser: false,
      timestamp: new Date(Date.now() - 200000), // 3 min 20 sec ago
    },
  ]);

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  sendMessage(prompt: string): void {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      isUser: true,
      timestamp: new Date(),
    };

    this.messages.update(messages => [...messages, userMessage]);

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: this.generateAiResponse(prompt),
        isUser: false,
        timestamp: new Date(),
      };
      this.messages.update(messages => [...messages, aiMessage]);
    }, 1000);
  }

  private generateAiResponse(userMessage: string): string {
    // Simple response generation based on keywords
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('angular')) {
      return 'Angular is a powerful framework! I can help you with components, services, routing, and more. What specific aspect would you like to learn about?';
    } else if (lowerMessage.includes('component')) {
      return 'Components are the building blocks of Angular applications. They control views and handle user interactions. Would you like to know about component lifecycle, communication, or something else?';
    } else if (lowerMessage.includes('help')) {
      return 'I am here to help! You can ask me about Angular concepts, best practices, debugging issues, or any other development topics. What would you like to know?';
    } else {
      return 'That is an interesting question! Could you provide a bit more context so I can give you the most helpful answer?';
    }
  }
}
