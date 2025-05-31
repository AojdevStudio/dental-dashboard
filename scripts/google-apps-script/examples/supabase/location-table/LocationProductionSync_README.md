# Location Production Sync

This system syncs production data from Google Sheets tabs (Baytown and Humble) to a Supabase location_production table.

## Setup Instructions

1. **Add the Script to Your Google Sheet**:
   - Open your Google Sheet with the Baytown and Humble tabs
   - Go to Extensions > Apps Script
   - Copy the contents of `LocationProductionSync.gs` into the script editor
   - Replace the empty `SUPABASE_KEY` value with your actual Supabase API key

2. **Set Up Triggers**:
   - In the Apps Script editor, run the `setupTriggers` function once
   - This will create a daily trigger to sync data automatically

3. **Manual Sync**:
   - After adding the script, refresh your Google Sheet
   - You'll see a new menu item called "Location Sync"
   - Use this menu to manually sync data when needed

## How It Works

The script:
1. Reads data from the Baytown and Humble tabs
2. Maps each location to its ID in Supabase using simple short IDs (BT, HM)
3. For each row with data, it extracts the date, net production, and collections
4. Checks if the record already exists in Supabase
5. Inserts new records or updates existing ones
6. Prevents duplicates using a unique constraint on location_id and date

## Triggers

The script has two types of triggers:
1. **On Edit**: Automatically syncs when you edit the Baytown or Humble sheets
2. **Daily**: Runs at 1 AM every day to ensure all data is synced

## Troubleshooting

If you encounter issues:
1. Check the Apps Script logs for error details
2. Verify your Supabase API key is correct
3. Ensure the sheet tabs are named exactly "Baytown" and "Humble"
4. Confirm the columns "Date", "Net production", and "Collections" exist in both sheets

## Adding New Locations

To add a new location:
1. Add the location to the Supabase locations table with a unique short_id
2. Update the `LOCATION_MAP` in the script to include the new location
3. Create a new sheet tab with the location name
4. Add the same column structure as the existing location tabs
