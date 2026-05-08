---
name: AI Assistant
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/ai-assistant'
---

# AI Assistant

Build a customizable AI chat assistant by composing multiple primitives. These primitives provide accessible, flexible building blocks for chat threads, message display, prompt input, dictation, and submission—allowing you to create rich conversational interfaces tailored to your application's needs.

**Note:** The AI Assistant primitives are currently experimental. The API may change in future releases.

<docs-example name="ai-assistant"></docs-example>

## Import

Import the AI primitives from `ng-primitives/ai`.

```ts
import {
  NgpThread,
  NgpThreadViewport,
  NgpThreadMessage,
  NgpThreadSuggestion,
  NgpPromptComposer,
  NgpPromptComposerInput,
  NgpPromptComposerSubmit,
  NgpPromptComposerDictation,
} from 'ng-primitives/ai';
```

## Usage

Assemble the AI directives in your template.

```html
<div ngpThread>
  <div ngpThreadViewport>
    <div ngpThreadMessage>
      <div>Message content</div>
    </div>
  </div>

  <div ngpThreadSuggestion>...</div>

  <div ngpPromptComposer>
    <textarea ngpPromptComposerInput></textarea>
    <button ngpPromptComposerDictation>Mic</button>
    <button ngpPromptComposerSubmit>Send</button>
  </div>
</div>
```

## API Reference

The following directives are available to import from the `ng-primitives/ai` package:

### NgpThread

The `NgpThread` directive is wrapper around the thread viewport, messages and composer in the AI assistant chat.

<api-docs name="NgpThread"></api-docs>

<api-reference-props name="NgpThread"></api-reference-props>

### NgpThreadViewport

The `NgpThreadViewport` directive creates a scrollable container for displaying the messages in the AI assistant chat thread.

<api-docs name="NgpThreadViewport"></api-docs>

<api-reference-props name="NgpThreadViewport"></api-reference-props>

### NgpThreadMessage

The `NgpThreadMessage` directive represents an individual message within a thread in the AI assistant chat.

<api-docs name="NgpThreadMessage"></api-docs>

<api-reference-props name="NgpThreadMessage"></api-reference-props>

### NgpThreadSuggestion

The `NgpThreadSuggestion` directive displays suggested text that the user can click to populate the prompt input field.

<api-docs name="NgpThreadSuggestion"></api-docs>

<api-reference-props name="NgpThreadSuggestion"></api-reference-props>

### NgpPromptComposer

The `NgpPromptComposer` directive creates a container for composing and submitting prompts to the AI assistant.

<api-docs name="NgpPromptComposer"></api-docs>

<api-reference-props name="NgpPromptComposer"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-prompt" description="Added when there is text content in the prompt." />
  <api-attribute name="data-dictating" description="Added when speech dictation is active." />
  <api-attribute name="data-dictation-supported" description="Added when speech dictation is supported by the browser." />
</api-reference-attributes>

### NgpPromptComposerInput

The `NgpPromptComposerInput` directive is used for the text input field where users type their messages.

<api-docs name="NgpPromptComposerInput"></api-docs>

<api-reference-props name="NgpPromptComposerInput"></api-reference-props>

### NgpPromptComposerSubmit

The `NgpPromptComposerSubmit` directive handles the submission of composed prompts to the AI assistant.

<api-docs name="NgpPromptComposerSubmit"></api-docs>

<api-reference-props name="NgpPromptComposerSubmit"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-prompt" description="Added when there is text content in the prompt." />
  <api-attribute name="data-dictating" description="Added when speech dictation is active." />
  <api-attribute name="data-dictation-supported" description="Added when speech dictation is supported by the browser." />
</api-reference-attributes>

### NgpPromptComposerDictation

The `NgpPromptComposerDictation` directive enables voice input functionality for composing prompts using speech-to-text.

<api-docs name="NgpPromptComposerDictation"></api-docs>

<api-reference-props name="NgpPromptComposerDictation"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-dictating" description="Added when speech dictation is active." />
  <api-attribute name="data-dictation-supported" description="Added when speech dictation is supported by the browser." />
  <api-attribute name="data-prompt" description="Added when there is text content in the prompt." />
</api-reference-attributes>

## Accessibility

### Keyboard Interactions

- <kbd>Enter</kbd> - Submits the prompt when focused on the input field.
- <kbd>Shift+Enter</kbd> - Inserts a newline in the input field.
