/**
 * Alternative sync using direct SQL queries via Supabase API
 * Use this if REST API has issues
 */

/**
 * Upsert record using SQL query instead of REST API
 * @param {object} record - Hygiene record
 * @param {object} credentials - Supabase credentials
 * @return {boolean} Success status
 */
function upsertToSupabaseSQL_(record, credentials) {
  try {
    const sql = `
      INSERT INTO hygiene_production (
        id, clinic_id, date, month_tab, 
        hours_worked, estimated_production, verified_production,
        production_goal, variance_percentage, bonus_amount,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      )
      ON CONFLICT (id) DO UPDATE SET
        hours_worked = EXCLUDED.hours_worked,
        estimated_production = EXCLUDED.estimated_production,
        verified_production = EXCLUDED.verified_production,
        production_goal = EXCLUDED.production_goal,
        variance_percentage = EXCLUDED.variance_percentage,
        bonus_amount = EXCLUDED.bonus_amount,
        updated_at = EXCLUDED.updated_at;
    `;
    
    const url = `${credentials.url}/rest/v1/rpc/query`;
    
    const payload = {
      query: sql,
      params: [
        record.id,
        record.clinic_id,
        record.date,
        record.month_tab,
        record.hours_worked,
        record.estimated_production,
        record.verified_production,
        record.production_goal,
        record.variance_percentage,
        record.bonus_amount,
        record.created_at,
        record.updated_at
      ]
    };

    const response = UrlFetchApp.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.key}`,
        'apikey': credentials.key
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const code = response.getResponseCode();
    if (code >= 200 && code < 300) {
      Logger.log(`Successfully synced record for ${record.date}`);
      return true;
    } else {
      Logger.log(`Failed to sync record for ${record.date}: ${response.getContentText()}`);
      return false;
    }

  } catch (error) {
    Logger.log(`Error upserting to Supabase (SQL): ${error.message}`);
    return false;
  }
}

/**
 * Create the RPC function in Supabase (run this once)
 */
function createRPCFunction() {
  const credentials = getSupabaseCredentials_();
  if (!credentials) {
    SpreadsheetApp.getUi().alert('❌ No credentials found. Please run setup first.');
    return;
  }
  
  const sql = `
    CREATE OR REPLACE FUNCTION query(query text, params json DEFAULT '[]'::json)
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      result json;
    BEGIN
      -- This is a simple query executor for Apps Script
      -- In production, you'd want more security checks
      EXECUTE format('SELECT json_agg(row_to_json(t)) FROM (%s) t', query)
      INTO result
      USING params;
      
      RETURN COALESCE(result, '[]'::json);
    END;
    $$;
    
    -- Grant execute permission
    GRANT EXECUTE ON FUNCTION query(text, json) TO service_role;
  `;
  
  try {
    // This would need to be run directly in Supabase SQL editor
    SpreadsheetApp.getUi().alert(
      '📝 RPC Function SQL:\n\n' +
      'Copy and run this in your Supabase SQL editor:\n\n' +
      sql
    );
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.message);
  }
}