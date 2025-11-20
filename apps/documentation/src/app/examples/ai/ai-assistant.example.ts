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
  ],
  providers: [provideIcons({ lucideArrowUp, lucideMic, lucidePlus, lucideX })],
  template: `
    <div class="ai-container" ngpThread>
      <div class="ai-chat-wrapper">
        <div class="ai-chat-content">
          <div class="ai-viewport" ngpThreadViewport>
            @if (!hasMessages()) {
              <!-- Welcome Message and Suggestions -->
              <div class="ai-welcome-container">
                <div class="ai-welcome-content">
                  <h1 class="ai-welcome-title">{{ welcomeMessage }}</h1>
                  <p class="ai-welcome-subtitle">
                    Choose a suggestion below or type your own message to get started.
                  </p>
                </div>

                <!-- Suggestions -->
                <div class="ai-suggestions-grid">
                  @for (suggestion of suggestions; track suggestion) {
                    <button
                      class="ai-suggestion-button"
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
                    class="ai-message"
                    [class.ai-message-user]="message.role === 'user'"
                    [class.ai-message-assistant]="message.role !== 'user'"
                    ngpThreadMessage
                  >
                    <!-- Message Attachments -->
                    @if (message.attachments && message.attachments.length > 0) {
                      <div class="ai-attachments">
                        @for (attachment of message.attachments; track attachment.id) {
                          @if (attachment.type === 'image') {
                            <img
                              class="ai-attachment-image"
                              [src]="attachment.preview"
                              [alt]="attachment.file.name"
                            />
                          } @else {
                            <div class="ai-attachment-file">
                              <span>{{ attachment.file.name }}</span>
                            </div>
                          }
                        }
                      </div>
                    }

                    <div
                      class="ai-message-bubble"
                      [class.ai-message-bubble-user]="message.role === 'user'"
                      [class.ai-message-bubble-assistant]="message.role !== 'user'"
                    >
                      <p>
                        {{ message.content }}

                        @if (message.isStreaming) {
                          <span class="ai-streaming-wrapper">
                            <div class="streaming-indicator"></div>
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
          <div class="ai-attachment-previews-container">
            <div class="ai-attachment-previews">
              @for (attachment of attachments(); track attachment.id) {
                <div class="ai-attachment-preview-item">
                  @if (attachment.type === 'image') {
                    <img
                      class="ai-attachment-preview-image"
                      [src]="attachment.preview"
                      [alt]="attachment.file.name"
                    />
                  } @else {
                    <div class="ai-attachment-preview-file">
                      <span class="ai-attachment-extension">
                        {{ attachment.file.name.split('.').pop()?.toUpperCase() }}
                      </span>
                    </div>
                  }
                  <button
                    class="ai-attachment-remove"
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

        <div class="ai-composer" (ngpPromptComposerSubmit)="sendMessage($event)" ngpPromptComposer>
          <button
            class="ai-composer-button ai-file-button"
            (ngpFileUploadSelected)="addAttachment($event)"
            ngpButton
            type="button"
            ngpFileUpload
            ngpFileUploadMultiple="true"
            ngpFileUploadFileTypes="image/*"
            aria-label="Add Attachment"
          >
            <ng-icon class="ai-icon" name="lucidePlus" />
          </button>

          <textarea
            class="ai-textarea"
            ngpPromptComposerInput
            style="field-sizing: content;"
            name="input"
            placeholder="Message ChatNGP"
            rows="1"
          ></textarea>

          <button
            class="ai-composer-button ai-dictation-button"
            #dictation="ngpPromptComposerDictation"
            type="button"
            ngpPromptComposerDictation
            aria-label="Dictation"
          >
            <ng-icon class="ai-icon" [name]="dictation.isDictating() ? 'lucideX' : 'lucideMic'" />
          </button>

          <button
            class="ai-composer-button ai-send-button"
            type="button"
            ngpPromptComposerSubmit
            aria-label="Send Message"
          >
            <ng-icon class="ai-icon" name="lucideArrowUp" />
          </button>
        </div>

        <p class="ai-disclaimer">ChatNGP can make mistakes. Check important info.</p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }

    /* Container */
    .ai-container {
      height: 700px;
      width: 100%;
    }

    .ai-chat-wrapper {
      display: flex;
      height: 100%;
      flex-direction: column;
      align-items: stretch;
      border-radius: 1rem;
      background-color: var(--ngp-background);
      padding: 0 1rem;
      box-shadow: var(--ngp-shadow-border);
    }

    .ai-chat-content {
      display: flex;
      grow: 1;
      flex-direction: column;
      gap: 1rem;
      overflow: hidden;
      padding-top: 1rem;
    }

    .ai-viewport {
      display: flex;
      grow: 1;
      flex-direction: column;
      gap: 1rem;
      overflow-y: auto;
      padding: 0 0.5rem 1rem;
    }

    /* Welcome State */
    .ai-welcome-container {
      display: flex;
      grow: 1;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      text-align: center;
    }

    .ai-welcome-content {
      max-width: 28rem;
    }

    .ai-welcome-title {
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--ngp-text-emphasis);
      line-height: 32px;
    }

    .ai-welcome-subtitle {
      font-size: 0.875rem;
      color: var(--ngp-text-secondary);
      line-height: 24px;
    }

    .ai-suggestions-grid {
      display: grid;
      width: 100%;
      max-width: 32rem;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    @media (min-width: 768px) {
      .ai-suggestions-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .ai-suggestion-button {
      border-radius: 0.5rem;
      box-shadow: var(--ngp-shadow-border);
      padding: 10px 0.75rem;
      text-align: left;
      font-size: 0.875rem;
      background-color: var(--ngp-background);
      color: var(--ngp-text-secondary);
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .ai-suggestion-button:hover,
    .ai-suggestion-button[data-hover] {
      border-color: var(--ngp-border);
      background-color: var(--ngp-background-hover);
    }

    /* Messages */
    .ai-message {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .ai-message-user {
      align-items: flex-end;
    }

    .ai-message-assistant {
      align-items: flex-start;
    }

    .ai-attachments {
      display: flex;
      max-width: 80%;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .ai-attachment-image {
      max-height: 8rem;
      max-width: 20rem;
      border-radius: 0.5rem;
      border: 1px solid var(--ngp-border-secondary);
      object-fit: cover;
    }

    .ai-attachment-file {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-radius: 0.5rem;
      border: 1px solid var(--ngp-border-secondary);
      background-color: var(--ngp-background-hover);
      padding: 0.5rem;
      font-size: 0.75rem;
      color: var(--ngp-text-secondary);
    }

    .ai-message-bubble {
      max-width: 80%;
      border-radius: 1rem;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
    }

    .ai-message-bubble-user {
      background-color: var(--ngp-background-inverse);
      color: var(--ngp-text-inverse);
    }

    .ai-message-bubble-assistant {
      background-color: var(--ngp-background-active);
      color: var(--ngp-text-primary);
    }

    .ai-streaming-wrapper {
      margin-left: 0.25rem;
      display: inline-flex;
    }

    .streaming-indicator {
      height: 0.5rem;
      width: 0.5rem;
      border-radius: 50%;
      background-color: var(--ngp-text-tertiary);
      animation: pulse 1.5s ease-in-out infinite;
    }

    /* Attachment Previews */
    .ai-attachment-previews-container {
      margin: 0 auto;
      width: 100%;
      max-width: 768px;
      padding: 0 1rem 0.5rem;
    }

    .ai-attachment-previews {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .ai-attachment-preview-item {
      position: relative;
    }

    .ai-attachment-preview-item:hover .ai-attachment-remove {
      opacity: 1;
    }

    .ai-attachment-preview-image {
      height: 4rem;
      width: 4rem;
      cursor: pointer;
      border-radius: 0.5rem;
      border: 1px solid var(--ngp-border-secondary);
      object-fit: cover;
      transition: opacity 0.2s ease;
    }

    .ai-attachment-preview-image:hover {
      opacity: 0.8;
    }

    .ai-attachment-preview-file {
      display: flex;
      height: 4rem;
      width: 4rem;
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      border: 1px solid var(--ngp-border-secondary);
      background-color: var(--ngp-background-hover);
    }

    .ai-attachment-extension {
      font-size: 0.75rem;
      color: var(--ngp-text-secondary);
    }

    .ai-attachment-remove {
      position: absolute;
      right: -0.25rem;
      top: -0.25rem;
      display: flex;
      height: 1.25rem;
      width: 1.25rem;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: var(--ngp-text-red);
      color: var(--ngp-text-inverse);
      opacity: 0;
      transition: opacity 0.2s ease;
      border: none;
      cursor: pointer;
      font-size: 0.75rem;
    }

    /* Composer */
    .ai-composer {
      margin: 0 auto;
      display: flex;
      width: 100%;
      max-width: 768px;
      align-items: flex-end;
      border-radius: 1.5rem;
      background-color: rgba(255, 255, 255, 0.05);
      box-shadow: var(--ngp-shadow-border);
    }

    .ai-composer-button {
      margin: 0.5rem;
      display: flex;
      height: 2rem;
      width: 2rem;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s ease;
      border: none;
      cursor: pointer;
      background-color: transparent;
    }

    .ai-file-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .ai-dictation-button {
      display: none;
    }

    .ai-dictation-button[data-dictation-supported]:not([data-prompt]) {
      display: flex;
    }

    .ai-dictation-button[data-prompt]:not([data-dictating]) {
      display: none;
    }

    .ai-dictation-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .ai-dictation-button[data-dictating] {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .ai-dictation-button[data-dictating]:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .ai-send-button {
      display: none;
      background-color: var(--ngp-background-inverse);
      color: var(--ngp-text-inverse);
    }

    .ai-send-button[data-prompt] {
      display: flex;
    }

    .ai-textarea {
      max-height: 10rem;
      min-height: 3rem;
      grow: 1;
      resize: none;
      background-color: transparent;
      padding: 0.75rem 0;
      font-size: 0.875rem;
      outline: none;
      border: none;
      color: var(--ngp-text-primary);
    }

    .ai-textarea::placeholder {
      color: var(--ngp-text-placeholder);
    }

    .ai-icon {
      font-size: 14px;
      color: var(--ngp-text-secondary);
    }

    .ai-send-button .ai-icon {
      color: var(--ngp-text-inverse);
    }

    /* Disclaimer */
    .ai-disclaimer {
      margin: 0.25rem 0;
      padding: 0.5rem;
      text-align: center;
      font-size: 0.75rem;
      color: var(--ngp-text-placeholder);
    }

    /* Animations */
    @keyframes pulse {
      0%,
      100% {
        opacity: 0.4;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.1);
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
