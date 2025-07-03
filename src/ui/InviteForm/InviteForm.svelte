<script lang="ts">
  import Input from '@/ui/Input/Input.svelte';
  import RoleDropdown from '@/components/RoleDropdown/RoleDropdown.svelte';
  import DeleteIcon from '@/assets/icons/DeleteIcon.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  // Initial state
  export let rows = [{ id: 1, email: '', role: { id: '', name: '' } }];
  export let maxRows;

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
          on:input={() => handleEmailChange(row.id)}
        />
      </div>

      <!-- Role Dropdown with matching container -->
      <div class="min-h-[50px] flex-1">
        <RoleDropdown
          selected={row.role}
          placeholder="Select role"
          showDescription={false}
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
