import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowUp, lucideMic, lucidePlus, lucideX } from '@ng-icons/lucide';
import {
  NgpPromptComposer,
  NgpPromptComposerDictation,
  NgpPromptComposerInput,
  NgpPromptComposerSubmit,
  NgpThread,
  NgpThreadMessage,
} from 'ng-primitives/ai';
import { NgpButton } from 'ng-primitives/button';
import { NgpFileUpload } from 'ng-primitives/file-upload';

interface Attachment {
  id: string;
  file: File;
  preview: string; // Data URL for image preview
  type: 'image' | 'file';
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  attachments?: Attachment[];
}

@Component({
  selector: 'app-ai',
  imports: [
    NgpThread,
    NgpThreadMessage,
    NgpPromptComposer,
    NgpPromptComposerInput,
    NgpPromptComposerSubmit,
    NgpPromptComposerDictation,
    NgpFileUpload,
    NgIcon,
    NgpButton,
  ],
  providers: [provideIcons({ lucideArrowUp, lucideMic, lucidePlus, lucideX })],
  template: `
    <div class="h-[700px] w-full">
      <div
        class="flex h-full flex-col items-stretch rounded-2xl bg-white px-4 ring-1 ring-black/10"
      >
        <div class="flex flex-grow flex-col gap-4 overflow-hidden pt-4">
          <div class="flex flex-grow flex-col gap-4 overflow-y-auto px-2 pb-4" ngpThread>
            @for (message of messages(); track message.id) {
              <div
                class="flex flex-col gap-2"
                [class.items-end]="message.isUser"
                [class.items-start]="!message.isUser"
                ngpThreadMessage
              >
                <!-- Message Attachments -->
                @if (message.attachments && message.attachments.length > 0) {
                  <div class="flex max-w-[80%] flex-wrap gap-2">
                    @for (attachment of message.attachments; track attachment.id) {
                      @if (attachment.type === 'image') {
                        <img
                          class="max-h-32 max-w-xs rounded-lg border border-gray-300 object-cover"
                          [src]="attachment.preview"
                          [alt]="attachment.file.name"
                        />
                      } @else {
                        <div
                          class="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-2 py-1 text-xs text-gray-700"
                        >
                          <span>{{ attachment.file.name }}</span>
                        </div>
                      }
                    }
                  </div>
                }

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

        <!-- Attachment Previews -->
        @if (attachments().length > 0) {
          <div class="mx-auto w-full max-w-screen-md px-4 pb-2">
            <div class="flex flex-wrap gap-2">
              @for (attachment of attachments(); track attachment.id) {
                <div class="group relative">
                  @if (attachment.type === 'image') {
                    <img
                      class="h-16 w-16 cursor-pointer rounded-lg border border-gray-200 object-cover transition-opacity hover:opacity-80"
                      [src]="attachment.preview"
                      [alt]="attachment.file.name"
                    />
                  } @else {
                    <div
                      class="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <span class="text-xs text-gray-600">
                        {{ attachment.file.name.split('.').pop()?.toUpperCase() }}
                      </span>
                    </div>
                  }
                  <button
                    class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    (click)="removeAttachment(attachment.id)"
                    type="button"
                  >
                    X
                  </button>
                </div>
              }
            </div>
          </div>
        }

        <div
          class="mx-auto flex w-full max-w-screen-md items-end rounded-3xl bg-white/5 shadow-sm ring-1 ring-black/10"
          (ngpPromptComposerSubmit)="sendMessage($event)"
          ngpPromptComposer
        >
          <button
            class="m-2 flex size-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
            (ngpFileUploadSelected)="addAttachment($event)"
            ngpButton
            type="button"
            ngpFileUpload
            ngpFileUploadMultiple="true"
            ngpFileUploadFileTypes="image/*"
            aria-label="Add Attachment"
          >
            <ng-icon class="font-base text-black" name="lucidePlus" />
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
            class="data-[prompt]:not([data-dictating]):hidden not([data-dictation-supported]):hidden m-2 flex size-8 items-center justify-center rounded-full transition-colors hover:bg-black/5 data-[dictating]:bg-black/5 data-[dictating]:hover:bg-black/10"
            #dictation="ngpPromptComposerDictation"
            type="button"
            ngpPromptComposerDictation
            aria-label="Dictation"
          >
            <ng-icon class="font-base" [name]="dictation.isDictating() ? 'lucideX' : 'lucideMic'" />
          </button>

          <button
            class="m-2 hidden size-8 items-center justify-center rounded-full bg-black text-white transition-colors data-[prompt]:flex"
            type="button"
            ngpPromptComposerSubmit
            aria-label="Send Message"
          >
            <ng-icon class="font-base" name="lucideArrowUp" />
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
        'Great question! There are several ways to handle component communication in Angular: input() and output() for parent-child communication, Services for unrelated components or complex state, ViewChild/ContentChild for direct component references, and NgRx or other state management for complex applications. For parent-child communication, input() and output() are typically the best choice. Would you like me to show you an example?',
      isUser: false,
      timestamp: new Date(Date.now() - 280000), // 4 min 40 sec ago
    },
    {
      id: '3',
      content:
        'Yes, an example would be perfect! Could you show me how to use input() and output() together?',
      isUser: true,
      timestamp: new Date(Date.now() - 260000), // 4 min 20 sec ago
    },
    {
      id: '4',
      content:
        'Absolutely! Here is a complete example. In the parent component, you can pass data to the child using input() and receive events using output(). The child component declares an input() property to receive data and an output() EventEmitter to send data back to the parent. This creates a two-way communication channel between components.',
      isUser: false,
      timestamp: new Date(Date.now() - 200000), // 3 min 20 sec ago
    },
    {
      id: '5',
      content:
        "That's really helpful, thank you! Could you also explain how services can be used for component communication?",
      isUser: true,
      timestamp: new Date(Date.now() - 180000), // 3 min ago
    },
    {
      id: '6',
      content:
        'Of course! Services in Angular are singleton objects that can be injected into any component. They are great for sharing data and functionality between components that do not have a direct parent-child relationship. You can create a service that holds shared state or methods, and then inject that service into any component that needs access to it. This allows for decoupled and reusable code. Would you like to see an example of using services for communication?',
      isUser: false,
      timestamp: new Date(Date.now() - 160000), // 2 min 40 sec ago
    },
    {
      id: '7',
      content:
        'Yes, an example would be great! I want to understand how to implement this in my app.',
      isUser: true,
      timestamp: new Date(Date.now() - 140000), // 2 min 20 sec ago
    },
  ]);

  readonly attachments = signal<Attachment[]>([]);

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  sendMessage(prompt: string): void {
    // Add user message with attachments if any
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      isUser: true,
      timestamp: new Date(),
      attachments: this.attachments().length > 0 ? [...this.attachments()] : undefined,
    };

    this.messages.update(messages => [...messages, userMessage]);

    // Clear attachments after sending
    this.attachments.set([]);

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

  addAttachment(files: FileList | null): void {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const attachment: Attachment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        preview: '',
        type: file.type.startsWith('image/') ? 'image' : 'file',
      };

      // Create preview for images
      if (attachment.type === 'image') {
        const reader = new FileReader();
        reader.onload = e => {
          attachment.preview = e.target?.result as string;
          this.attachments.update(attachments => [...attachments, attachment]);
        };
        reader.readAsDataURL(file);
      } else {
        this.attachments.update(attachments => [...attachments, attachment]);
      }
    });
  }

  removeAttachment(attachmentId: string): void {
    this.attachments.update(attachments =>
      attachments.filter(attachment => attachment.id !== attachmentId),
    );
  }
}
