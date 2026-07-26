import { NgClass } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowUp, lucideMic, lucidePlus, lucideX } from '@ng-icons/lucide';
import {
  NgpPromptComposer,
  NgpPromptComposerDictation,
  NgpPromptComposerInput,
  NgpPromptComposerSubmit,
  NgpThread,
  NgpThreadMessage,
  NgpThreadSuggestion,
  NgpThreadViewport,
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
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  isStreaming?: boolean;
}

@Component({
  selector: 'app-ai',
  imports: [
    NgpThread,
    NgpThreadViewport,
    NgpThreadMessage,
    NgpThreadSuggestion,
    NgpPromptComposer,
    NgpPromptComposerInput,
    NgpPromptComposerSubmit,
    NgpPromptComposerDictation,
    NgpFileUpload,
    NgIcon,
    NgpButton,
    NgClass,
  ],
  providers: [provideIcons({ lucideArrowUp, lucideMic, lucidePlus, lucideX })],
  template: `
    <div class="h-[700px] w-full" ngpThread>
      <div
        class="flex h-full flex-col items-stretch rounded-2xl bg-white px-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] dark:bg-zinc-950 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
      >
        <div class="flex grow flex-col gap-4 overflow-hidden pt-4">
          <div class="flex grow flex-col gap-4 overflow-y-auto px-2 pb-4" ngpThreadViewport>
            @if (!hasMessages()) {
              <!-- Welcome Message and Suggestions -->
              <div class="flex grow flex-col items-center justify-center gap-8 text-center">
                <div class="max-w-md">
                  <h1
                    class="mb-2! text-2xl/[1.25]! font-[590]! tracking-[-0.021em]! text-black dark:text-white"
                  >
                    {{ welcomeMessage }}
                  </h1>
                  <p class="text-sm/[1.5]! tracking-[-0.011em] text-zinc-600 dark:text-zinc-300">
                    Choose a suggestion below or type your own message to get started.
                  </p>
                </div>

                <!-- Suggestions -->
                <div class="grid w-full max-w-lg grid-cols-1 gap-3 md:grid-cols-2">
                  @for (suggestion of suggestions; track suggestion) {
                    <button
                      class="rounded-[0.625rem] bg-white px-3.5 py-2.5 text-left text-[0.875rem] font-[510] tracking-[-0.006em] text-zinc-600 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] transition-all data-focus-visible:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1),0_0_0_2px_#fff,0_0_0_4px_rgb(59_130_246)] data-focus-visible:outline-none data-hover:-translate-y-px data-hover:bg-zinc-50 data-hover:text-zinc-900 data-hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.05)] dark:bg-zinc-950 dark:text-zinc-300 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] dark:data-focus-visible:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_0_0_2px_#09090b,0_0_0_4px_rgb(59_130_246)] dark:data-hover:bg-zinc-900 dark:data-hover:text-zinc-100 dark:data-hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_1px_2px_0_rgba(0,0,0,0.05)]"
                      (click)="sendMessage(suggestion)"
                      ngpThreadSuggestion
                      ngpButton
                      type="button"
                    >
                      {{ suggestion }}
                    </button>
                  }
                </div>
              </div>
            } @else {
              <!-- Messages -->
              @for (message of messages(); track message.id) {
                @if (message.role !== 'system') {
                  <div
                    class="message-in flex flex-col gap-2"
                    [class.items-end]="message.role === 'user'"
                    [class.items-start]="message.role !== 'user'"
                    ngpThreadMessage
                  >
                    <!-- Message Attachments -->
                    @if (message.attachments && message.attachments.length > 0) {
                      <div class="flex max-w-[80%] flex-wrap gap-2">
                        @for (attachment of message.attachments; track attachment.id) {
                          @if (attachment.type === 'image') {
                            <img
                              class="max-h-32 max-w-xs rounded-lg border border-zinc-300 object-cover dark:border-zinc-700"
                              [src]="attachment.preview"
                              [alt]="attachment.file.name"
                            />
                          } @else {
                            <div
                              class="flex items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            >
                              <span>{{ attachment.file.name }}</span>
                            </div>
                          }
                        }
                      </div>
                    }

                    <div
                      class="max-w-[80%] rounded-[1.125rem] px-[0.9375rem] py-2.5 text-sm leading-relaxed tracking-[-0.006em]"
                      [ngClass]="{
                        'rounded-br-[0.3125rem] bg-black text-white dark:bg-white dark:text-black':
                          message.role === 'user',
                        'rounded-bl-[0.3125rem] bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white':
                          message.role !== 'user',
                      }"
                    >
                      <p>
                        {{ message.content }}

                        @if (message.isStreaming) {
                          <span class="ml-1 inline-flex">
                            <div
                              class="streaming-indicator h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"
                            ></div>
                          </span>
                        }
                      </p>
                    </div>
                  </div>
                }
              }
            }
          </div>
        </div>

        <!-- Attachment Previews -->
        @if (attachments().length > 0) {
          <div class="mx-auto w-full max-w-(--breakpoint-md) px-4 pb-2">
            <div class="flex flex-wrap gap-2">
              @for (attachment of attachments(); track attachment.id) {
                <div class="group relative">
                  @if (attachment.type === 'image') {
                    <img
                      class="h-16 w-16 cursor-pointer rounded-lg border border-gray-200 object-cover transition-opacity hover:opacity-80 dark:border-zinc-700"
                      [src]="attachment.preview"
                      [alt]="attachment.file.name"
                    />
                  } @else {
                    <div
                      class="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <span class="text-xs text-zinc-600 dark:text-zinc-400">
                        {{ attachment.file.name.split('.').pop()?.toUpperCase() }}
                      </span>
                    </div>
                  }
                  <button
                    class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#f01e2b] text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-[#ff4651]"
                    (click)="removeAttachment(attachment.id)"
                    type="button"
                  >
                    <ng-icon name="lucideX" />
                  </button>
                </div>
              }
            </div>
          </div>
        }

        <div
          class="mx-auto flex w-full max-w-(--breakpoint-md) items-end rounded-3xl bg-zinc-50 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] transition-shadow focus-within:shadow-[inset_0_0_0_1px_rgb(59_130_246),0_0_0_3px_rgb(59_130_246)] dark:bg-zinc-900 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
          (ngpPromptComposerSubmit)="sendMessage($event)"
          ngpPromptComposer
        >
          <button
            class="m-2 flex size-8 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            (ngpFileUploadSelected)="addAttachment($event)"
            ngpButton
            type="button"
            ngpFileUpload
            ngpFileUploadMultiple="true"
            ngpFileUploadFileTypes="image/*"
            aria-label="Add Attachment"
          >
            <ng-icon class="text-[14px] text-zinc-600! dark:text-zinc-300!" name="lucidePlus" />
          </button>

          <textarea
            class="max-h-40 min-h-12 grow resize-none bg-transparent py-3.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
            ngpPromptComposerInput
            style="field-sizing: content;"
            name="input"
            placeholder="Message ChatNGP"
            rows="1"
          ></textarea>

          <button
            class="m-2 hidden size-8 items-center justify-center rounded-full transition-colors hover:bg-black/5 data-dictating:bg-black/5 data-dictating:hover:bg-black/10 data-dictation-supported:not-data-prompt:flex data-prompt:not-data-dictating:hidden dark:hover:bg-white/5 dark:data-dictating:bg-white/5 dark:data-dictating:hover:bg-white/10"
            #dictation="ngpPromptComposerDictation"
            type="button"
            ngpPromptComposerDictation
            aria-label="Dictation"
          >
            <ng-icon
              class="text-[14px] text-zinc-600! dark:text-zinc-300!"
              [name]="dictation.isDictating() ? 'lucideX' : 'lucideMic'"
            />
          </button>

          <button
            class="m-2 hidden size-8 items-center justify-center rounded-full bg-[#f01e2b] text-white transition-colors hover:bg-[#d81825] data-prompt:flex dark:bg-[#ff4651] dark:hover:bg-[#ff5d67]"
            type="button"
            ngpPromptComposerSubmit
            aria-label="Send Message"
          >
            <ng-icon class="text-[14px] text-white!" name="lucideArrowUp" />
          </button>
        </div>

        <p class="my-1 p-2 text-center text-[0.75rem]! text-zinc-400">
          ChatNGP can make mistakes. Check important info.
        </p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }

    .streaming-indicator {
      animation: pulse 1.2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 0.3;
      }
      50% {
        opacity: 1;
      }
    }

    .message-in {
      animation: message-in 0.18s ease-out;
    }

    @keyframes message-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `,
})
export default class AiExample {
  readonly messages = signal<Message[]>([]);

