/**
 * Sends a batch of records to Supabase with exponential backoff for rate limits.
 * @param {Array<Object>} payload The array of record objects to send.
 * @param {Object} credentials Supabase credentials {url, key}.
 * @param {string|number} batchIdentifier An identifier for logging (e.g., batch number or row number).
 * @return {Object} An object { success: boolean, code: number, body: string | null }
 */
function sendBatchToSupabase_(payload, credentials, batchIdentifier) {
    const apiUrl = `${credentials.url}/rest/v1/${SUPABASE_TABLE_NAME}`;
    let attempt = 0;
    let delay = INITIAL_BACKOFF_MS;

    while (attempt <= MAX_RETRIES) {
        attempt++;
        const options = {
          method: 'post',
          contentType: 'application/json',
          headers: {
            'apikey': credentials.key,
            'Authorization': `Bearer ${credentials.key}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        };

        try {
            Logger.log(`Sending batch ${batchIdentifier}, attempt ${attempt}...`);
            const response = UrlFetchApp.fetch(apiUrl, options);
            const responseCode = response.getResponseCode();
            const responseBody = response.getContentText();

            if (responseCode >= 200 && responseCode < 300) {
                return { success: true, code: responseCode, body: responseBody }; // Success
            }

            if (responseCode === 429 && attempt < MAX_RETRIES) { // Rate limited, retry allowed
                Logger.log(`Rate limit hit (429) on batch ${batchIdentifier}, attempt ${attempt}. Retrying in ${delay}ms...`);
                Utilities.sleep(delay);
                delay *= 2; // Exponential backoff
            } else { // Other error or max retries reached
                Logger.log(`Failed batch ${batchIdentifier} on attempt ${attempt}. Code: ${responseCode}`);
                return { success: false, code: responseCode, body: responseBody };
            }
        } catch (err) {
            // Catch network errors or UrlFetchApp issues
            Logger.log(`UrlFetchApp error during batch ${batchIdentifier}, attempt ${attempt}: ${err.message}`);
            if (attempt >= MAX_RETRIES) {
                 return { success: false, code: -1, body: `UrlFetchApp error: ${err.message}` }; // Indicate fetch error
            }
            // Retry on fetch error as well?
             Logger.log(`Retrying batch ${batchIdentifier} after UrlFetchApp error in ${delay}ms...`);
             Utilities.sleep(delay);
             delay *= 2;
        }
    }
    // Should not be reached if MAX_RETRIES >= 1, but added for safety
    return { success: false, code: -2, body: 'Max retries exceeded without success or specific failure.' };
} 