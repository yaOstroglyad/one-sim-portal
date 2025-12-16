import {
	Component,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	OnDestroy,
	inject,
	viewChild,
	effect,
	signal,
	untracked,
	ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IconComponent } from '@shared/components/icon';
import { ChatbotApiService, ChatbotStateService, ChatbotPollingService } from './services';
import { GlobalFlyoutService } from '@shared/components/fab-layout';

/**
 * Support Chat Shell Component
 *
 * Fully signals-based implementation.
 * Main container component for support chat feature.
 * Manages overall chat state and coordinates between child components.
 * Handles state-based navigation between thread list and thread view.
 */
@Component({
	standalone: true,
	selector: 'app-support-chat-shell',
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
export class SupportChatShellComponent implements OnDestroy {
	private readonly apiService = inject(ChatbotApiService);
	private readonly pollingService = inject(ChatbotPollingService);
	private readonly flyoutService = inject(GlobalFlyoutService);
	private readonly cdr = inject(ChangeDetectorRef);
	readonly stateService = inject(ChatbotStateService);

	// ViewChild as signal
	readonly messagesContainer = viewChild<ElementRef<HTMLDivElement>>('messagesContainer');

	// Track last message count for auto-scroll
	private readonly lastMessageCount = signal(0);

	constructor() {
		// Auto-scroll effect when messages change
		effect(() => {
			const container = this.messagesContainer();
			const currentMessages = this.stateService.selectedThreadMessages();
			const currentCount = currentMessages.length;

			// Use untracked to avoid infinite loops
			const lastCount = untracked(() => this.lastMessageCount());

			if (container && currentCount > lastCount) {
				this.scrollToBottom(container.nativeElement);
				this.lastMessageCount.set(currentCount);
			}
		});

		// Effect: Auto-search when ICCID is passed via params
		effect(() => {
			const params = this.flyoutService.params() as { iccid?: string } | null;
			if (params?.iccid) {
				// Auto-trigger search with the provided ICCID
				this.onSearch(params.iccid);
			}
		});
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
		this.apiService.getThreads({iccid: iccid.trim()}).subscribe({
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

		const currentMessages = this.stateService.selectedThreadMessages();
		this.lastMessageCount.set(currentMessages.length);
	}

	/**
	 * Handle back navigation from thread view to thread list
	 */
	onBackToThreads(): void {
		this.pollingService.stopPolling();
		this.stateService.setSelectedThreadId(null);
		this.lastMessageCount.set(0);
	}

	/**
	 * Handle toggle control action (take control / return to bot)
	 */
	onToggleControl(): void {
		const selectedThread = this.stateService.selectedThread();

		if (!selectedThread || selectedThread.status === 'expired') {
			return;
		}

		// Toggle isManual flag
		const newIsManual = !selectedThread.isManual;

		this.apiService.updateThread(selectedThread.id, {isManual: newIsManual}).subscribe({
			next: (updatedThread) => {
				// Update the thread in state immediately
				this.stateService.updateThread(updatedThread);
			},
			error: (error) => {
				console.error('[SupportChatShell] Failed to update thread:', error);
				const action = newIsManual ? 'take control of' : 'return to bot';
				this.stateService.setError(`Failed to ${action} conversation`);
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

		if (!selectedThread) {
			return;
		}

		if (!selectedThread.isManual) {
			return;
		}

		this.stateService.setSendingMessage(true);

		const trimmedText = text.trim();

		this.apiService.createMessage(selectedThread.id, {text: trimmedText}).subscribe({
			next: (createdMessage) => {
				this.stateService.setSendingMessage(false);

				// Immediately fetch updated messages
				this.apiService.getMessages(selectedThread.id).subscribe({
					next: (messages) => {
						this.stateService.setMessages(selectedThread.id, messages);

						// Force change detection to update UI
						this.cdr.markForCheck();
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
	private scrollToBottom(element: HTMLDivElement): void {
		element.scrollTop = element.scrollHeight;
	}
}
