# Excel Upload Templates

This directory contains template files for bulk uploading data via the Dashboard.

## Visit Templates

### MD Visits Template (datavisitmd_template.xlsx)
For uploading MD visit schedules. Required columns:

| Column | Description | Example |
|--------|-------------|---------|
| Username | Field staff username | user123 |
| AMO | Area/AMO identifier | Jakarta1 |
| Warehouse | Warehouse code | WH01 |
| ID Outlet | Outlet unique identifier | OUT001 |
| Nama Outlet | Outlet name | Toko Maju Jaya |
| Date Visit | Visit date (YYYY-MM-DD format) | 2026-02-01 |

**Notes:**
- All fields are required
- Date format must be YYYY-MM-DD
- Username must exist in datauser table
- ID Outlet must exist in dataoutlet table

### Sales Visits Template (datavisitsales_template.xlsx)
For uploading Sales visit schedules. Required columns:

| Column | Description | Example |
|--------|-------------|---------|
| Username | Field staff username | user456 |
| AMO | Area/AMO identifier | Surabaya1 |
| Warehouse | Warehouse code | WH02 |
| ID Outlet | Outlet unique identifier | OUT002 |
| Nama Outlet | Outlet name | Toko Maju Selaras |
| Date Visit | Visit date (YYYY-MM-DD format) | 2026-02-01 |

**Notes:**
- All fields are required
- Date format must be YYYY-MM-DD
- Username must exist in datauser table
- ID Outlet must exist in dataoutlet table

## User Template (datauser_template.xlsx)

For uploading user/staff data. Required columns:

| Column | Description | Example |
|--------|-------------|---------|
| Username | Unique username | john_doe |
| Nama | Full name | John Doe |
| Jabatan | Job title/Position | MD |
| AMO | Area/AMO | Jakarta1 |
| Warehouse | Warehouse code | WH01 |

## Outlet Template (dataoutlet_template.xlsx)

For uploading outlet/store data. Required columns:

| Column | Description | Example |
|--------|-------------|---------|
| Username | Admin username | admin-gis |
| AMO | Area/AMO | Jakarta1 |
| Warehouse | Warehouse code | WH01 |
| ID Outlet | Unique outlet ID | OUT001 |
| Nama Outlet | Outlet name | Toko Maju Jaya |
| Alamat Outlet | Outlet address | Jl. Merdeka No. 123 |
| Latitude | GPS latitude | -6.2088 |
| Longitude | GPS longitude | 106.8456 |

## Upload Process

1. Open the Dashboard and navigate to the desired menu (Users, Outlets, or Visits)
2. Click the **"Upload Excel"** button
3. Select a properly formatted Excel file
4. The system will:
   - Validate each row
   - Insert successful records to the database
   - Skip invalid rows (with error details)
5. A summary report shows success/error counts

## Error Handling

If a row has errors:
- Missing required fields → Skipped with "Missing required fields" error
- Invalid data format → Skipped with format error message
- Duplicate entry → Skipped with duplicate key error
- Foreign key violation → Skipped (referenced record doesn't exist)

**Maximum of 10 errors displayed** in the upload summary.

## Best Practices

1. **Backup first** - Save your database before bulk uploads
2. **Validate data** - Ensure all required fields are filled
3. **Check references** - Verify username and outlet IDs exist before uploading visits
4. **Use templates** - Start with provided templates to ensure correct column order
5. **Test first** - Try with a small subset of data before uploading large batches
