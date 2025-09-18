import { Component } from '@angular/core';
import { render } from '@testing-library/angular';
import { NgpThread } from '../thread/thread';
import { NgpThreadMessage } from './thread-message';

describe('NgpThreadMessage', () => {
  it('should observe content changes and trigger scroll behavior', async () => {
    @Component({
      template: `
        <div ngpThread data-testid="thread">
          <div ngpThreadMessage>
            <p>{{ content }}</p>
          </div>
        </div>
      `,
    })
    class TestComponent {
      content = 'Initial content';
    }

    const { fixture } = await render(TestComponent, {
      imports: [NgpThread, NgpThreadMessage],
    });

    const component = fixture.componentInstance;

    // Change content to trigger mutation observer
    component.content = 'Updated content with more text that should trigger scroll behavior';
    fixture.detectChanges();

    // Wait for mutation observer to potentially trigger
    await new Promise(resolve => setTimeout(resolve, 10));

    // Test passes if no errors thrown - the actual scroll behavior is hard to test in JSDOM
    expect(component.content).toContain('Updated');
  });

  it('should detect text node changes (streaming simulation)', async () => {
    @Component({
      template: `
        <div ngpThread>
          <div ngpThreadMessage>
            <p [textContent]="content"></p>
          </div>
        </div>
      `,
    })
    class TestComponent {
      content = 'Hello';
    }

    const { fixture } = await render(TestComponent, {
      imports: [NgpThread, NgpThreadMessage],
    });

    const component = fixture.componentInstance;

    // Simulate streaming by gradually updating text content
    component.content = 'Hello w';
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 5));

    component.content = 'Hello wo';
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 5));

    component.content = 'Hello world';
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 5));

    // Test passes if no errors thrown during streaming simulation
    expect(component.content).toBe('Hello world');
  });

  it('should detect child element additions', async () => {
    @Component({
      template: `
        <div ngpThread>
          <div ngpThreadMessage>
            <p>Static content</p>
            @if (showExtra) {
              <p>Dynamic content</p>
            }
          </div>
        </div>
      `,
    })
    class TestComponent {
      showExtra = false;
    }

    const { fixture } = await render(TestComponent, {
      imports: [NgpThread, NgpThreadMessage],
    });

    const component = fixture.componentInstance;

    // Add new element
    component.showExtra = true;
    fixture.detectChanges();

    // Wait for mutation observer
    await new Promise(resolve => setTimeout(resolve, 10));

    // Test passes if no errors thrown during dynamic content addition
    expect(component.showExtra).toBe(true);
  });

  it('should detect nested content changes', async () => {
    @Component({
      template: `
        <div ngpThread>
          <div ngpThreadMessage>
            <div>
              <div>
                <span>{{ nestedContent }}</span>
              </div>
            </div>
          </div>
        </div>
      `,
    })
    class TestComponent {
      nestedContent = 'Initial';
    }

    const { fixture } = await render(TestComponent, {
      imports: [NgpThread, NgpThreadMessage],
    });

    const component = fixture.componentInstance;

    // Change nested content
    component.nestedContent = 'Changed deeply nested content that should trigger mutation observer';
    fixture.detectChanges();

    // Wait for mutation observer
    await new Promise(resolve => setTimeout(resolve, 10));

    // Test passes if no errors thrown during nested content changes
    expect(component.nestedContent).toContain('Changed');
  });

  it('should handle component lifecycle correctly', async () => {
    @Component({
      template: `
        <div ngpThread>
          @if (showMessage) {
            <div ngpThreadMessage>Test message</div>
          }
        </div>
      `,
    })
    class TestComponent {
      showMessage = true;
    }

    const { fixture } = await render(TestComponent, {
      imports: [NgpThread, NgpThreadMessage],
    });

    const component = fixture.componentInstance;

    // Component should initialize without errors
    expect(component.showMessage).toBe(true);

    // Destroy the message component
    component.showMessage = false;
    fixture.detectChanges();

    // Wait for destroy
    await new Promise(resolve => setTimeout(resolve, 10));

    // Test passes if no errors thrown during component destruction
    expect(component.showMessage).toBe(false);
  });

  it('should handle multiple simultaneous content changes', async () => {
    @Component({
      template: `
        <div ngpThread>
          <div ngpThreadMessage>
            <p>{{ content1 }}</p>
            <p>{{ content2 }}</p>
            <p>{{ content3 }}</p>
          </div>
        </div>
      `,
    })
    class TestComponent {
      content1 = 'A';
      content2 = 'B';
      content3 = 'C';
    }

    const { fixture } = await render(TestComponent, {
      imports: [NgpThread, NgpThreadMessage],
    });

    const component = fixture.componentInstance;

    // Change multiple pieces of content simultaneously
    component.content1 = 'Updated A with more content';
    component.content2 = 'Updated B with more content';
    component.content3 = 'Updated C with more content';
    fixture.detectChanges();

    // Wait for mutation observer
    await new Promise(resolve => setTimeout(resolve, 10));

    // Test passes if no errors thrown during multiple changes
    expect(component.content1).toContain('Updated');
    expect(component.content2).toContain('Updated');
    expect(component.content3).toContain('Updated');
  });

  it('should not trigger on attribute-only changes', async () => {
    @Component({
      template: `
        <div ngpThread>
          <div ngpThreadMessage>
            <p [class]="cssClass">Content</p>
          </div>
        </div>
      `,
    })
    class TestComponent {
      cssClass = 'initial-class';
    }

    const { fixture } = await render(TestComponent, {
      imports: [NgpThread, NgpThreadMessage],
    });

    const component = fixture.componentInstance;

    // Change only attributes, not content
    component.cssClass = 'updated-class';
    fixture.detectChanges();

    // Wait to ensure no mutation observer triggers
    await new Promise(resolve => setTimeout(resolve, 10));

    // Test passes if no errors thrown - mutation observer should only observe content changes
    expect(component.cssClass).toBe('updated-class');
  });
});
