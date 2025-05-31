# Location Production Sync

This system syncs production data from Google Sheets tabs (Baytown and Humble) to a Supabase location_production table. It is integrated with the main Supabase Sync system.

## Overview

The Location Production Sync feature allows you to:
- Track location-level production data (not just provider-level)
- Store daily net production and collections for each location
- Prevent duplicates with a unique constraint on location_id and date
- Sync data automatically on edit and daily

## How to Use

1. **Access the Location Sync Menu**:
   - Open the Master Production Sheet
   - Click on the "Supabase Sync" menu
   - Select "Location Production" submenu
   - Choose one of the sync options:
     - "Sync All Location Data"
     - "Sync Baytown Data"
     - "Sync Humble Data"

2. **Setup**:
   - The location sync is automatically set up when you run "1. Setup Sync (Credentials & Triggers)"
   - This creates both time-based and on-edit triggers for location data

## How It Works

The script:
1. Reads data from the Baytown and Humble tabs in the master spreadsheet
2. Maps each location to its ID in Supabase using simple short IDs (BT, HM)
3. For each row with data, it extracts the date, net production, and collections
4. Checks if the record already exists in Supabase
5. Inserts new records or updates existing ones
6. Prevents duplicates using a unique constraint on location_id and date

## Triggers

The script has two types of triggers:
1. **On Edit**: Automatically syncs when you edit the Baytown or Humble sheets
2. **Daily**: Runs at 2 AM every day to ensure all data is synced (after the main sync at 1 AM)

## Troubleshooting

If you encounter issues:
1. Check the Supabase-Sync-Log tab for error details
2. Verify your Supabase credentials are set correctly
3. Ensure the sheet tabs are named exactly "Baytown" and "Humble"
4. Confirm the required columns exist in both sheets:
   - "Date" column (for the date of the production data)
   - "Net production" column (for the net production amount)
   - "Collections" column (for the collections amount)

   Note: The column matching is case-insensitive and ignores extra spaces. The script will also recognize variations like "netproduction" or "collection".

5. **Debug Tools**: If you're having trouble, use these debug options in the Location Production menu:
   - **Debug Column Headers**: Shows what headers were found and whether required columns were detected
   - **Count Rows for Sync**: Analyzes how many rows would be synced and why some might be skipped

   Note: The script now handles zero values properly. Only rows without a date will be skipped.

## Adding New Locations

To add a new location:
1. Add the location to the Supabase locations table with a unique short_id
2. Update the `LOCATION_MAP` in the location-sync.gs file to include the new location
3. Create a new sheet tab with the location name
4. Add the same column structure as the existing location tabs
5. Update the menu and sync functions to include the new location

## Data Structure

The location_production table in Supabase has the following structure:
- id (UUID, primary key)
- location_id (UUID, foreign key to locations table)
- date (DATE)
- net_production (NUMERIC)
- collections (NUMERIC)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

With a unique constraint on (location_id, date) to prevent duplicates.
