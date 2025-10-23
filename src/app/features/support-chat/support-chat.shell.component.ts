import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-support-chat-shell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="support-chat">
      <div class="support-chat__header">
        <h3 class="support-chat__title">Support Chat</h3>
        <span class="support-chat__status">
          <span class="status-dot"></span>
          Online
        </span>
      </div>
      
      <div class="support-chat__messages">
        <div class="message message--bot">
          <div class="message__avatar">🤖</div>
          <div class="message__content">
            <p>Hello! I'm here to help you with any questions or issues you may have.</p>
            <p>How can I assist you today?</p>
          </div>
        </div>
      </div>
      
      <div class="support-chat__input">
        <input 
          type="text" 
          class="support-chat__input-field" 
          placeholder="Type your message..."
          disabled>
        <button class="support-chat__send" disabled>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.925 5.025l14.96-4.98a.5.5 0 01.615.615l-4.98 14.96a.5.5 0 01-.94.035l-2.224-5.343a1 1 0 00-.593-.593l-5.343-2.224a.5.5 0 01.035-.94l-.47.175.47-.175z"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @use "../../../scss/variables" as vars;
    @use "../../../scss/mixins" as mixins;
    
    :host {
      display: block;
      height: 100%;
    }
    
    .support-chat {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: var(--os-color-white);
    }
    
    .support-chat__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--os-color-border);
      background-color: var(--os-color-subtle-bg);
    }
    
    .support-chat__title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
      color: var(--os-color-text);
    }
    
    .support-chat__status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: var(--os-color-success);
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--os-color-success);
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    
    .support-chat__messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }
    
    .message {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .message__avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--os-color-primary);
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    
    .message__content {
      flex: 1;
      background-color: var(--os-color-subtle-bg);
      padding: 12px 16px;
      border-radius: var(--os-border-radius-medium);
      
      p {
        margin: 0 0 8px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    
    .support-chat__input {
      display: flex;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid var(--os-color-border);
      background-color: var(--os-color-white);
    }
    
    .support-chat__input-field {
      flex: 1;
      padding: 10px 16px;
      border: 1px solid var(--os-color-border);
      border-radius: var(--os-border-radius-medium);
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.15s ease-in-out;
      background-color: var(--os-color-white);
      color: var(--os-color-text);
      
      &:focus {
        border-color: var(--os-color-primary);
      }
      
      &:disabled {
        background-color: var(--os-color-subtle-bg);
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
    
    .support-chat__send {
      @include mixins.interactive-states();
      width: 40px;
      height: 40px;
      border: none;
      background-color: var(--os-color-primary);
      color: white;
      border-radius: var(--os-border-radius-medium);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      
      &:hover:not(:disabled) {
        background-color: var(--os-color-primary-shade);
        transform: scale(1.05);
      }
      
      &:disabled {
        @include mixins.disabled-state();
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportChatShellComponent {}