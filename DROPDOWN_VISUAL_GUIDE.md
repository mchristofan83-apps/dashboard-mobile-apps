# Visits Menu Dropdown Enhancement - Visual Guide

## Feature Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    VISITS MENU                               │
├──────────────────────────────────────────────────────────────┤
│  [Upload Excel]  [Add MD Visit]  [Add Sales Visit]          │
├──────────────────────────────────────────────────────────────┤
│ MD Visits │ Sales Visits                                     │
├──────────────────────────────────────────────────────────────┤
│ Username    │ AMO     │ Warehouse │ Outlet │ Nama Outlet   ││
├──────────────────────────────────────────────────────────────┤
│ john_doe    │ Jakarta1│ WH01      │ OUT001 │ Toko Maju     ││
│ jane_smith  │ Surabaya│ WH02      │ OUT002 │ Toko Sejahtera││
│ bob_wilson  │ Jakarta1│ WH01      │ OUT003 │ Toko Maju     ││
└──────────────────────────────────────────────────────────────┘
```

## Add/Edit Visit Dialog Flow

```
┌─────────────────────────────────────────┐
│   Add MD Visit / Add Sales Visit        │
├─────────────────────────────────────────┤
│                                         │
│ Username *          ▼                   │
│ ┌──────────────────────────────────┐   │
│ │ -- Select Username --            │   │  ← Dropdown opens
│ │ john_doe - John Doe              │   │     showing all users
│ │ jane_smith - Jane Smith          │   │     from datauser
│ │ bob_wilson - Bob Wilson          │   │
│ │ ...                              │   │
│ └──────────────────────────────────┘   │
│                                         │
│         After selecting john_doe:      │
│                                         │
│ Username: john_doe                      │
│ AMO:      Jakarta1    [auto-filled]     │  ← Auto-fills from
│ Warehouse: WH01       [auto-filled]     │     user record
│                                         │
│ ID Outlet *         ▼                   │
│ ┌──────────────────────────────────┐   │
│ │ -- Select Outlet --              │   │  ← Dropdown opens
│ │ OUT001 - Toko Maju Jaya         │   │     showing all outlets
│ │ OUT002 - Toko Sejahtera         │   │     from dataoutlet
│ │ OUT003 - Toko Maju Selaras      │   │
│ │ ...                              │   │
│ └──────────────────────────────────┘   │
│                                         │
│         After selecting OUT001:        │
│                                         │
│ ID Outlet:   OUT001                     │
│ Nama Outlet: Toko Maju Jaya [auto]     │  ← Auto-fills from
│                                         │     outlet record
│ Date Visit:  [calendar picker]          │  ← Manual entry
│              2026-02-01                 │
│                                         │
├─────────────────────────────────────────┤
│         [Cancel]        [Save]          │
└─────────────────────────────────────────┘
```

## Data Auto-Fill Behavior

### When Username is Selected

```
User Selects: john_doe
              ↓
   Find user record with username = john_doe
              ↓
   Extract: amo='Jakarta1', warehouse='WH01'
              ↓
   Set: formData.amo = 'Jakarta1'
        formData.warehouse = 'WH01'
              ↓
   Display: AMO field shows "Jakarta1" (disabled)
            Warehouse field shows "WH01" (disabled)
```

### When Outlet is Selected

```
User Selects: OUT001
              ↓
   Find outlet record with idoutlet = OUT001
              ↓
   Extract: namaoutlet='Toko Maju Jaya'
              ↓
   Set: formData.namaoutlet = 'Toko Maju Jaya'
              ↓
   Display: Nama Outlet shows "Toko Maju Jaya" (disabled)
```

## Component Architecture

```
┌─────────────────────────────────────────────────┐
│         VisitSchedule Component                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  State:                                         │
│  ├─ users []          ← from userAPI.getAll()   │
│  ├─ outlets []        ← from outletAPI.getAll() │
│  ├─ mdVisits []       ← from visitAPI.getMD()   │
│  ├─ salesVisits []    ← from visitAPI.getSales()│
│  ├─ formData {}       ← current form values     │
│  └─ ...loading, error, dialogs...              │
│                                                 │
│  Handlers:                                      │
│  ├─ handleUsernameChange()                      │
│  │  └─ Updates: username, amo, warehouse       │
│  │                                              │
│  ├─ handleOutletChange()                        │
│  │  └─ Updates: idoutlet, namaoutlet            │
│  │                                              │
│  ├─ handleOpenDialog()                          │
│  ├─ handleCloseDialog()                         │
│  ├─ handleSubmit()                              │
│  ├─ handleDelete()                              │
│  └─ ... other handlers                          │
│                                                 │
│  UI Components:                                 │
│  ├─ Visit Table (MD/Sales tabs)                │
│  ├─ Add/Edit Dialog                            │
│  │  ├─ Username Select (dropdown)               │
│  │  ├─ AMO TextField (disabled)                │
│  │  ├─ Warehouse TextField (disabled)          │
│  │  ├─ ID Outlet Select (dropdown)             │
│  │  ├─ Nama Outlet TextField (disabled)        │
│  │  └─ Date Visit DateInput                    │
│  └─ Upload Dialog                              │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
                        VisitSchedule
                             │
                    ┌────────┼────────┐
                    ↓        ↓        ↓
              loadData() → All 4 API calls in parallel
                    ↓        ↓        ↓
           getMD()─┘         │        └─getAll() users
           getSales()────────┼────────getAll() outlets
                    ↓        ↓        ↓
                    └────────┴────────┘
                             ↓
         ┌────────────────────┼────────────────────┐
         ↓                    ↓                    ↓
    mdVisits[]         salesVisits[]          users[]
    in state           in state               in state
                                              outlets[]
         ↓                    ↓                in state
         │                    │                    │
         └──────── Render Tables with data ───────┘
         
