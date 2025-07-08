<script lang="ts">
  import Input from '@/ui/Input/Input.svelte';
  import RoleDropdown from '@/components/RoleDropdown/RoleDropdown.svelte';
  import DeleteIcon from '@/assets/icons/DeleteIcon.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  // Initial state
  export let rows = [{ id: 1, email: '', role: { id: '', name: '' } }];
  export let maxRows;
  let errors = {};

  export function validate() {
    let newErrors = {};
    let hasErrors = false;

    // First pass: Check for duplicate emails
    const emailMap = new Map(); // Maps email to row ID of first occurrence

    // Identify duplicate emails without setting errors yet
    rows.forEach((row) => {
      if (row.email?.trim()) {
        const normalizedEmail = row.email.trim().toLowerCase();
        if (!emailMap.has(normalizedEmail)) {
          // Store first occurrence
          emailMap.set(normalizedEmail, row.id);
        }
      }
    });

    // Main validation loop
    rows.forEach((row) => {
      // Skip completely empty rows
      if (!row.email && !row.role.id) return;

      const rowErrors = {};

      // Check for duplicate email - only mark the later duplicates
      if (row.email?.trim()) {
        const normalizedEmail = row.email.trim().toLowerCase();
        const firstOccurrenceId = emailMap.get(normalizedEmail);

        // If this isn't the first occurrence of this email, mark it as duplicate
        if (firstOccurrenceId !== row.id) {
          rowErrors.email = 'Email is already added';
          hasErrors = true;
        }
      }

      // If one field is filled but the other isn't, show error
      if (row.email && !row.role.id) {
        rowErrors.role = 'Please select a role';
        hasErrors = true;
      }

      if (!row.email && row.role.id) {
        rowErrors.email = 'Please enter an email';
        hasErrors = true;
      }

      // Add email format validation (only if not already marked as duplicate)
      if (row.email && !rowErrors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        rowErrors.email = 'Please enter a valid email address';
        hasErrors = true;
      }

      if (Object.keys(rowErrors).length > 0) {
        newErrors[row.id] = rowErrors;
      }
    });

    // Create a new object reference to ensure reactivity
    errors = { ...newErrors };

    // Force component update if needed
    rows = [...rows];

    return !hasErrors;
  }

  function canAddRow() {
    // If maxRows is 0 or 1, never allow more than one row
    if (maxRows === 0 || maxRows === 1) return false;
    // If maxRows is undefined, allow unlimited
    if (!maxRows) return true;
    // Otherwise, check against maxRows
    return rows.length < maxRows;
  }

  // Handle email changes (for adding new rows)
  function handleEmailChange(id) {
    if (errors[id]) {
      errors = {
        ...errors,
        [id]: { ...errors[id], email: null },
      };
    }
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    const isLastRow = id === Math.max(...rows.map((r) => r.id));
    if (row.email?.trim() && isLastRow && canAddRow()) {
      const newId = Math.max(...rows.map((r) => r.id)) + 1;
      rows = [...rows, { id: newId, email: '', role: { id: '', name: '' } }];
    }
    dispatch('change', rows);
  }

  function handleRoleChange(id, selectedRole) {
    if (errors[id]?.role) {
      errors = {
        ...errors,
        [id]: { ...errors[id], role: null },
      };
    }
    const isLastRow = id === Math.max(...rows.map((r) => r.id));
    if (selectedRole?.id && isLastRow && canAddRow()) {
      const newId = Math.max(...rows.map((r) => r.id)) + 1;
      rows = [...rows, { id: newId, email: '', role: { id: '', name: '' } }];
    }
    dispatch('change', rows);
  }

  // Remove a row
  function removeRow(id) {
    if (rows.length > 1) {
      rows = rows.filter((row) => row.id !== id);
      // Remove any errors for this row
      if (errors[id]) {
        delete errors[id];
        errors = { ...errors };
      }
      dispatch('change', rows);
    }
  }
</script>

<div class="">
  {#each rows as row (row.id)}
    <div class="flex items-start gap-4">
      <!-- Email Input with fixed height container -->
      <div class="min-h-[50px] flex-1">
        <Input
          placeholder="Enter Email ID"
          bind:value={row.email}
          type="email"
          inputType="email"
          hasError={Boolean(errors[row.id]?.email)}
          errorMessage={errors[row.id]?.email || ''}
          on:input={() => handleEmailChange(row.id)}
        />
      </div>

      <!-- Role Dropdown with matching container -->
      <div class="min-h-[50px] flex-1">
        <RoleDropdown
          selected={row.role}
          placeholder="Select role"
          showDescription={false}
          hasError={Boolean(errors[row.id]?.role)}
          errorMessage={errors[row.id]?.role || ''}
          on:change={(e) => {
            row.role = e.detail;
            handleRoleChange(row.id, e.detail);
          }}
        />
      </div>

      <!-- Delete Button aligned with inputs not error messages -->
      <div class="flex min-h-[50px] w-10 items-center justify-center">
        {#if rows.length > 1}
          <button
            on:click={() => removeRow(row.id)}
            class="hover:bg-surface-500 rounded-lg p-3 text-red-400 transition-colors hover:text-red-300"
            title="Remove row"
          >
            <DeleteIcon />
          </button>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  /* Ensure all form fields maintain alignment */
  :global(.form-field) {
    min-height: 70px;
    display: flex;
    flex-direction: column;
  }
</style>