  readonly attachments = signal<Attachment[]>([]);

  // Check if there are any non-system messages to show welcome/suggestions
  readonly hasMessages = computed(() => this.messages().some(message => message.role !== 'system'));

  // Welcome message and suggestions
  readonly welcomeMessage = "Hello! I'm ChatNGP, your AI assistant. How can I help you today?";

  readonly suggestions = [
    'Explain Angular components',
    'Help with TypeScript types',
    'Best practices for testing',
    'Web development concepts',
    'Angular routing guide',
    'State management patterns',
  ];

  // Simulated chat scenarios
  private readonly chatScenarios = [
    {
      keywords: ['angular', 'component', 'directive'],
      responses: [
        'Angular is a powerful framework! I can help you with components, services, routing, and more.',
        'Components are the building blocks of Angular applications. They control views and handle user interactions.',
        'Directives are classes that add additional behavior to elements in your Angular applications.',
        'Angular provides great tools for building scalable applications with TypeScript.',
      ],
    },
    {
      keywords: ['help', 'assist', 'support'],
      responses: [
        'I am here to help! You can ask me about web development, Angular, or any other programming topics.',
        'Feel free to ask me anything! I can assist with coding questions, best practices, or debugging.',
        'How can I assist you today? I am knowledgeable about many programming topics.',
      ],
    },
    {
      keywords: ['typescript', 'ts', 'type'],
      responses: [
        'TypeScript is a great language that adds static typing to JavaScript!',
        'TypeScript helps catch errors at compile time and improves developer experience.',
        'With TypeScript, you get better IntelliSense, refactoring, and code navigation.',
      ],
    },
    {
      keywords: ['web', 'frontend', 'ui', 'interface'],
      responses: [
        'Modern web development offers many exciting possibilities for creating great user interfaces.',
        'Frontend development has evolved significantly with frameworks like Angular, React, and Vue.',
        'User interface design is crucial for creating engaging web applications.',
      ],
    },
    {
      keywords: ['test', 'testing', 'unit', 'e2e'],
      responses: [
        'Testing is essential for maintaining code quality. Angular provides great testing utilities.',
        'Unit tests help ensure individual components work correctly in isolation.',
        'End-to-end testing validates that your application works as expected from the user perspective.',
      ],
    },
  ];