User clicks "Add Visit"
         ↓
Dialog opens with dropdowns
         ↓
Dropdowns populated from:
  ├─ Username: users[] array
  └─ ID Outlet: outlets[] array
         ↓
User selects username
         ↓
handleUsernameChange() called
  ├─ Find user in users[]
  └─ Extract amo, warehouse
         ↓
formData updated
  └─ UI re-renders (auto-fill visible)
         ↓
User selects outlet
         ↓
handleOutletChange() called
  ├─ Find outlet in outlets[]
  └─ Extract namaoutlet
         ↓
formData updated
  └─ UI re-renders (auto-fill visible)
         ↓
User enters date & clicks Save
         ↓
handleSubmit() called
  └─ POST /api/visits/md or /api/visits/sales
         ↓
Visit created in database
         ↓
loadVisits() refreshes visit lists
         ↓
Tables update with new data
```

## Form Field States

```
┌─────────────────────┬──────────┬─────────────────────────┐
│ Field               │ Type     │ Data Source             │
├─────────────────────┼──────────┼─────────────────────────┤
│ Username *          │ Select   │ users[] array           │
│ (required)          │ Dropdown │ from userAPI.getAll()   │
│                     │          │ Format: user - name     │
├─────────────────────┼──────────┼─────────────────────────┤
│ AMO                 │ Text     │ Auto-filled from user   │
│ (disabled/readonly) │ Disabled │ Updated by handleUsers  │
├─────────────────────┼──────────┼─────────────────────────┤
│ Warehouse           │ Text     │ Auto-filled from user   │
│ (disabled/readonly) │ Disabled │ Updated by handleUsers  │
├─────────────────────┼──────────┼─────────────────────────┤
│ ID Outlet *         │ Select   │ outlets[] array         │
│ (required)          │ Dropdown │ from outletAPI.getAll() │
│                     │          │ Format: id - name       │
├─────────────────────┼──────────┼─────────────────────────┤
│ Nama Outlet         │ Text     │ Auto-filled from outlet │
│ (disabled/readonly) │ Disabled │ Updated by handleOutlet │
├─────────────────────┼──────────┼─────────────────────────┤
│ Date Visit          │ Date     │ User input              │
│ (required)          │ Picker   │ Format: YYYY-MM-DD      │
└─────────────────────┴──────────┴─────────────────────────┘
```

## Interaction Timeline

```
Timeline of User Interaction:

1. Page loads
   └─ Component mounts
      └─ loadData() fires
         ├─ GET /api/visits/md
         ├─ GET /api/visits/sales
         ├─ GET /api/users → users state = [john, jane, bob...]
         └─ GET /api/outlets → outlets state = [OUT001, OUT002...]

2. Admin clicks "Add MD Visit"
   └─ Dialog opens
      └─ Dropdowns rendered from state arrays

3. Admin clicks Username dropdown
   └─ Shows all users: john_doe, jane_smith, bob_wilson...

4. Admin selects "john_doe"
   └─ handleUsernameChange() fires
      ├─ Finds john_doe in users[]
      ├─ Extracts amo='Jakarta1', warehouse='WH01'
      └─ Updates formData
         └─ UI re-renders
            └─ AMO field shows "Jakarta1"
            └─ Warehouse field shows "WH01"

5. Admin clicks ID Outlet dropdown
   └─ Shows all outlets: OUT001, OUT002, OUT003...

6. Admin selects "OUT001"
   └─ handleOutletChange() fires
      ├─ Finds OUT001 in outlets[]
      ├─ Extracts namaoutlet='Toko Maju Jaya'
      └─ Updates formData
         └─ UI re-renders
            └─ Nama Outlet shows "Toko Maju Jaya"

7. Admin enters date "2026-02-01"

8. Admin clicks Save
   └─ handleSubmit() fires
      └─ POST /api/visits/md with data
         ├─ username: john_doe
         ├─ amo: Jakarta1
         ├─ warehouse: WH01
         ├─ idoutlet: OUT001
         ├─ namaoutlet: Toko Maju Jaya
         └─ datevisit: 2026-02-01
            └─ Visit created in database
               └─ loadVisits() refreshes tables
                  └─ New visit appears in MD Visits table
```

## Comparison: Before vs After

### Before (Text Input)
```
Admin must know/remember:
- Exact username: "john_doe" ✗ Prone to typos
- Exact outlet ID: "OUT001" ✗ Could forget or mistype
- Must type values manually ✗ Time consuming

Risk of errors:
- Typo in username → Invalid reference ✗
- Typo in outlet ID → Duplicate entry ✗
- Wrong warehouse → Data inconsistency ✗
```

### After (Dropdowns)
```
Admin just selects:
- Choose from username list ✓ No typos possible
- Choose from outlet list ✓ Guaranteed valid
- Auto-fill handles related data ✓ No manual entry

Guaranteed consistency:
- Valid username ✓ Database enforces it
- Valid outlet ✓ Database enforces it
- Matching amo/warehouse ✓ Always from user record
- Matching outlet name ✓ Always from outlet record
```

---

**Visual aids to understand the dropdown enhancement in Visits menu.**
