import {
	Component,
	ChangeDetectionStrategy,
	OnDestroy,
	inject,
	ViewChild,
	ElementRef,
	AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IconComponent } from '../../shared/components/icon';
import { ChatbotApiService, ChatbotStateService, ChatbotPollingService } from './services';

/**
 * Support Chat Shell Component
 *
 * Main container component for support chat feature.
 * Manages overall chat state and coordinates between child components.
 * Handles state-based navigation between thread list and thread view.
 */
@Component({
	selector: 'app-support-chat-shell',
	standalone: true,
	imports: [
		CommonModule,
		TranslateModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		IconComponent
	],
	templateUrl: './support-chat.shell.component.html',
	styleUrls: ['./support-chat.shell.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportChatShellComponent implements OnDestroy, AfterViewChecked {
	private readonly apiService = inject(ChatbotApiService);
	private readonly pollingService = inject(ChatbotPollingService);
	readonly stateService = inject(ChatbotStateService);

	@ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;
	private lastMessageCount = 0;

	ngAfterViewChecked(): void {
		// Auto-scroll to bottom when new messages arrive
		const currentMessageCount = this.stateService.selectedThreadMessages().length;
		if (this.messagesContainer && currentMessageCount > this.lastMessageCount) {
			this.scrollToBottom();
			this.lastMessageCount = currentMessageCount;
		}
	}

	ngOnDestroy(): void {
		// Stop polling when component is destroyed
		this.pollingService.stopPolling();
		// Reset state
		this.stateService.reset();
	}

	/**
	 * Handle ICCID search
	 */
	onSearch(iccid: string): void {
		if (!iccid || iccid.trim().length === 0) {
			return;
		}

		// Set ICCID in state
		this.stateService.setIccid(iccid.trim());
		this.stateService.clearError();
		this.stateService.setLoadingThreads(true);

		// Load threads
		this.apiService.getThreads({iccid: iccid.trim(), status: 'active'}).subscribe({
			next: (threads) => {
				this.stateService.setThreads(threads);
				this.stateService.setLoadingThreads(false);
			},
			error: (error) => {
				console.error('[SupportChatShell] Failed to load threads:', error);
				this.stateService.setError('Failed to load conversations');
				this.stateService.setLoadingThreads(false);
			}
		});
	}

	/**
	 * Handle thread selection - set selected thread and start polling
	 */
	onSelectThread(threadId: string, event?: Event): void {
		// Prevent event propagation to avoid closing flyout
		if (event) {
			event.stopPropagation();
		}

		this.stateService.setSelectedThreadId(threadId);
		this.pollingService.startPolling(threadId);
		this.lastMessageCount = this.stateService.selectedThreadMessages().length;
	}

	/**
	 * Handle back navigation from thread view to thread list
	 */
	onBackToThreads(): void {
		this.pollingService.stopPolling();
		this.stateService.setSelectedThreadId(null);
		this.lastMessageCount = 0;
	}

	/**
	 * Handle take control action
	 */
	onTakeControl(): void {
		const selectedThread = this.stateService.selectedThread();
		if (!selectedThread || selectedThread.isManual) {
			return;
		}

		this.apiService.updateThread(selectedThread.id, {isManual: true}).subscribe({
			next: () => {
				// Polling will pick up the updated thread state
			},
			error: (error) => {
				console.error('[SupportChatShell] Failed to take control:', error);
				this.stateService.setError('Failed to take control of conversation');
			}
		});
	}

	/**
	 * Handle sending a message
	 */
	onSendMessage(text: string): void {
		if (!text || text.trim().length === 0) {
			return;
		}

		const selectedThread = this.stateService.selectedThread();
		if (!selectedThread || !selectedThread.isManual) {
			return;
		}

		this.stateService.setSendingMessage(true);

		this.apiService.createMessage(selectedThread.id, {text: text.trim()}).subscribe({
			next: () => {
				this.stateService.setSendingMessage(false);
				// Immediately fetch updated messages
				this.apiService.getMessages(selectedThread.id).subscribe({
					next: (messages) => {
						this.stateService.setMessages(selectedThread.id, messages);
					},
					error: (error) => {
						console.error('[SupportChatShell] Failed to fetch messages after send:', error);
					}
				});
			},
			error: (error) => {
				console.error('[SupportChatShell] Failed to send message:', error);
				this.stateService.setError('Failed to send message');
				this.stateService.setSendingMessage(false);
			}
		});
	}

	/**
	 * Scroll messages container to bottom
	 */
	private scrollToBottom(): void {
		if (this.messagesContainer) {
			const element = this.messagesContainer.nativeElement;
			element.scrollTop = element.scrollHeight;
		}
	}
}