  private readonly fallbackResponses = [
    'That is an interesting question! Could you tell me more about what you are trying to achieve?',
    'I would love to help you with that. Can you provide some more context?',
    'That is a great topic to explore. What specific aspect interests you most?',
    'Interesting! I am curious to learn more about your use case.',
    'That sounds like something worth discussing further. What is your current approach?',
  ];

  sendMessage(prompt: string): void {
    // Add user message with attachments if any
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      role: 'user',
      attachments: this.attachments().length > 0 ? [...this.attachments()] : undefined,
    };

    this.messages.update(messages => [...messages, userMessage]);

    // Clear attachments after sending
    this.attachments.set([]);

    // Generate AI response
    this.generateAiResponse(prompt);
  }

  private async generateAiResponse(userMessage: string): Promise<void> {
    const aiMessageId = (Date.now() + 1).toString();

    // Create initial AI message
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      role: 'assistant',
      isStreaming: true,
    };

    this.messages.update(messages => [...messages, aiMessage]);

    try {
      // Simulate streaming response
      await this.streamSimulatedResponse(userMessage, aiMessageId);
    } catch (error) {
      console.error('Error generating response:', error);
      // Update with error message
      this.messages.update(messages =>
        messages.map(msg =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: 'Sorry, I encountered an error. Please try again.',
                isStreaming: false,
              }
            : msg,
        ),
      );
    }
  }

  private async streamSimulatedResponse(userMessage: string, messageId: string): Promise<void> {
    // Add a small delay to simulate thinking
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate response based on user message
    const response = this.getSimulatedResponse(userMessage);

    // Simulate streaming by adding characters with delay
    let currentContent = '';

    for (let i = 0; i < response.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 10)); // 10ms delay between characters
      currentContent += response[i];

      this.messages.update(messages =>
        messages.map(msg =>
          msg.id === messageId ? { ...msg, content: currentContent, isStreaming: true } : msg,
        ),
      );
    }

    // Mark streaming as complete
    this.messages.update(messages =>
      messages.map(msg => (msg.id === messageId ? { ...msg, isStreaming: false } : msg)),
    );
  }

  private getSimulatedResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Check for matching scenario based on keywords
    for (const scenario of this.chatScenarios) {
      for (const keyword of scenario.keywords) {
        if (lowerMessage.includes(keyword)) {
          // Return a random response from the matching scenario
          const randomIndex = Math.floor(Math.random() * scenario.responses.length);
          return scenario.responses[randomIndex];
        }
      }
    }

    // If no keywords match, return a random fallback response
    const randomIndex = Math.floor(Math.random() * this.fallbackResponses.length);
    return this.fallbackResponses[randomIndex];
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
