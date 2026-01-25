# Visits Menu with Dropdowns - User Guide

## What's New

The Visits menu now displays **user and outlet data as dropdowns** instead of free-text fields. This makes it easier to select the correct data and prevents errors.

## How It Works

### When You Click "Add Visit"

A dialog opens with the following form:

```
┌─────────────────────────────────────────┐
│   Add MD Visit / Add Sales Visit        │
├─────────────────────────────────────────┤
│ Username *           [Dropdown ▼]       │
│ AMO                  [Read-only field]  │
│ Warehouse            [Read-only field]  │
│ ID Outlet *          [Dropdown ▼]       │
│ Nama Outlet          [Read-only field]  │
│ Date Visit           [Date picker]      │
├─────────────────────────────────────────┤
│  [Cancel]            [Save]             │
└─────────────────────────────────────────┘
```

## Step-by-Step Process

### 1. Select Username
Click the **Username** dropdown to see all available field staff:

```
▼ Username *
  ├─ john_doe - John Doe
  ├─ jane_smith - Jane Smith
  ├─ bob_wilson - Bob Wilson
  └─ ... more users ...
```

**What happens when you select:**
- Username is set to selected value
- **AMO auto-fills** from that user's record
- **Warehouse auto-fills** from that user's record

### 2. AMO & Warehouse (Auto-Filled)
These fields are **read-only** (grayed out) because they're automatically filled based on the username you selected.

**Example:**
```
Username: john_doe → AMO: Jakarta1, Warehouse: WH01
```

### 3. Select ID Outlet
Click the **ID Outlet** dropdown to see all available outlets:

```
▼ ID Outlet *
  ├─ OUT001 - Toko Maju Jaya
  ├─ OUT002 - Toko Sejahtera
  ├─ OUT003 - Toko Maju Selaras
  └─ ... more outlets ...
```

**What happens when you select:**
- ID Outlet is set to selected value
- **Nama Outlet auto-fills** from that outlet's record

### 4. Nama Outlet (Auto-Filled)
This field is **read-only** because it's automatically filled based on the outlet you selected.

**Example:**
```
ID Outlet: OUT001 → Nama Outlet: Toko Maju Jaya
```

### 5. Enter Date Visit
Use the date picker to select when the visit should occur:

```
Date Visit: [calendar] 2026-02-01
```

Format: **YYYY-MM-DD** (e.g., 2026-02-15)

### 6. Save
Click **Save** to add the visit to the system.

## Benefits

✅ **Less Typing** - Select from dropdown instead of typing  
✅ **No Mistakes** - Can't enter invalid username or outlet  
✅ **Auto-Fill** - Related fields fill automatically  
✅ **Consistency** - Data matches exactly what's in database  
✅ **Clear Options** - See full list of available choices  

## Common Tasks

### Add a New MD Visit
1. Go to **Visits** menu
2. Select **MD Visits** tab
3. Click **"Add MD Visit"** button
4. Fill in username (↓ dropdown), outlet (↓ dropdown), date
5. Click **Save**

### Add a New Sales Visit
1. Go to **Visits** menu
2. Select **Sales Visits** tab
3. Click **"Add Sales Visit"** button
4. Fill in username (↓ dropdown), outlet (↓ dropdown), date
5. Click **Save**

### Edit Existing Visit
1. Find the visit in the table
2. Click the **Edit** (pencil) icon
3. Update fields as needed:
   - Can change username → AMO/Warehouse auto-update
   - Can change outlet → Nama Outlet auto-updates
   - Can change date
4. Click **Save**

### Delete a Visit
1. Find the visit in the table
2. Click the **Delete** (trash) icon
3. Confirm deletion

### Bulk Upload Multiple Visits
1. Click **"Upload Excel"** button
2. Select Excel file with columns: Username | AMO | Warehouse | ID Outlet | Nama Outlet | Date Visit
3. File will import all visits at once

## Troubleshooting

### "Username dropdown is empty"
- No users exist in the system
- **Solution**: Go to **Users** menu and add users first

### "ID Outlet dropdown is empty"
- No outlets exist in the system
- **Solution**: Go to **Outlets** menu and add outlets first

### AMO/Warehouse fields not filling
- Username field is empty
- **Solution**: Select a username first

### Nama Outlet field not filling
- ID Outlet field is empty
- **Solution**: Select an outlet first

### Can't find username I need
- User might not be added to system yet
- **Solution**: Go to **Users** menu → **"Add User"** or **"Upload Excel"**

### Can't find outlet I need
- Outlet might not be added to system yet
- **Solution**: Go to **Outlets** menu → **"Add Outlet"** or **"Upload Excel"**

## Excel Upload Requirements

If uploading visits in bulk, Excel file must have these columns in order:

| Column | Source | Format |
|--------|--------|--------|
| Username | User Dropdown | Must exist in Users |
| AMO | Auto-filled | From User record |
| Warehouse | Auto-filled | From User record |
| ID Outlet | Outlet Dropdown | Must exist in Outlets |
| Nama Outlet | Auto-filled | From Outlet record |
| Date Visit | Date picker | YYYY-MM-DD |

**Example Excel file:**
```
Username   | AMO      | Warehouse | ID Outlet | Nama Outlet     | Date Visit
john_doe   | Jakarta1 | WH01      | OUT001    | Toko Maju Jaya  | 2026-02-01
jane_smith | Surabaya1| WH02      | OUT002    | Toko Sejahtera  | 2026-02-05
```

## Tips for Best Results

1. **Add users first** before scheduling visits
2. **Add outlets first** before scheduling visits
3. **Use dropdowns** instead of typing to avoid errors
4. **Verify data** before saving
5. **Check related data** exists before bulk uploading

## Data Sources

| Field | Comes From | Updated By |
|-------|-----------|-----------|
| Username options | Users menu | Add/Edit User |
| AMO value | Selected user's record | Edit User |
| Warehouse value | Selected user's record | Edit User |
| ID Outlet options | Outlets menu | Add/Edit Outlet |
| Nama Outlet value | Selected outlet's record | Edit Outlet |

---

**Need help?** Check the main Dashboard documentation or contact your admin.
