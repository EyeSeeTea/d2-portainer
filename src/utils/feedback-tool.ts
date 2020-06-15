export interface FeedbackToolOptions {
    token: string[];
    createIssue: boolean;
    issues: {
        repository: string;
        title: string;
        body: string;
    };
    snapshots: {
        repository: string;
        branch: string;
    };
    feedbackOptions: {};
}

export interface FeedbackWindow extends FeedbackToolOptions {
    $: {
        feedbackGithub(options: FeedbackToolOptions): void;
    };
}

export function initFeedbackTool(options: FeedbackToolOptions, window: FeedbackWindow): void {
    const fullOptions = {
        ...options,
        i18nPath: "feedback-tool/i18n",
    };
    window.$.feedbackGithub(fullOptions);
}
