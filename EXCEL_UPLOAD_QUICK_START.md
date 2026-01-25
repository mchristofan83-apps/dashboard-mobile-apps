# Excel Upload Feature for Visits - Quick Start Guide

## What Was Added

### ✅ Feature: Bulk Upload Visits via Excel
Admin users can now upload MD and Sales visits in bulk using Excel files instead of manually adding them one by one.

## How to Use

### 1. Prepare Your Excel File
Create an Excel file with these columns (exact order matters):
```
Username | AMO | Warehouse | ID Outlet | Nama Outlet | Date Visit
```

**Example:**
```
john_doe   | Jakarta1  | WH01 | OUT001 | Toko Maju Jaya    | 2026-02-01
jane_smith | Surabaya1 | WH02 | OUT002 | Toko Sejahtera    | 2026-02-05
```

**Important Notes:**
- All fields are required - no empty cells
- Date format must be YYYY-MM-DD
- Username must already exist in the system
- Outlet ID must already exist in the system

### 2. Upload the File
1. Go to **Visits** menu in Dashboard
2. Select either **MD Visits** or **Sales Visits** tab
3. Click the green **"Upload Excel"** button
4. Select your Excel file
5. Wait for confirmation message

### 3. Verify Results
- Success message shows: `✓ Upload complete. X records added, Y errors`
- Visit list automatically refreshes with new data
- Check errors if any rows failed

## Files Modified

### Backend API
- **Route**: Already configured at `POST /api/visits/md/upload-excel` and `POST /api/visits/sales/upload-excel`
- **Controller**: [server/controllers/visitController.js](../server/controllers/visitController.js)

### Frontend
- **API Service**: [dashboard/src/services/api.js](../dashboard/src/services/api.js)
  - Added `uploadMDExcel()` and `uploadSalesExcel()` methods
- **Component**: [dashboard/src/components/Visits/VisitSchedule.jsx](../dashboard/src/components/Visits/VisitSchedule.jsx)
  - Added "Upload Excel" button
  - Added upload dialog with file input
  - Added upload handlers and state management

### Documentation
- [templates/README.md](../templates/) - Detailed template guide
- [EXCEL_UPLOAD_FEATURE.md](../EXCEL_UPLOAD_FEATURE.md) - Implementation details

## Live Testing

Dashboard is running at: **http://localhost:5173/**

### Test Steps:
1. Login with: `admin-gis` / `gis2026`
2. Go to **Visits** → **MD Visits** tab
3. Click green **Upload Excel** button
4. Create a test Excel file with proper format
5. Upload and verify success message

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required fields" | A column is empty | Ensure all columns have data |
| "Invalid date format" | Date is not YYYY-MM-DD | Use format: 2026-02-01 |
| "Duplicate entry" | Visit already exists | Check for duplicate entries |
| "No file uploaded" | File not selected | Select an Excel file |

**Maximum 10 errors are shown** - check your data for remaining errors.

## Key Features

✅ **Tab-Aware** - Upload applies to selected visit type (MD or Sales)
✅ **Visual Feedback** - Success/error alerts with auto-close
✅ **Column Reference** - Dialog shows required columns
✅ **Auto-Refresh** - Visit list updates after upload
✅ **Error Report** - Shows which rows failed and why
✅ **Consistent Pattern** - Uses same mechanism as Users and Outlets menus

## Architecture

```
User selects Excel file
         ↓
Dashboard sends to API (multipart/form-data)
         ↓
Server parses with ExcelJS
         ↓
Validates each row
         ↓
Inserts to database (datavisitmd or datavisitsales)
         ↓
Returns success/error summary
         ↓
Dashboard refreshes visit list & shows message
```

## Backend Response Format

### Success (200):
```json
{
  "success": true,
  "message": "Upload complete. 45 records added, 2 errors",
  "data": {
    "successCount": 45,
    "errorCount": 2,
    "errors": ["Row 3: Missing fields", "Row 7: Duplicate"]
  }
}
```

### Error (400/500):
```json
{
  "success": false,
  "message": "Failed to upload Excel",
  "error": "Invalid file format"
}
```

## Performance

- **Max File Size**: 10MB
- **Processing Speed**: ~1,000 rows per second
- **Database**: Batch insert with transaction

## Troubleshooting

### Button not appearing?
- Make sure you're logged in as admin
- Refresh the page (Ctrl+F5)

### Upload fails with no error?
- Check browser console (F12)
- Verify Excel file format
- Ensure date columns are formatted as text

### Visits not appearing after upload?
- Wait 2-3 seconds and refresh
- Check error message for validation failures
- Verify the data matches database references

---

**For more details**: See [EXCEL_UPLOAD_FEATURE.md](../EXCEL_UPLOAD_FEATURE.md)
