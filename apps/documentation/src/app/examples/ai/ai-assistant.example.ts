import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import * as webllm from '@mlc-ai/web-llm';
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

type Message = webllm.ChatCompletionMessageParam & {
  id: string;
  timestamp: Date;
  attachments?: Attachment[];
  isStreaming?: boolean;
};

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
    DatePipe,
  ],
  providers: [provideIcons({ lucideArrowUp, lucideMic, lucidePlus, lucideX })],
  template: `
    <div class="h-[700px] w-full">
      <div
        class="flex h-full flex-col items-stretch rounded-2xl bg-white px-4 ring-1 ring-black/10"
      >
        <div class="flex flex-grow flex-col gap-4 overflow-hidden pt-4">
          @if (isModelLoading()) {
            <div class="flex items-center justify-center p-4">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <div
                  class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black"
                ></div>
                Loading WebLLM model...
              </div>
            </div>
          }

          <div class="flex flex-grow flex-col gap-4 overflow-y-auto px-2 pb-4" ngpThread>
            @for (message of messages(); track message.id) {
              @if (message.role !== 'system') {
                <div
                  class="flex flex-col gap-2"
                  [class.items-end]="message.role === 'user'"
                  [class.items-start]="message.role !== 'user'"
                  ngpThreadMessage
                >
                  <!-- Message Attachments -->
                  @if (message.attachments && message.attachments.length > 0) {
                    {{ message.timestamp | date: 'hh:mm a' }}
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
                    [class.bg-black]="message.role === 'user'"
                    [class.text-white]="message.role === 'user'"
                    [class.bg-gray-100]="message.role !== 'user'"
                    [class.text-black]="message.role !== 'user'"
                  >
                    <p>{{ message.content }}</p>

                    @if (message.isStreaming) {
                      <div class="mt-1 flex items-center gap-1">
                        <div class="flex space-x-1">
                          <div class="h-1 w-1 animate-pulse rounded-full bg-gray-400"></div>
                          <div
                            class="h-1 w-1 animate-pulse rounded-full bg-gray-400"
                            style="animation-delay: 0.2s"
                          ></div>
                          <div
                            class="h-1 w-1 animate-pulse rounded-full bg-gray-400"
                            style="animation-delay: 0.4s"
                          ></div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
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
  private engine: webllm.MLCEngineInterface | null = null;
  readonly isModelLoading = signal(false);

  readonly messages = signal<Message[]>([
    {
      id: new Date().getTime().toString(),
      role: 'system',
      content:
        'You are a helpful AI assistant. Responses should be in plain text only, without markdown formatting.',
      timestamp: new Date(Date.now()),
    },
  ]);

  readonly attachments = signal<Attachment[]>([]);

  constructor() {
    this.initializeWebLLM();
  }

  private async initializeWebLLM(): Promise<void> {
    try {
      this.isModelLoading.set(true);

      // Initialize WebLLM engine with a small model
      this.engine = new webllm.MLCEngine();

      // Load a lightweight model - you can change this to other models
      await this.engine.reload('Llama-3.2-1B-Instruct-q4f16_1-MLC');

      this.isModelLoading.set(false);

      // Add a system message indicating the model is ready
      this.messages.update(messages => [
        ...messages,
        {
          id: Date.now().toString(),
          content: "Hello! I'm your AI assistant powered by WebLLM. How can I help you today?",
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Failed to initialize WebLLM:', error);
      this.isModelLoading.set(false);

      // Add error message
      this.messages.update(messages => [
        ...messages,
        {
          id: Date.now().toString(),
          content: 'Failed to load WebLLM model. Falling back to demo responses.',
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  }

  sendMessage(prompt: string): void {
    // Add user message with attachments if any
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      role: 'user',
      timestamp: new Date(),
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
      timestamp: new Date(),
      isStreaming: true,
    };

    this.messages.update(messages => [...messages, aiMessage]);

    try {
      if (this.engine && !this.isModelLoading()) {
        // Use WebLLM for streaming response
        await this.streamWebLLMResponse(userMessage, aiMessageId);
      } else {
        // Fallback to demo response
        await this.streamDemoResponse(userMessage, aiMessageId);
      }
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

  private async streamWebLLMResponse(userMessage: string, messageId: string): Promise<void> {
    if (!this.engine) return;

    const asyncChunkGenerator = await this.engine.chat.completions.create({
      messages: [...this.messages(), { role: 'user', content: userMessage }],
      temperature: 0.7,
      stream: true,
    });

    let fullContent = '';

    for await (const chunk of asyncChunkGenerator) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        fullContent += delta;

        // Update the message with streaming content
        this.messages.update(messages =>
          messages.map(msg =>
            msg.id === messageId ? { ...msg, content: fullContent, isStreaming: true } : msg,
          ),
        );
      }
    }

    // Mark streaming as complete
    this.messages.update(messages =>
      messages.map(msg => (msg.id === messageId ? { ...msg, isStreaming: false } : msg)),
    );
  }

  private async streamDemoResponse(userMessage: string, messageId: string): Promise<void> {
    // Generate demo response
    const response = this.getDemoResponse(userMessage);

    // Simulate streaming by adding characters with delay
    let currentContent = '';

    for (let i = 0; i < response.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 20)); // 20ms delay between characters
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

  private getDemoResponse(userMessage: string): string {
    // Simple response generation based on keywords for demo
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
