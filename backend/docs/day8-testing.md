# Day 8 Testing Checklist

## Backend API Tests

### 1. Copy Generation API
- [ ] Test with beverages category
- [ ] Test with beauty category
- [ ] Test with electronics category
- [ ] Test all 5 style variations
- [ ] Verify 3 suggestions returned per request
- [ ] Check headline length < 50 chars
- [ ] Verify JSON structure correctness
- [ ] Test with missing product info
- [ ] Test with empty features array

### 2. Copy Validation API
- [ ] Test compliant copy (should pass)
- [ ] Test T&Cs text (should fail)
- [ ] Test competition language (should fail)
- [ ] Test unsubstantiated claims (should fail)
- [ ] Test green claims (should fail)
- [ ] Verify violation messages are clear
- [ ] Check suggestion alternatives provided

## Frontend Tests

### 3. Copy Suggestions UI
- [ ] Form validation (require product name)
- [ ] Category dropdown works
- [ ] Features input accepts comma-separated
- [ ] Style buttons toggle correctly
- [ ] Generate button disabled while loading
- [ ] Loading spinner shows during generation
- [ ] 3 suggestions render correctly
- [ ] Headlines display properly
- [ ] Subheads display properly
- [ ] Rationale text readable

### 4. Add to Canvas
- [ ] "Add" button adds headline to canvas
- [ ] "Add" button adds subhead to canvas
- [ ] Text appears centered on canvas
- [ ] Font sizes correct (48px headline, 24px subhead)
- [ ] Text enters edit mode after adding
- [ ] Multiple additions don't conflict

### 5. Copy to Clipboard
- [ ] Copy button copies headline
- [ ] Copy button copies subhead
- [ ] Toast notification shows success
- [ ] Clipboard contains exact text

### 6. Error Handling
- [ ] Missing product name shows error
- [ ] API failure shows error toast
- [ ] Invalid JSON handled gracefully
- [ ] Network timeout handled

## Integration Tests

### 7. Full Workflow
- [ ] Generate copy for product A
- [ ] Add headline to canvas
- [ ] Edit text on canvas
- [ ] Generate copy for product B
- [ ] Add subhead to canvas
- [ ] Both texts persist correctly
- [ ] Undo/redo works with added texts

### 8. Multi-Tab Workflow
- [ ] Switch to Copy tab
- [ ] Generate copy
- [ ] Switch to Layouts tab
- [ ] Return to Copy tab
- [ ] Suggestions still visible
- [ ] Form state preserved

## Performance Tests

### 9. Response Times
- [ ] Copy generation < 5 seconds
- [ ] Validation < 2 seconds
- [ ] UI remains responsive during API calls
- [ ] No memory leaks after multiple generations

## Edge Cases

### 10. Boundary Testing
- [ ] Very long product name (100+ chars)
- [ ] Empty features string
- [ ] Special characters in product name
- [ ] Non-English characters
- [ ] Extremely short product name (1 char)