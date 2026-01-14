# Software Display Updates Design

## Overview

Improve the display of software information in search results and work detail modals.

## Changes

### 1. WorkCard.tsx - Add "Software" Button

Add a "Software" button in the button row at the bottom of the search result card.

**Location:** Button row (lines 179-206)

**Behavior:**
- Shows only when `software_repository` exists
- Positioned first in the button row (before "Related Work")
- Opens the software repository URL in a new tab

**Note:** The existing code icon in the metadata row (lines 104-115) remains unchanged as a quick visual indicator.

### 2. WorkDetailModal.tsx - Rename "Repository" Heading

Change the heading from "Repository" to "Software Repository" for clarity.

**Location:** Lines 111-127

### 3. WorkDetailModal.tsx - Rename "Software" Section

Change the bottom section heading from "Software" to "Software References".

**Location:** Lines 208-209

## Files Affected

- `src/components/WorkCard.tsx`
- `src/components/WorkDetailModal.tsx`

## Implementation Notes

- All changes are text/label updates and conditional button additions
- No data model changes required
- Existing styling patterns reused
