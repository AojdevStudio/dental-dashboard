/**
 * @fileoverview Notification module for the Adriane Hygienist Sync application.
 * 
 * This module contains functions for sending notifications and alerts:
 * - Email notifications for errors and critical events
 * - Status updates and completion notifications
 * - Alert formatting and delivery
 * - Notification throttling and batching
 * 
 * The notification module ensures that users and administrators are
 * promptly informed of important events and issues in the application.
 */

/**
 * Sends an email notification about an error encountered during script execution.
 * Includes script ID and links to execution logs/editor.
 *
 * @param {string} scope A description of where the error occurred (e.g., function name).
 * @param {Error|string} error The error object caught, or an error message string.
 * @param {string} [additionalContext=''] Optional additional context to include in the email body.
 */
function notifyError_(scope, error, additionalContext = '') {
  try {
    // Attempt to get the active user's email, provide a fallback
    let recipient = '';
    try { // Session calls can fail in some contexts
      recipient = Session.getActiveUser().getEmail();
    } catch (e) {
      Logger.log(`Could not get active user email: ${e.message}. Using fallback.`);
    }

    if (!recipient) {
      // Fallback email if running as a service account or user email isn't available
      // IMPORTANT: Replace with a valid email address you monitor
      recipient = 'your-monitoring-email@example.com'; // <<< SET YOUR FALLBACK EMAIL HERE
      Logger.log(`Sending notification to fallback: ${recipient}`);
    }

    if (!recipient || !recipient.includes('@')) {
      Logger.log(`ERROR: Invalid recipient email configured for error notifications: "${recipient}". Cannot send notification.`);
      return; // Don't try to send if recipient is invalid
    }

    const subject = `[Apps Script Error] ${PROVIDER_NAME} Sync (${scope})`;

    // Standardize error info extraction
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    const errorStack = (error instanceof Error && error.stack) ? error.stack : '(No stack trace available)';

    let body = `An error occurred in the ${PROVIDER_NAME} data sync script.\n\n`;
    body += `Timestamp: ${new Date().toISOString()}\n`; // Use ISO format for clarity
    body += `Scope/Function: ${scope}\n`;
    if (additionalContext) {
      body += `Context: ${additionalContext}\n`;
    }
    body += `Error Message: ${errorMessage}\n\n`;
    body += `Stack Trace:\n${errorStack}\n`;

    // Add links to Execution logs and the script editor for convenience
    const scriptId = ScriptApp.getScriptId();
    body += '---\n';
    body += `Script ID: ${scriptId}\n`;
    body += `View Executions: https://script.google.com/home/projects/${scriptId}/executions\n`;
    // Note: Direct link to editor might vary slightly based on context (legacy/new editor)
    body += `Open Script Editor: https://script.google.com/d/${scriptId}/edit\n`;

    // Log the notification attempt
    Logger.log(`Sending error notification to ${recipient} for scope "${scope}"`);

    // Send the email
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      body: body,
      // Optional: Use no-reply if preferred and configured
      // noReply: true
    });

  } catch (mailError) {
    // Log an error if the notification email itself fails
    Logger.log(`CRITICAL ERROR: Failed to send error notification email. Scope: ${scope}. Mail Error: ${mailError.message}\n${mailError.stack}`);
  }
}